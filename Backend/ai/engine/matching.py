"""
Calcul de compatibilité entre un profil candidat et une offre d'emploi.

Le score (0-100) est une moyenne pondérée de sous-scores explicables :
compétences, expérience, proximité sémantique, localisation et formation.
Chaque résultat est accompagné des compétences correspondantes et
manquantes ainsi que d'une explication en français.
"""

from dataclasses import dataclass, field

from .cv_parser import education_level_from_text
from .skills import LEVEL_WEIGHTS, canonical_skill_name, extract_skill_names, related_skills
from .text import clamp, cosine_similarity, normalize

WEIGHTS = {
    "competences": 0.45,
    "experience": 0.20,
    "semantique": 0.15,
    "localisation": 0.10,
    "formation": 0.10,
}

REMOTE_KEYWORDS = ("teletravail", "remote", "a distance", "full remote", "hybride")


@dataclass
class CandidateData:
    skills: dict[str, str] = field(default_factory=dict)  # nom canonique -> niveau
    experience_years: float = 0.0
    city: str | None = None
    education_level: int | None = None
    text: str = ""
    job_titles: list[str] = field(default_factory=list)


@dataclass
class JobData:
    title: str
    description: str = ""
    requirements: str = ""
    skills: list[str] = field(default_factory=list)
    required_experience: float | None = None  # en années (0.25 = 3 mois)
    location: str | None = None
    education: str | None = None

    @property
    def full_text(self) -> str:
        return f"{self.title}\n{self.description}\n{self.requirements}"

    def effective_skills(self) -> tuple[list[str], bool]:
        """Compétences exigées : celles déclarées, sinon celles détectées dans le texte."""
        declared = []
        for skill in self.skills:
            name = canonical_skill_name(skill)
            if name and name not in declared:
                declared.append(name)
        if declared:
            return declared, False
        return extract_skill_names(self.full_text), True


def _skills_component(candidate: CandidateData, required: list[str]):
    if not required:
        return None, [], [], []
    owned = candidate.skills
    owned_lower = {normalize(k): k for k in owned}
    matched, partial, missing = [], [], []
    points = 0.0
    for skill in required:
        key = normalize(skill)
        if key in owned_lower:
            level = owned[owned_lower[key]]
            points += LEVEL_WEIGHTS.get(level, 0.8)
            matched.append(skill)
            continue
        close = [r for r in related_skills(skill) if normalize(r) in owned_lower]
        if close:
            points += 0.35
            partial.append({"competence": skill, "proche_de": close[0]})
        missing.append(skill)
    score = points / len(required) * 100
    return clamp(score), matched, partial, missing


def _experience_component(candidate_years: float, required: float | None) -> float | None:
    if required is None:
        return None
    if required <= 0:
        return 100.0
    if candidate_years >= required:
        return 100.0
    ratio = candidate_years / required
    return clamp(25 + ratio * 70)


def _duration(years: float | None) -> str:
    """Durée lisible à partir d'années décimales : 0.25 -> « 3 mois », 1.5 -> « 1 an et 6 mois »."""
    months = round((years or 0) * 12)
    if months < 12:
        return f"{months} mois"
    whole, rest = divmod(months, 12)
    text = f"{whole} an" + ("s" if whole > 1 else "")
    return f"{text} et {rest} mois" if rest else text


def _location_component(city: str | None, location: str | None) -> float | None:
    job_loc = normalize(location)
    if job_loc and any(k in job_loc for k in REMOTE_KEYWORDS):
        return 100.0
    cand = normalize(city)
    if not job_loc or not cand:
        return None
    if cand == job_loc or cand in job_loc or job_loc in cand:
        return 100.0
    return 30.0


def _education_component(candidate_level: int | None, job_education: str | None) -> float | None:
    required, _ = education_level_from_text(job_education)
    if required is None:
        return None
    if candidate_level is None:
        return 45.0
    if candidate_level >= required:
        return 100.0
    gap = required - candidate_level
    return 70.0 if gap <= 1 else 50.0 if gap <= 2 else 30.0


def _semantic_component(candidate: CandidateData, job: JobData) -> float:
    candidate_text = "\n".join([candidate.text, " ".join(candidate.skills), " ".join(candidate.job_titles)])
    similarity = cosine_similarity(candidate_text, job.full_text)
    title_similarity = max((cosine_similarity(t, job.title) for t in candidate.job_titles), default=0.0)
    return clamp(similarity / 0.40 * 100 * 0.7 + title_similarity * 100 * 0.3)


def compute_match(candidate: CandidateData, job: JobData) -> dict:
    """Calculer la compatibilité et son explication."""
    required, inferred = job.effective_skills()
    skills_score, matched, partial, missing = _skills_component(candidate, required)
    components = {
        "competences": skills_score,
        "experience": _experience_component(candidate.experience_years, job.required_experience),
        "semantique": _semantic_component(candidate, job),
        "localisation": _location_component(candidate.city, job.location),
        "formation": _education_component(candidate.education_level, job.education),
    }

    # Les critères non renseignés sont exclus et leur poids redistribué, pour
    # ne jamais afficher un score « par défaut » trompeur.
    available = {k: v for k, v in components.items() if v is not None}
    total_weight = sum(WEIGHTS[k] for k in available)
    global_score = sum(v * WEIGHTS[k] for k, v in available.items()) / total_weight if total_weight else 0.0

    details = {k: (round(v) if v is not None else None) for k, v in components.items()}
    data_quality = _data_quality(candidate)

    return {
        "score": int(round(global_score)),
        "details": details,
        "matched_skills": matched,
        "missing_skills": missing,
        "partial_skills": partial,
        "required_skills": required,
        "skills_inferred": inferred,
        "explanation": _explain(global_score, details, matched, missing, candidate, job),
        "recommendations": _recommend(details, missing, partial, job),
        "data_quality": data_quality,
    }


def _data_quality(candidate: CandidateData) -> str:
    signals = sum([
        len(candidate.skills) >= 3,
        candidate.experience_years > 0,
        bool(candidate.city),
        candidate.education_level is not None,
        len(candidate.text) > 200,
    ])
    return "bonne" if signals >= 4 else "moyenne" if signals >= 2 else "faible"


def score_label(score: float) -> str:
    if score >= 80:
        return "Excellente compatibilité"
    if score >= 65:
        return "Bonne compatibilité"
    if score >= 50:
        return "Compatibilité moyenne"
    return "Compatibilité faible"


def _explain(score, details, matched, missing, candidate, job) -> str:
    parts = [f"{score_label(score)} ({round(score)}/100) avec le poste « {job.title} »."]
    if matched:
        parts.append(f"Compétences correspondantes : {', '.join(matched[:6])}.")
    if missing:
        parts.append(f"Compétences à acquérir : {', '.join(missing[:5])}.")
    if details["experience"] is not None:
        if details["experience"] >= 100:
            parts.append("L'expérience requise est atteinte.")
        else:
            parts.append(
                f"Expérience : {_duration(candidate.experience_years)} pour {_duration(job.required_experience)} demandé(s)."
            )
    if details["localisation"] == 100:
        parts.append("La localisation correspond.")
    elif details["localisation"] is not None and details["localisation"] < 50:
        parts.append(f"Le poste est basé à {job.location}.")
    return " ".join(parts)


def _recommend(details, missing, partial, job) -> list[str]:
    tips = []
    partial_names = {p["competence"]: p["proche_de"] for p in partial}
    for skill in missing[:3]:
        if skill in partial_names:
            tips.append(f"Mettez en avant votre maîtrise de {partial_names[skill]}, proche de {skill}.")
        else:
            tips.append(f"Formez-vous ou valorisez un projet utilisant {skill}.")
    if details["experience"] is not None and details["experience"] < 70:
        tips.append("Valorisez vos stages, projets personnels et missions bénévoles pour compenser l'expérience.")
    if details["semantique"] is not None and details["semantique"] < 40:
        tips.append("Adaptez votre profil et votre CV au vocabulaire de l'offre.")
    return tips
