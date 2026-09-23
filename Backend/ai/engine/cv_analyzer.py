"""
Analyse d'un CV : score d'employabilité explicable, points forts, points
faibles, compétences manquantes et recommandations.
"""

from collections import Counter
from dataclasses import asdict, dataclass, field

from .cv_parser import ParsedCV, parse_cv_text
from .skills import SOFT_SKILL_CATEGORIES, extract_skills, proficiency_from_occurrences
from .text import clamp

SCORE_WEIGHTS = {
    "competences": 0.35,
    "experience": 0.25,
    "formation": 0.15,
    "structure": 0.15,
    "coordonnees": 0.10,
}

EXPECTED_SECTIONS = ("profil", "experience", "formation", "competences", "langues")


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
    summary: str = ""
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


def _experience_score(years: float) -> int:
    if years >= 8:
        return 95
    if years >= 5:
        return 85
    if years >= 3:
        return 72
    if years >= 1:
        return 58
    if years > 0:
        return 42
    return 25


def _education_score(level: int | None) -> int:
    if level is None:
        return 35
    return {0: 45, 2: 62, 3: 75, 4: 82, 5: 92, 8: 100}.get(level, 60)


def _skills_score(skills) -> int:
    hard = [s for s in skills if s.category not in SOFT_SKILL_CATEGORIES]
    soft = [s for s in skills if s.category in SOFT_SKILL_CATEGORIES]
    categories = {s.category for s in hard}
    score = min(55, len(hard) * 6) + min(25, len(categories) * 6) + min(20, len(soft) * 5)
    return int(clamp(score))


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


def _contact_score(contacts: dict) -> int:
    score = 0
    if contacts.get("email"):
        score += 40
    if contacts.get("telephone"):
        score += 30
    if contacts.get("linkedin") or contacts.get("github") or contacts.get("site_web"):
        score += 30
    return score


def analyze_cv_text(text: str, market_skills: Counter | None = None) -> CVAnalysisResult:
    """Analyser le texte d'un CV.

    ``market_skills`` compte les compétences demandées dans les offres
    publiées ; il sert à proposer les compétences manquantes les plus utiles.
    """
    parsed = parse_cv_text(text or "")
    skills = extract_skills(parsed.text)
    market_skills = market_skills or Counter()

    details = {
        "competences": _skills_score(skills),
        "experience": _experience_score(parsed.experience_years),
        "formation": _education_score(parsed.education_level),
        "structure": _structure_score(parsed),
        "coordonnees": _contact_score(parsed.contacts),
    }
    global_score = round(sum(details[k] * w for k, w in SCORE_WEIGHTS.items()))

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

    # Compétences manquantes : les plus demandées sur le marché, dans les
    # mêmes familles que le profil (ou globalement si le profil est vide).
    owned = {s.name for s in skills}
    owned_categories = {s.category for s in skills if s.category not in SOFT_SKILL_CATEGORIES}
    from .skills import skill_category

    missing = []
    for name, count in market_skills.most_common():
        if name in owned:
            continue
        category = skill_category(name)
        if owned_categories and category not in owned_categories:
            continue
        importance = "high" if count >= 3 else "medium" if count == 2 else "low"
        missing.append({"name": name, "importance": importance, "demand": count})
        if len(missing) >= 8:
            break

    strengths, weaknesses, recommendations = _build_feedback(parsed, skills, details, missing)
    summary = _build_summary(global_score, parsed, skills)

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
        summary=summary,
    )


def _build_summary(score: int, parsed: ParsedCV, skills) -> str:
    if score >= 80:
        level = "Votre CV est très compétitif"
    elif score >= 65:
        level = "Votre CV est solide"
    elif score >= 50:
        level = "Votre CV a une bonne base mais peut être renforcé"
    else:
        level = "Votre CV doit être retravaillé pour convaincre les recruteurs"
    parts = [f"{level} (score {score}/100)."]
    if skills:
        top = ", ".join(s.name for s in skills[:5])
        parts.append(f"Compétences principales détectées : {top}.")
    if parsed.experience_years:
        parts.append(f"Expérience estimée : {parsed.experience_years:g} an(s).")
    if parsed.education_label:
        parts.append(f"Niveau d'études : {parsed.education_label}.")
    return " ".join(parts)


def _build_feedback(parsed: ParsedCV, skills, details: dict, missing: list[dict]):
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[dict] = []

    hard = [s for s in skills if s.category not in SOFT_SKILL_CATEGORIES]
    soft = [s for s in skills if s.category == "Savoir-être"]
    languages = [s for s in skills if s.category == "Langues"]

    # Compétences
    if len(hard) >= 8:
        strengths.append(f"Large palette de compétences techniques ({len(hard)} identifiées).")
    elif len(hard) >= 4:
        strengths.append(f"Compétences techniques clairement identifiables ({', '.join(s.name for s in hard[:4])}).")
    else:
        weaknesses.append("Peu de compétences techniques identifiables dans le CV.")
        recommendations.append({
            "category": "skills",
            "title": "Ajouter une section « Compétences » détaillée",
            "description": "Listez les outils, logiciels, langages et méthodes que vous maîtrisez, "
                           "avec leur niveau. Les recruteurs et les filtres automatiques les recherchent en priorité.",
            "priority": "high",
        })

    if soft:
        strengths.append("Savoir-être mis en avant : " + ", ".join(s.name for s in soft[:3]) + ".")
    else:
        recommendations.append({
            "category": "presentation",
            "title": "Valoriser vos qualités humaines",
            "description": "Mentionnez 2 ou 3 qualités (travail en équipe, rigueur, autonomie...) "
                           "illustrées par un exemple concret dans vos expériences.",
            "priority": "low",
        })

    if len(languages) >= 2:
        strengths.append("Profil multilingue (" + ", ".join(s.name for s in languages) + ").")
    elif not parsed.sections.get("langues"):
        weaknesses.append("Les langues parlées ne sont pas indiquées.")
        recommendations.append({
            "category": "presentation",
            "title": "Indiquer vos langues",
            "description": "Ajoutez une rubrique « Langues » avec votre niveau (ex. Français : courant, Anglais : B2).",
            "priority": "medium",
        })

    # Expérience
    years = parsed.experience_years
    if years >= 5:
        strengths.append(f"Expérience professionnelle confirmée (environ {years:g} ans).")
    elif years >= 1:
        strengths.append(f"Première expérience professionnelle significative (environ {years:g} an(s)).")
    else:
        weaknesses.append("L'expérience professionnelle est absente ou les dates ne sont pas lisibles.")
        recommendations.append({
            "category": "experience",
            "title": "Préciser les dates et missions de vos expériences",
            "description": "Pour chaque poste ou stage, indiquez l'intitulé, l'entreprise, les dates "
                           "(mois/année – mois/année) et 2 à 4 réalisations concrètes.",
            "priority": "high",
        })

    # Formation
    if parsed.education_level is not None and parsed.education_level >= 3:
        strengths.append(f"Niveau d'études apprécié : {parsed.education_label}.")
    elif parsed.education_level is None:
        weaknesses.append("La formation (diplômes) n'est pas clairement identifiée.")
        recommendations.append({
            "category": "education",
            "title": "Détailler votre formation",
            "description": "Indiquez vos diplômes avec l'intitulé exact, l'établissement et l'année d'obtention.",
            "priority": "medium",
        })

    # Structure
    missing_sections = [s for s in EXPECTED_SECTIONS if not parsed.sections.get(s)]
    if details["structure"] >= 70:
        strengths.append("CV bien structuré avec des rubriques claires.")
    elif missing_sections:
        labels = {"profil": "Profil", "experience": "Expérience", "formation": "Formation",
                  "competences": "Compétences", "langues": "Langues"}
        weaknesses.append("Rubriques absentes ou non reconnues : " + ", ".join(labels[s] for s in missing_sections) + ".")
        recommendations.append({
            "category": "presentation",
            "title": "Structurer le CV avec des titres de rubriques",
            "description": "Utilisez des titres explicites (Profil, Expérience professionnelle, Formation, "
                           "Compétences, Langues) pour faciliter la lecture humaine et automatique.",
            "priority": "medium",
        })
    if parsed.word_count < 150:
        weaknesses.append("Le CV est très court : il manque d'éléments pour convaincre.")
    elif parsed.word_count > 1400:
        weaknesses.append("Le CV est long : pensez à le synthétiser sur 1 à 2 pages.")

    if not parsed.sections.get("profil"):
        recommendations.append({
            "category": "presentation",
            "title": "Ajouter un résumé de profil",
            "description": "Rédigez 3 à 4 lignes en haut du CV présentant votre métier, vos points forts et votre objectif.",
            "priority": "medium",
        })

    # Coordonnées
    contacts = parsed.contacts
    if not contacts.get("email") or not contacts.get("telephone"):
        weaknesses.append("Coordonnées incomplètes (email ou téléphone manquant).")
        recommendations.append({
            "category": "presentation",
            "title": "Compléter vos coordonnées",
            "description": "Un recruteur doit pouvoir vous joindre immédiatement : email professionnel et téléphone.",
            "priority": "high",
        })
    if not (contacts.get("linkedin") or contacts.get("github") or contacts.get("site_web")):
        recommendations.append({
            "category": "presentation",
            "title": "Ajouter un lien professionnel",
            "description": "Un profil LinkedIn, un GitHub ou un portfolio renforce la crédibilité du CV.",
            "priority": "low",
        })

    # Marché
    if missing:
        names = ", ".join(m["name"] for m in missing[:4])
        recommendations.append({
            "category": "market",
            "title": "Développer les compétences recherchées",
            "description": f"Ces compétences sont souvent demandées dans les offres proches de votre profil : {names}.",
            "priority": "medium" if any(m["importance"] == "high" for m in missing) else "low",
        })

    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: priority_order.get(r["priority"], 3))
    return strengths, weaknesses, recommendations
