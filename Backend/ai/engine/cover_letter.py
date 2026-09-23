"""
Génération d'une lettre de motivation personnalisée à partir du profil du
candidat et de l'offre (modèle rédactionnel paramétré, sans LLM externe).
"""

from dataclasses import dataclass, field
from datetime import date

FRENCH_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                 "août", "septembre", "octobre", "novembre", "décembre"]


@dataclass
class CoverLetterInput:
    candidate_name: str
    job_title: str
    company: str
    city: str | None = None
    matched_skills: list[str] = field(default_factory=list)
    other_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    experience_years: float = 0.0
    last_position: str | None = None
    last_employer: str | None = None
    education_label: str | None = None
    email: str | None = None
    phone: str | None = None


def _enumerate(items: list[str]) -> str:
    items = [i for i in items if i]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " et " + items[-1]


def generate_cover_letter(data: CoverLetterInput, today: date | None = None) -> str:
    today = today or date.today()
    date_line = f"{data.city + ', le ' if data.city else 'Le '}{today.day} {FRENCH_MONTHS[today.month - 1]} {today.year}"

    header = [data.candidate_name]
    if data.email:
        header.append(data.email)
    if data.phone:
        header.append(data.phone)

    if data.experience_years >= 1 and data.last_position:
        employer = f" chez {data.last_employer}" if data.last_employer else ""
        intro_profile = (
            f"Fort(e) de {data.experience_years:g} an(s) d'expérience, notamment en tant que "
            f"{data.last_position}{employer}, je souhaite aujourd'hui mettre mes compétences au service de {data.company}."
        )
    elif data.education_label:
        intro_profile = (
            f"Titulaire d'un diplôme de niveau {data.education_label}, je souhaite mettre ma motivation "
            f"et mes connaissances au service de {data.company}."
        )
    else:
        intro_profile = f"Motivé(e) et impliqué(e), je souhaite mettre mes compétences au service de {data.company}."

    skills_paragraph = ""
    if data.matched_skills:
        skills_paragraph = (
            f"Votre offre met l'accent sur {_enumerate(data.matched_skills[:4])} : ce sont précisément des "
            "compétences que j'ai mobilisées dans mes expériences et projets. "
        )
    if data.other_skills:
        skills_paragraph += (
            f"J'apporte également une maîtrise de {_enumerate(data.other_skills[:3])}, "
            "qui me permettra d'élargir rapidement mon champ d'action. "
        )
    if data.missing_skills:
        skills_paragraph += (
            f"Curieux(se) et rigoureux(se), je suis prêt(e) à renforcer rapidement mes connaissances en "
            f"{_enumerate(data.missing_skills[:2])} pour être pleinement opérationnel(le)."
        )
    if not skills_paragraph:
        skills_paragraph = (
            "Rigoureux(se), organisé(e) et doté(e) d'un bon esprit d'équipe, je m'adapte rapidement "
            "à de nouveaux environnements et à de nouveaux outils."
        )

    paragraphs = [
        "\n".join(header),
        date_line,
        f"Objet : candidature au poste de {data.job_title}",
        "Madame, Monsieur,",
        f"C'est avec un grand intérêt que je vous adresse ma candidature pour le poste de {data.job_title} "
        f"au sein de {data.company}. {intro_profile}",
        skills_paragraph.strip(),
        f"Rejoindre {data.company} représente pour moi l'opportunité de contribuer à des projets concrets "
        "tout en continuant à progresser. Je serais ravi(e) de vous exposer plus en détail ma motivation "
        "lors d'un entretien.",
        "Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes "
        "salutations distinguées.",
        data.candidate_name,
    ]
    return "\n\n".join(p for p in paragraphs if p)
