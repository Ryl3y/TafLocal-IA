"""
Services IA de TafLocal IA (couche Django du moteur interne).

Ce module remplace l'ancienne intégration Google Gemini : toutes les
fonctionnalités (analyse de CV, recommandations, classement des
candidatures, simulation d'entretien, lettre de motivation) s'exécutent
localement grâce au paquet ``ai.engine``.
"""

import logging
from collections import Counter
from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

from .engine import ENGINE_NAME, ENGINE_VERSION
from .engine.cover_letter import CoverLetterInput, generate_cover_letter
from .engine.cv_analyzer import analyze_cv_text
from .engine.cv_parser import CVParsingError, education_level_from_text, extract_text
from .engine.interview import evaluate_answer, generate_questions, summarize_session
from .engine.matching import CandidateData, JobData, compute_match
from .engine.skills import (
    SKILL_TAXONOMY,
    canonical_skill_name,
    extract_skill_names,
    extract_skills,
    skill_category,
)
from .models import MatchResult

logger = logging.getLogger(__name__)


def engine_settings() -> dict:
    defaults = {
        "MATCH_CACHE_TTL": 3600,
        "INTERVIEW_DEFAULT_QUESTIONS": 6,
        "MAX_JOBS_SCANNED": 500,
        "USE_CELERY": False,
    }
    return {**defaults, **getattr(settings, "AI_ENGINE", {})}


class AIServiceError(Exception):
    """Erreur métier remontée à l'API avec un code HTTP explicite."""

    status_code = 400

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        if status_code:
            self.status_code = status_code


# --------------------------------------------------------------------------- #
# Référentiel de compétences
# --------------------------------------------------------------------------- #

class SkillService:
    @staticmethod
    def get_or_create(name: str):
        from users.models import Skill

        canonical = canonical_skill_name(name)
        if not canonical:
            return None
        skill = Skill.objects.filter(nom__iexact=canonical).first()
        if skill:
            return skill
        return Skill.objects.create(nom=canonical[:100], categorie=skill_category(canonical))

    @staticmethod
    def set_job_skills(job, names: list[str]):
        skills = [s for s in (SkillService.get_or_create(n) for n in names) if s]
        job.competences_requises.set(skills)

    @staticmethod
    def search(query: str = "", limit: int = 20) -> list[dict]:
        from users.models import Skill

        from .engine.text import normalize

        query_n = normalize(query)
        results: dict[str, dict] = {}
        for name, (category, aliases) in SKILL_TAXONOMY.items():
            if not query_n or query_n in normalize(name) or any(query_n in a for a in aliases):
                results[name.lower()] = {"nom": name, "categorie": category}
        db_skills = Skill.objects.all()
        if query_n:
            db_skills = db_skills.filter(nom__icontains=query)
        for skill in db_skills[:limit]:
            results.setdefault(skill.nom.lower(), {"nom": skill.nom, "categorie": skill.categorie})
        ordered = sorted(results.values(), key=lambda s: (not normalize(s["nom"]).startswith(query_n), s["nom"]))
        return ordered[:limit]


# --------------------------------------------------------------------------- #
# Construction des données d'entrée du moteur
# --------------------------------------------------------------------------- #

def latest_cv_analysis(candidate):
    from cv_analysis.models import AnalysisStatus, CVAnalysis

    return (
        CVAnalysis.objects.filter(cv__candidate=candidate, status=AnalysisStatus.COMPLETED)
        .select_related("cv")
        .prefetch_related("detected_skills")
        .order_by("-analyzed_at")
        .first()
    )


def build_candidate_data(candidate) -> CandidateData:
    """Rassembler profil déclaré + CV analysé en une seule vue pour le moteur."""
    skills: dict[str, str] = {}
    analysis = latest_cv_analysis(candidate)
    if analysis:
        for detected in analysis.detected_skills.all():
            skills[canonical_skill_name(detected.name)] = detected.proficiency_level or "INTERMEDIAIRE"
    # Les compétences déclarées par le candidat priment sur celles détectées.
    for candidate_skill in candidate.competences.select_related("skill"):
        skills[canonical_skill_name(candidate_skill.skill.nom)] = candidate_skill.niveau

    experiences = list(candidate.experiences.all())
    formations = list(candidate.formations.all())

    if experiences:
        experience_years = candidate.experience_annees
    elif analysis and analysis.experience_years:
        experience_years = analysis.experience_years
    else:
        experience_years = 0.0

    levels = [education_level_from_text(f"{f.diplome} {f.description or ''}")[0] for f in formations]
    levels = [lvl for lvl in levels if lvl is not None]
    if not levels and analysis and analysis.education_level:
        level, _ = education_level_from_text(analysis.education_level)
        if level is not None:
            levels = [level]

    text_parts = [candidate.biographie or ""]
    text_parts += [f"{e.poste} {e.entreprise} {e.description or ''}" for e in experiences]
    text_parts += [f"{f.diplome} {f.etablissement} {f.description or ''}" for f in formations]
    if analysis and analysis.cv.extracted_text:
        text_parts.append(analysis.cv.extracted_text[:8000])

    return CandidateData(
        skills=skills,
        experience_years=float(experience_years or 0),
        city=candidate.ville,
        education_level=max(levels) if levels else None,
        text="\n".join(p for p in text_parts if p),
        job_titles=[e.poste for e in experiences],
    )


def build_job_data(job) -> JobData:
    return JobData(
        title=job.titre,
        description=job.description or "",
        requirements=job.exigences or "",
        skills=[s.nom for s in job.competences_requises.all()],
        required_experience=job.experience_requise,
        location=job.localisation,
        education=job.niveau_etude,
    )


def jobs_with_skills(queryset):
    from users.models import Skill

    return queryset.select_related("entreprise").prefetch_related(
        Prefetch("competences_requises", queryset=Skill.objects.only("id", "nom"))
    )


# --------------------------------------------------------------------------- #
# Matching, recommandations et classement
# --------------------------------------------------------------------------- #

class MatchingService:
    """Compatibilité candidat ↔ offre avec cache persistant."""

    @staticmethod
    def _is_fresh(result: MatchResult) -> bool:
        ttl = engine_settings()["MATCH_CACHE_TTL"]
        return result.computed_at >= timezone.now() - timedelta(seconds=ttl)

    @staticmethod
    def _serialize(score: int, details: dict, cached: bool) -> dict:
        return {**details, "score": score, "cached": cached}

    @classmethod
    def get_match(cls, candidate, job, *, candidate_data: CandidateData | None = None,
                  refresh: bool = False) -> dict:
        if not refresh:
            cached = MatchResult.objects.filter(candidate=candidate, job=job).first()
            if cached and cls._is_fresh(cached):
                return cls._serialize(cached.score, cached.details, True)
        candidate_data = candidate_data or build_candidate_data(candidate)
        outcome = compute_match(candidate_data, build_job_data(job))
        score = outcome.pop("score")
        MatchResult.objects.update_or_create(
            candidate=candidate, job=job, defaults={"score": score, "details": outcome}
        )
        return cls._serialize(score, outcome, False)

    @classmethod
    def _match_many(cls, candidate, jobs: list, candidate_data=None, refresh=False) -> dict:
        """Retourner {job_id: match} en ne recalculant que ce qui est nécessaire."""
        results: dict = {}
        if not refresh:
            existing = MatchResult.objects.filter(candidate=candidate, job_id__in=[j.id for j in jobs])
            for result in existing:
                if cls._is_fresh(result):
                    results[result.job_id] = cls._serialize(result.score, result.details, True)
        to_compute = [job for job in jobs if job.id not in results]
        if to_compute:
            candidate_data = candidate_data or build_candidate_data(candidate)
            new_rows = []
            for job in to_compute:
                outcome = compute_match(candidate_data, build_job_data(job))
                score = outcome.pop("score")
                results[job.id] = cls._serialize(score, outcome, False)
                new_rows.append(MatchResult(candidate=candidate, job=job, score=score, details=outcome))
            MatchResult.objects.bulk_create(
                new_rows,
                update_conflicts=True,
                unique_fields=["candidate", "job"],
                update_fields=["score", "details", "computed_at"],
            )
        return results

    @classmethod
    def recommend_jobs(cls, candidate, *, limit: int | None = None, min_score: int = 0,
                       refresh: bool = False) -> list[dict]:
        from applications.models import Application
        from jobs.models import Job, JobStatus

        now = timezone.now()
        jobs = list(
            jobs_with_skills(
                Job.objects.filter(statut=JobStatus.PUBLISHED)
                .filter(Q(date_expiration__isnull=True) | Q(date_expiration__gt=now))
            ).order_by("-date_publication")[: engine_settings()["MAX_JOBS_SCANNED"]]
        )
        if not jobs:
            return []
        matches = cls._match_many(candidate, jobs, refresh=refresh)
        applied = set(Application.objects.filter(candidate=candidate).values_list("offre_id", flat=True))
        recommendations = []
        for job in jobs:
            match = matches[job.id]
            if match["score"] < min_score:
                continue
            recommendations.append({"job": job, "match": match, "already_applied": job.id in applied})
        recommendations.sort(key=lambda r: (-r["match"]["score"], -r["job"].date_publication.timestamp()))
        return recommendations[:limit] if limit else recommendations

    @classmethod
    def rank_applications(cls, applications, *, refresh: bool = False) -> list[dict]:
        """Classer des candidatures par compatibilité décroissante (indicatif)."""
        applications = list(applications)
        by_candidate: dict = {}
        for application in applications:
            by_candidate.setdefault(application.candidate_id, []).append(application)

        ranked = []
        for applications_of_candidate in by_candidate.values():
            candidate = applications_of_candidate[0].candidate
            jobs = [a.offre for a in applications_of_candidate]
            matches = cls._match_many(candidate, jobs, refresh=refresh)
            for application in applications_of_candidate:
                ranked.append({"application": application, "match": matches[application.offre_id]})
        ranked.sort(key=lambda r: (-r["match"]["score"], r["application"].date_candidature))
        for position, item in enumerate(ranked, start=1):
            item["rang"] = position
        return ranked


# --------------------------------------------------------------------------- #
# Analyse de CV
# --------------------------------------------------------------------------- #

class CVAnalysisService:
    MARKET_CACHE_KEY = "ai:market_skills"

    @classmethod
    def market_skills(cls) -> Counter:
        """Compétences les plus demandées dans les offres publiées (mise en cache 10 min)."""
        counter = cache.get(cls.MARKET_CACHE_KEY)
        if counter is not None:
            return counter
        from jobs.models import Job, JobStatus

        counter = Counter()
        jobs = jobs_with_skills(Job.objects.filter(statut=JobStatus.PUBLISHED))[:300]
        for job in jobs:
            names = [s.nom for s in job.competences_requises.all()]
            if not names:
                names = extract_skill_names(f"{job.titre}\n{job.description}\n{job.exigences or ''}")
            counter.update({canonical_skill_name(n) for n in names})
        cache.set(cls.MARKET_CACHE_KEY, counter, 600)
        return counter

    @classmethod
    def analyze(cls, cv, *, notify: bool = True):
        """Lire le fichier, analyser le CV et enregistrer les résultats."""
        from cv_analysis.models import (
            AIRecommendation,
            AnalysisStatus,
            CVAnalysis,
            DetectedSkill,
            MissingSkill,
        )

        try:
            with cv.file.open("rb") as handle:
                text = extract_text(handle, cv.file_name or cv.file.name)
        except (CVParsingError, FileNotFoundError, OSError) as exc:
            return cls._mark_failed(cv, str(exc) or "Fichier illisible.")

        if len(text.strip()) < 30:
            return cls._mark_failed(
                cv,
                "Aucun texte exploitable n'a été trouvé. Le CV est peut-être une image scannée : "
                "utilisez un PDF ou un DOCX contenant du texte.",
            )

        result = analyze_cv_text(text, cls.market_skills())

        with transaction.atomic():
            cv.extracted_text = text
            cv.is_processed = True
            cv.save(update_fields=["extracted_text", "is_processed", "updated_at"])

            analysis, _ = CVAnalysis.objects.update_or_create(
                cv=cv,
                defaults={
                    "employability_score": result.employability_score,
                    "strengths": result.strengths,
                    "weaknesses": result.weaknesses,
                    "recommendations_data": result.recommendations,
                    "score_details": {
                        **result.score_details,
                        "contacts": result.contacts,
                        "sections": result.sections,
                        "word_count": result.word_count,
                    },
                    "summary": result.summary,
                    "experience_years": result.experience_years,
                    "education_level": result.education_label,
                    "status": AnalysisStatus.COMPLETED,
                    "error_message": "",
                },
            )
            analysis.detected_skills.all().delete()
            analysis.missing_skills.all().delete()
            analysis.recommendations.all().delete()
            DetectedSkill.objects.bulk_create([
                DetectedSkill(
                    analysis=analysis,
                    name=s["name"][:100],
                    category=s["category"],
                    proficiency_level=s["proficiency_level"],
                    years_experience=s["years_experience"],
                )
                for s in result.detected_skills
            ])
            MissingSkill.objects.bulk_create([
                MissingSkill(analysis=analysis, name=m["name"][:100], importance=m["importance"])
                for m in result.missing_skills
            ])
            AIRecommendation.objects.bulk_create([
                AIRecommendation(
                    analysis=analysis,
                    category=r["category"],
                    title=r["title"][:200],
                    description=r["description"],
                    priority=r["priority"],
                )
                for r in result.recommendations
            ])

        if notify:
            from notifications.models import NotificationType
            from notifications.services import NotificationService

            NotificationService.notify(
                cv.candidate.user,
                NotificationType.PROFILE,
                "Analyse de CV terminée",
                f"Votre CV « {cv.file_name} » a obtenu un score d'employabilité de "
                f"{result.employability_score}/100.",
            )
        return analysis

    @staticmethod
    def _mark_failed(cv, message: str):
        from cv_analysis.models import AnalysisStatus, CVAnalysis

        logger.info("Analyse du CV %s impossible : %s", cv.pk, message)
        cv.is_processed = False
        cv.save(update_fields=["is_processed", "updated_at"])
        analysis, _ = CVAnalysis.objects.update_or_create(
            cv=cv,
            defaults={"status": AnalysisStatus.FAILED, "error_message": message, "employability_score": 0},
        )
        return analysis

    @classmethod
    def analyze_async_or_sync(cls, cv):
        """Utiliser Celery si activé, sinon analyser immédiatement (cas par défaut)."""
        if engine_settings()["USE_CELERY"]:
            from .tasks import analyze_cv_task

            analyze_cv_task.delay(cv.pk)
            return None
        return cls.analyze(cv)


# --------------------------------------------------------------------------- #
# Simulation d'entretien
# --------------------------------------------------------------------------- #

class InterviewService:
    @staticmethod
    @transaction.atomic
    def create_session(candidate, *, job=None, interview_type: str = "MIXED", count: int | None = None):
        from interviews.models import InterviewQuestion, InterviewSession, InterviewStatus

        count = count or engine_settings()["INTERVIEW_DEFAULT_QUESTIONS"]
        session = InterviewSession.objects.create(
            candidate=candidate,
            offre=job,
            type_entretien=interview_type,
            date_session=timezone.now(),
            statut=InterviewStatus.SCHEDULED,
        )
        candidate_data = build_candidate_data(candidate)
        if job is not None:
            job_data = build_job_data(job)
            job_skills, _ = job_data.effective_skills()
            title, company = job.titre, job.entreprise.nom_entreprise
        else:
            job_skills = list(candidate_data.skills)[:6]
            title = candidate_data.job_titles[0] if candidate_data.job_titles else None
            company = None

        questions = generate_questions(
            job_title=title,
            company=company,
            job_skills=job_skills,
            candidate_skills=list(candidate_data.skills),
            interview_type=interview_type,
            count=count,
            seed=str(session.id),
        )
        InterviewQuestion.objects.bulk_create([
            InterviewQuestion(
                session=session,
                question=q.question,
                type_question=q.type_question,
                categorie=q.categorie,
                competence=q.competence,
                mots_cles=q.keywords,
                ordre=index,
            )
            for index, q in enumerate(questions, start=1)
        ])
        return session

    @staticmethod
    def answer(question, text: str) -> dict:
        from interviews.models import InterviewStatus

        session = question.session
        if session.statut in {InterviewStatus.COMPLETED, InterviewStatus.CANCELLED}:
            raise AIServiceError("Cette session d'entretien est terminée.", 409)
        evaluation = evaluate_answer(question.question, text, question.mots_cles, question.type_question)
        question.reponse = text
        question.score = evaluation["score"]
        question.evaluation = evaluation
        question.save(update_fields=["reponse", "score", "evaluation"])
        if session.statut == InterviewStatus.SCHEDULED:
            session.statut = InterviewStatus.IN_PROGRESS
            session.save(update_fields=["statut"])
        return evaluation

    @staticmethod
    @transaction.atomic
    def complete(session):
        from interviews.models import AIFeedback, InterviewStatus

        questions = list(session.questions.all())
        evaluations = []
        for question in questions:
            if question.reponse and not question.evaluation:
                question.evaluation = evaluate_answer(
                    question.question, question.reponse, question.mots_cles, question.type_question
                )
                question.score = question.evaluation["score"]
                question.save(update_fields=["evaluation", "score"])
            evaluations.append(question.evaluation if question.reponse else {"score": 0})
        summary = summarize_session(evaluations, [q.categorie for q in questions])

        feedback, _ = AIFeedback.objects.update_or_create(
            session=session,
            defaults={
                "score_global": summary["score_global"],
                "points_forts": summary["points_forts"],
                "points_faibles": summary["points_faibles"],
                "conseils": summary["conseils"],
                "scores_par_categorie": summary["scores_par_categorie"],
            },
        )
        session.score_global = summary["score_global"]
        session.statut = InterviewStatus.COMPLETED
        if session.date_session:
            session.duree = max(1, round((timezone.now() - session.date_session).total_seconds() / 60))
        session.save(update_fields=["score_global", "statut", "duree"])

        from notifications.models import NotificationType
        from notifications.services import NotificationService

        NotificationService.notify(
            session.candidate.user,
            NotificationType.INTERVIEW,
            "Feedback d'entretien disponible",
            f"Votre simulation d'entretien a obtenu {summary['score_global']}/100. Consultez vos axes de progrès.",
        )
        return feedback


# --------------------------------------------------------------------------- #
# Lettre de motivation
# --------------------------------------------------------------------------- #

class CoverLetterService:
    @staticmethod
    def generate(candidate, job) -> str:
        match = MatchingService.get_match(candidate, job)
        candidate_data = build_candidate_data(candidate)
        latest = candidate.experiences.order_by("-en_cours", "-date_debut").first()
        latest_formation = candidate.formations.order_by("-date_fin").first()
        education_label = None
        if latest_formation:
            education_label = latest_formation.diplome
        elif candidate_data.education_level is not None:
            analysis = latest_cv_analysis(candidate)
            education_label = analysis.education_level if analysis else None
        matched = match.get("matched_skills", [])
        others = [s for s in candidate_data.skills if s not in matched
                  and skill_category(s) not in {"Langues", None}]
        user = candidate.user
        return generate_cover_letter(CoverLetterInput(
            candidate_name=f"{user.prenom} {user.nom}".strip() or user.email,
            job_title=job.titre,
            company=job.entreprise.nom_entreprise,
            city=candidate.ville,
            matched_skills=matched,
            other_skills=others,
            missing_skills=match.get("missing_skills", []),
            experience_years=candidate_data.experience_years,
            last_position=latest.poste if latest else None,
            last_employer=latest.entreprise if latest else None,
            education_label=education_label,
            email=user.email,
            phone=user.telephone,
        ))


def engine_status() -> dict:
    return {
        "status": "healthy",
        "engine": ENGINE_NAME,
        "version": ENGINE_VERSION,
        "external_api": False,
        "skills_in_catalog": len(SKILL_TAXONOMY),
        "features": [
            "analyse_cv",
            "recommandations_offres",
            "classement_candidatures",
            "simulation_entretien",
            "lettre_motivation",
            "extraction_competences",
        ],
    }


def extract_skills_from_text(text: str) -> list[dict]:
    return [{"nom": s.name, "categorie": s.category, "occurrences": s.occurrences} for s in extract_skills(text)]
