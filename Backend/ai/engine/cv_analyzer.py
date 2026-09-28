"""
Analyse d'un CV par rapport aux offres publiées : score de compatibilité
explicable, points forts, points faibles, compétences manquantes et
recommandations. Sans offre à comparer, il n'y a pas d'analyse.
"""

from collections import Counter
from dataclasses import asdict, dataclass, field

from .cv_parser import ParsedCV, parse_cv_text
from .matching import WEIGHTS as MATCH_WEIGHTS
from .matching import CandidateData, JobData, compute_match
from .skills import extract_skills, proficiency_from_occurrences
from .text import clamp

# Nombre d'offres les plus proches du CV retenues pour calculer le score.
TOP_OFFERS = 5

EXPECTED_SECTIONS = ("profil", "experience", "formation", "competences", "langues")


class NoOffersError(ValueError):
    """Aucune offre à laquelle comparer le CV."""


@dataclass
class OfferInput:
    """Offre à comparer au CV : ``meta`` (id, entreprise...) est recopié tel quel dans le résultat."""

    job: JobData
    meta: dict = field(default_factory=dict)


@dataclass
class CVAnalysisResult:
    employability_score: int
    score_details: dict
    detected_skills: list[dict]
    missing_skills: list[dict]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[dict]
    experience_years: float
    education_level: int | None
    education_label: str | None
    contacts: dict
    sections: list[str]
    word_count: int
    offers: list[dict] = field(default_factory=list)
    offers_count: int = 0
    summary: str = ""
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


def _structure_score(parsed: ParsedCV) -> int:
    present = [s for s in EXPECTED_SECTIONS if parsed.sections.get(s)]
    score = len(present) * 18 + (10 if parsed.sections.get("projets") or parsed.sections.get("certifications") else 0)
    if parsed.word_count < 120:
        score -= 25
    elif parsed.word_count < 250:
        score -= 10
    elif parsed.word_count > 1400:
        score -= 10
    return int(clamp(score))


def _mean(values) -> int | None:
    values = [v for v in values if v is not None]
    return round(sum(values) / len(values)) if values else None


def analyze_cv_text(text: str, offers: list[OfferInput], city: str | None = None) -> CVAnalysisResult:
    """Analyser le texte d'un CV en le comparant aux offres fournies.

    Le score est la compatibilité moyenne du CV avec les ``TOP_OFFERS``
    offres qui lui correspondent le mieux. Lève ``NoOffersError`` si
    ``offers`` est vide : sans offre, pas d'analyse.
    """
    if not offers:
        raise NoOffersError("Aucune offre publiée à laquelle comparer le CV.")

    parsed = parse_cv_text(text or "")
    skills = extract_skills(parsed.text)
    detected = [
        {
            "name": s.name,
            "category": s.category,
            "proficiency_level": proficiency_from_occurrences(s.occurrences, s.years),
            "years_experience": s.years,
            "occurrences": s.occurrences,
        }
        for s in skills
    ]
    candidate = CandidateData(
        skills={d["name"]: d["proficiency_level"] for d in detected},
        experience_years=parsed.experience_years,
        city=city,
        education_level=parsed.education_level,
        text=parsed.text[:8000],
    )

    matches = []
    for offer in offers:
        outcome = compute_match(candidate, offer.job)
        matches.append({"meta": offer.meta, "titre": offer.job.title, **outcome})
    matches.sort(key=lambda m: -m["score"])
    top = matches[:TOP_OFFERS]

    details = {key: _mean(m["details"][key] for m in top) for key in MATCH_WEIGHTS}
    global_score = _mean(m["score"] for m in top) or 0

    # Compétences manquantes : celles exigées par les offres les plus proches
    # et absentes du CV, classées par nombre d'offres qui les demandent.
    missing_counter = Counter(skill for m in top for skill in m["missing_skills"])
    missing = []
    for name, count in missing_counter.most_common(8):
        share = count / len(top)
        importance = "high" if share >= 0.5 else "medium" if count >= 2 else "low"
        missing.append({"name": name, "importance": importance, "demand": count})

    strengths, weaknesses, recommendations = _build_feedback(parsed, details, top, missing)
    summary = _build_summary(global_score, parsed, top, len(offers))

    return CVAnalysisResult(
        employability_score=int(clamp(global_score)),
        score_details=details,
        detected_skills=detected,
        missing_skills=missing,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        experience_years=parsed.experience_years,
        education_level=parsed.education_level,
        education_label=parsed.education_label,
        contacts=parsed.contacts,
        sections=[name for name in parsed.sections if name != "entete"],
        word_count=parsed.word_count,
        offers=[
            {
                **m["meta"],
                "titre": m["titre"],
                "score": m["score"],
                "matched_skills": m["matched_skills"],
                "missing_skills": m["missing_skills"],
            }
            for m in top
        ],
        offers_count=len(offers),
        summary=summary,
    )


def _build_summary(score: int, parsed: ParsedCV, top: list[dict], offers_count: int) -> str:
    if score >= 80:
        level = "Votre CV correspond très bien aux offres publiées"
    elif score >= 65:
        level = "Votre CV correspond bien aux offres publiées"
    elif score >= 50:
        level = "Votre CV correspond en partie aux offres publiées"
    else:
        level = "Votre CV est encore éloigné des offres publiées"
    parts = [
        f"{level} (score {score}/100, calculé sur les {len(top)} offre(s) les plus proches "
        f"parmi {offers_count} analysée(s))."
    ]
    best = top[0]
    parts.append(f"Meilleure correspondance : « {best['titre']} » ({best['score']}/100).")
    if parsed.experience_years:
        parts.append(f"Expérience estimée : {parsed.experience_years:g} an(s).")
    if parsed.education_label:
        parts.append(f"Niveau d'études : {parsed.education_label}.")
    return " ".join(parts)


def _build_feedback(parsed: ParsedCV, details: dict, top: list[dict], missing: list[dict]):
    """Retours fondés sur la comparaison avec les offres, puis conseils de présentation du CV."""
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[dict] = []

    # Compétences exigées par les offres
    matched = Counter(skill for m in top for skill in m["matched_skills"])
    if matched:
        names = ", ".join(name for name, _ in matched.most_common(5))
        strengths.append(f"Compétences demandées par les offres présentes dans votre CV : {names}.")
    if details.get("competences") is not None and details["competences"] < 50:
        weaknesses.append("Votre CV couvre moins de la moitié des compétences exigées par les offres les plus proches.")
    if missing:
        names = ", ".join(m["name"] for m in missing[:4])
        weaknesses.append(f"Compétences exigées par les offres mais absentes du CV : {names}.")
        recommendations.append({
            "category": "skills",
            "title": "Acquérir ou valoriser les compétences demandées",
            "description": f"Les offres qui vous correspondent le mieux demandent : {names}. "
                           "Si vous les maîtrisez, faites-les apparaître explicitement dans votre CV ; "
                           "sinon, une formation courte ou un projet personnel vous rapprochera de ces postes.",
            "priority": "high" if any(m["importance"] == "high" for m in missing) else "medium",
        })

    # Expérience
    experience = details.get("experience")
    if experience is not None:
        if experience >= 100:
            strengths.append("Votre expérience atteint celle demandée par les offres les plus proches.")
        elif experience < 70:
            weaknesses.append("Votre expérience est inférieure à celle demandée par les offres les plus proches.")
            recommendations.append({
                "category": "experience",
                "title": "Mettre en valeur toute votre expérience",
                "description": "Indiquez les dates (mois/année) de chaque poste, stage, mission ou projet : "
                               "elles servent à calculer votre expérience face aux exigences des offres.",
                "priority": "high" if experience < 50 else "medium",
            })

    # Formation
    education = details.get("formation")
    if education is not None:
        if education >= 100:
            strengths.append("Votre niveau d'études répond aux exigences des offres les plus proches.")
        elif education < 70:
            weaknesses.append("Le niveau d'études demandé par les offres les plus proches n'est pas atteint ou pas lisible.")
            recommendations.append({
                "category": "education",
                "title": "Préciser votre formation",
                "description": "Indiquez l'intitulé exact de vos diplômes (ex. Licence, BTS, Master), "
                               "l'établissement et l'année d'obtention.",
                "priority": "medium",
            })

    # Localisation
    location = details.get("localisation")
    if location is not None and location < 50:
        weaknesses.append("Les offres les plus proches de votre profil sont situées hors de votre ville.")

    # Vocabulaire
    semantic = details.get("semantique")
    if semantic is not None:
        if semantic >= 70:
            strengths.append("Le contenu de votre CV est proche de celui des offres visées.")
        elif semantic < 40:
            weaknesses.append("Le vocabulaire de votre CV est éloigné de celui des offres.")
            recommendations.append({
                "category": "presentation",
                "title": "Reprendre les mots-clés des offres",
                "description": f"Adaptez l'intitulé de votre profil et la description de vos missions au "
                               f"vocabulaire d'offres comme « {top[0]['titre']} ».",
                "priority": "medium",
            })

    # Présentation du CV (lisibilité pour les recruteurs des offres)
    missing_sections = [s for s in EXPECTED_SECTIONS if not parsed.sections.get(s)]
    if _structure_score(parsed) < 70 and missing_sections:
        labels = {"profil": "Profil", "experience": "Expérience", "formation": "Formation",
                  "competences": "Compétences", "langues": "Langues"}
        weaknesses.append("Rubriques absentes ou non reconnues : " + ", ".join(labels[s] for s in missing_sections) + ".")
        recommendations.append({
            "category": "presentation",
            "title": "Structurer le CV avec des titres de rubriques",
            "description": "Utilisez des titres explicites (Profil, Expérience professionnelle, Formation, "
                           "Compétences, Langues) pour faciliter la lecture humaine et automatique.",
            "priority": "low",
        })
    if parsed.word_count < 150:
        weaknesses.append("Le CV est très court : il manque d'éléments pour convaincre.")

    contacts = parsed.contacts
    if not contacts.get("email") or not contacts.get("telephone"):
        weaknesses.append("Coordonnées incomplètes (email ou téléphone manquant).")
        recommendations.append({
            "category": "presentation",
            "title": "Compléter vos coordonnées",
            "description": "Un recruteur doit pouvoir vous joindre immédiatement : email professionnel et téléphone.",
            "priority": "high",
        })

    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: priority_order.get(r["priority"], 3))
    return strengths, weaknesses, recommendations
