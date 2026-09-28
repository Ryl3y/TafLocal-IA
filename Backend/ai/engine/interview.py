"""
Simulation d'entretien : génération de questions ciblées et évaluation des
réponses du candidat.

Les questions proviennent d'une banque structurée (RH, comportementales,
techniques par compétence). L'évaluation combine la couverture des
mots-clés attendus, la pertinence par rapport à la question, la structure
(méthode STAR), le caractère concret de la réponse et sa longueur.
"""

import random
import re
from dataclasses import dataclass, field

from .skills import canonical_skill_name, skill_category
from .text import clamp, cosine_similarity, keyword_coverage, normalize, word_count

QUESTION_TYPES = ("OPEN", "BEHAVIORAL", "CODE", "MULTIPLE_CHOICE")


@dataclass
class GeneratedQuestion:
    question: str
    type_question: str
    categorie: str  # RH, COMPORTEMENTAL, TECHNIQUE
    keywords: list[str] = field(default_factory=list)
    competence: str | None = None


HR_QUESTIONS = [
    ("Présentez-vous en quelques minutes et expliquez pourquoi le poste de {title} vous intéresse.",
     ["parcours", "experience", "competence", "motivation", "poste", "objectif"]),
    ("Pourquoi souhaitez-vous rejoindre {company} plutôt qu'une autre entreprise ?",
     ["entreprise", "valeurs", "projet", "secteur", "contribuer", "motivation"]),
    ("Où vous voyez-vous dans trois à cinq ans ?",
     ["evoluer", "responsabilite", "competence", "projet", "objectif", "apprendre"]),
    ("Quelles sont, selon vous, vos principales qualités et le point que vous cherchez à améliorer ?",
     ["qualite", "exemple", "ameliorer", "progres", "travail"]),
    ("Qu'est-ce qui vous distingue des autres candidats pour ce poste ?",
     ["experience", "competence", "resultat", "valeur", "exemple"]),
]

BEHAVIORAL_QUESTIONS = [
    ("Racontez une situation où vous avez dû gérer un désaccord ou un conflit dans une équipe. Comment l'avez-vous résolu ?",
     ["situation", "equipe", "ecoute", "dialogue", "solution", "resultat"]),
    ("Parlez-moi d'un projet dont vous êtes particulièrement fier. Quel était votre rôle et quel résultat avez-vous obtenu ?",
     ["projet", "role", "objectif", "action", "resultat", "equipe"]),
    ("Décrivez un échec ou une erreur professionnelle et ce que vous en avez appris.",
     ["erreur", "situation", "appris", "corriger", "ameliorer", "resultat"]),
    ("Comment gérez-vous la pression et des délais très courts ? Donnez un exemple concret.",
     ["priorite", "organisation", "delai", "exemple", "calme", "resultat"]),
    ("Comment priorisez-vous vos tâches lorsque plusieurs demandes urgentes arrivent en même temps ?",
     ["priorite", "urgence", "importance", "planning", "communiquer", "organisation"]),
    ("Donnez un exemple où vous avez pris une initiative qui a amélioré le fonctionnement de votre équipe.",
     ["initiative", "probleme", "proposition", "action", "amelioration", "resultat"]),
]

# Questions techniques spécifiques à certaines compétences.
SKILL_QUESTIONS: dict[str, list[tuple[str, list[str]]]] = {
    "Python": [("Quelle est la différence entre une liste et un tuple en Python, et quand utiliser l'un ou l'autre ?",
                ["mutable", "immuable", "performance", "cle", "dictionnaire"])],
    "Django": [("Comment optimisez-vous les requêtes de l'ORM Django pour éviter le problème N+1 ?",
                ["select_related", "prefetch_related", "requete", "jointure", "index"])],
    "JavaScript": [("Expliquez la différence entre let, const et var, et le fonctionnement des promesses (async/await).",
                    ["portee", "bloc", "reassigner", "promesse", "asynchrone", "await"])],
    "React": [("À quoi servent les hooks useState et useEffect dans React ? Donnez un exemple d'utilisation.",
               ["etat", "rendu", "effet", "dependance", "composant"])],
    "SQL": [("Expliquez la différence entre INNER JOIN et LEFT JOIN, avec un exemple.",
             ["jointure", "correspondance", "table", "null", "ligne", "gauche"])],
    "Java": [("Quelle est la différence entre une interface et une classe abstraite en Java ?",
              ["heritage", "methode", "implementation", "abstraite", "multiple"])],
    "Docker": [("Quelle est la différence entre une image et un conteneur Docker ? Comment réduisez-vous la taille d'une image ?",
                ["image", "conteneur", "dockerfile", "couche", "multi-stage", "alpine"])],
    "Git": [("Comment gérez-vous un conflit de fusion (merge) avec Git ? Quelle stratégie de branches utilisez-vous ?",
             ["branche", "conflit", "merge", "rebase", "commit", "pull request"])],
    "API REST": [("Quels sont les principes d'une API REST bien conçue ?",
                  ["ressource", "methode", "get", "post", "statut", "stateless"])],
    "Microsoft Excel": [("Comment utilisez-vous les tableaux croisés dynamiques et la fonction RECHERCHEV (ou RECHERCHEX) dans Excel ?",
                         ["tableau croise", "recherchev", "donnees", "filtre", "formule"])],
    "Comptabilité": [("Expliquez la différence entre le bilan et le compte de résultat.",
                      ["actif", "passif", "charges", "produits", "resultat", "patrimoine"])],
    "Gestion de projet": [("Comment planifiez-vous et suivez-vous un projet pour respecter les délais et le budget ?",
                           ["planning", "jalons", "risques", "budget", "suivi", "indicateurs"])],
    "Marketing digital": [("Comment mesurez-vous l'efficacité d'une campagne de marketing digital ?",
                           ["kpi", "conversion", "taux", "roi", "audience", "analyse"])],
    "Vente": [("Décrivez votre méthode pour conclure une vente avec un client hésitant.",
               ["ecoute", "besoin", "objection", "argument", "benefice", "conclure"])],
    "Relation client": [("Comment traitez-vous la réclamation d'un client mécontent ?",
                         ["ecoute", "empathie", "solution", "suivi", "satisfaction"])],
    "Data Analysis": [("Décrivez les étapes d'une analyse de données, du jeu de données brut jusqu'à la recommandation.",
                       ["nettoyage", "donnees", "exploration", "visualisation", "indicateurs", "recommandation"])],
    "Machine Learning": [("Qu'est-ce que le surapprentissage (overfitting) et comment l'éviter ?",
                          ["entrainement", "validation", "generalisation", "regularisation", "donnees"])],
    "Linux": [("Quelles commandes utilisez-vous pour diagnostiquer un serveur Linux lent ?",
               ["top", "memoire", "cpu", "disque", "logs", "processus"])],
    "Agile": [("Comment se déroule un sprint dans une équipe Scrum et quel est votre rôle dans les cérémonies ?",
               ["sprint", "backlog", "daily", "retrospective", "planning", "equipe"])],
}

GENERIC_SKILL_TEMPLATES = [
    ("Décrivez un projet concret dans lequel vous avez utilisé {skill}. Quel était votre rôle et le résultat ?",
     ["projet", "role", "resultat", "{skill}"]),
    ("Quelles bonnes pratiques appliquez-vous lorsque vous travaillez avec {skill} ?",
     ["bonnes pratiques", "qualite", "exemple", "{skill}"]),
    ("Quelle a été la plus grande difficulté rencontrée avec {skill}, et comment l'avez-vous surmontée ?",
     ["difficulte", "solution", "resultat", "{skill}"]),
]

MISSING_SKILL_TEMPLATE = (
    "Le poste demande des compétences en {skill}, peu présentes dans votre profil. "
    "Comment comptez-vous monter en compétence rapidement ?",
    ["apprendre", "formation", "pratique", "projet", "documentation", "{skill}"],
)


def _format_keywords(keywords, skill=None):
    return [k.replace("{skill}", skill or "").strip() for k in keywords if k.replace("{skill}", skill or "").strip()]


def generate_questions(
    *,
    job_title: str | None,
    company: str | None,
    job_skills: list[str],
    candidate_skills: list[str],
    interview_type: str = "MIXED",
    count: int = 6,
    seed: str | int | None = None,
) -> list[GeneratedQuestion]:
    """Composer une série de questions adaptée au poste et au profil."""
    rng = random.Random(seed)
    title = job_title or "ce poste"
    company = company or "notre entreprise"
    count = max(3, min(count, 15))

    owned = {normalize(canonical_skill_name(s)) for s in candidate_skills}
    job_skills = [canonical_skill_name(s) for s in job_skills if s]
    hard_job_skills = [s for s in job_skills if skill_category(s) not in {"Savoir-être", "Langues"}]
    missing = [s for s in hard_job_skills if normalize(s) not in owned]
    mastered = [s for s in hard_job_skills if normalize(s) in owned]
    tech_pool = missing[:2] + mastered + [s for s in hard_job_skills if s not in missing[:2] and s not in mastered]
    if not tech_pool:
        tech_pool = [canonical_skill_name(s) for s in candidate_skills
                     if skill_category(s) not in {"Savoir-être", "Langues", None}]

    def hr(n):
        picks = [HR_QUESTIONS[0]] + rng.sample(HR_QUESTIONS[1:], k=min(len(HR_QUESTIONS) - 1, max(0, n - 1)))
        return [GeneratedQuestion(q.format(title=title, company=company), "OPEN", "RH", k) for q, k in picks[:n]]

    def behavioral(n):
        picks = rng.sample(BEHAVIORAL_QUESTIONS, k=min(n, len(BEHAVIORAL_QUESTIONS)))
        return [GeneratedQuestion(q, "BEHAVIORAL", "COMPORTEMENTAL", k) for q, k in picks]

    def technical(n):
        questions = []
        for skill in tech_pool:
            if len(questions) >= n:
                break
            if skill in missing[:2]:
                q, k = MISSING_SKILL_TEMPLATE
            elif skill in SKILL_QUESTIONS:
                q, k = rng.choice(SKILL_QUESTIONS[skill])
            else:
                q, k = rng.choice(GENERIC_SKILL_TEMPLATES)
            questions.append(GeneratedQuestion(
                q.format(skill=skill), "OPEN", "TECHNIQUE", _format_keywords(k, skill), competence=skill,
            ))
        # Pas assez de compétences : questions génériques sur le métier.
        generic = [
            (f"Quelles sont selon vous les compétences clés pour réussir en tant que {title} ?",
             ["competence", "exemple", "experience", "outil"]),
            (f"Décrivez une journée type dans un poste de {title} et vos priorités.",
             ["priorite", "organisation", "tache", "objectif"]),
            ("Comment vous tenez-vous à jour dans votre domaine ?",
             ["veille", "formation", "lecture", "communaute", "projet"]),
        ]
        for q, k in generic:
            if len(questions) >= n:
                break
            questions.append(GeneratedQuestion(q, "OPEN", "TECHNIQUE", k))
        return questions

    interview_type = (interview_type or "MIXED").upper()
    if interview_type == "TECHNICAL":
        plan = hr(1) + technical(count - 1)
    elif interview_type == "BEHAVIORAL":
        plan = hr(1) + behavioral(count - 1)
    elif interview_type == "HR":
        plan = hr(min(count, len(HR_QUESTIONS))) + behavioral(max(0, count - len(HR_QUESTIONS)))
    else:
        n_tech = max(1, round((count - 2) * 0.5))
        n_behav = max(1, count - 2 - n_tech)
        plan = hr(1) + technical(n_tech) + behavioral(n_behav) + hr(2)[1:]

    seen, unique = set(), []
    for question in plan:
        if question.question not in seen:
            seen.add(question.question)
            unique.append(question)
    return unique[:count]


# --------------------------------------------------------------------------- #
# Évaluation
# --------------------------------------------------------------------------- #

STAR_MARKERS = {
    "situation": ("situation", "contexte", "lorsque", "quand j'etais", "dans mon precedent", "chez"),
    "tache": ("objectif", "mission", "tache", "je devais", "il fallait", "responsable"),
    "action": ("j'ai", "nous avons", "j'ai mis", "j'ai propose", "j'ai organise", "j'ai decide"),
    "resultat": ("resultat", "au final", "finalement", "ce qui a permis", "grace a", "a permis", "reduit", "augmente", "ameliore"),
}
EXAMPLE_MARKERS = ("par exemple", "exemple", "notamment", "concretement", "projet", "cas")
NUMBER_RE = re.compile(r"\d+\s*(?:%|pour ?cent|fcfa|xaf|€|eur|k|m|jours?|mois|ans|clients?|personnes?|heures?)?")


def evaluate_answer(question: str, answer: str | None, keywords: list[str], question_type: str = "OPEN") -> dict:
    """Évaluer une réponse et produire un score (0-100) et un retour détaillé."""
    answer = (answer or "").strip()
    words = word_count(answer)
    if words == 0:
        return {
            "score": 0,
            "criteres": {},
            "points_forts": [],
            "axes_amelioration": ["Aucune réponse n'a été fournie."],
            "commentaire": "Question sans réponse.",
            "mots_cles_trouves": [],
            "mots_cles_manquants": keywords,
        }

    normalized = normalize(answer)
    coverage, found, missing = keyword_coverage(answer, keywords)
    relevance = cosine_similarity(answer, question + " " + " ".join(keywords))

    if words < 15:
        length_score = 20
    elif words < 40:
        length_score = 60
    elif words <= 250:
        length_score = 100
    elif words <= 400:
        length_score = 80
    else:
        length_score = 60

    star_hits = [k for k, markers in STAR_MARKERS.items() if any(m in normalized for m in markers)]
    structure_score = len(star_hits) / len(STAR_MARKERS) * 100
    has_example = any(m in normalized for m in EXAMPLE_MARKERS)
    numbers = NUMBER_RE.findall(normalized)
    concrete_score = clamp((50 if has_example else 0) + min(50, len([n for n in numbers if n.strip()]) * 25))

    criteria = {
        "mots_cles": round(coverage * 100),
        "pertinence": round(clamp(relevance / 0.25 * 100)),
        "structure": round(structure_score),
        "concret": round(concrete_score),
        "longueur": length_score,
    }
    if question_type == "BEHAVIORAL":
        weights = {"mots_cles": 0.20, "pertinence": 0.20, "structure": 0.30, "concret": 0.15, "longueur": 0.15}
    else:
        weights = {"mots_cles": 0.35, "pertinence": 0.25, "structure": 0.10, "concret": 0.15, "longueur": 0.15}
    score = round(sum(criteria[k] * w for k, w in weights.items()))

    strengths, improvements = [], []
    if criteria["mots_cles"] >= 60:
        strengths.append("Vous abordez les notions clés attendues.")
    elif missing:
        improvements.append("Pensez à aborder : " + ", ".join(missing[:4]) + ".")
    if criteria["pertinence"] >= 60:
        strengths.append("Réponse en lien direct avec la question.")
    else:
        improvements.append("Recentrez votre réponse sur la question posée.")
    if question_type == "BEHAVIORAL":
        if len(star_hits) >= 3:
            strengths.append("Réponse bien structurée (situation, action, résultat).")
        else:
            absent = [k for k in STAR_MARKERS if k not in star_hits]
            improvements.append("Structurez avec la méthode STAR ; il manque : " + ", ".join(absent) + ".")
    if concrete_score >= 50:
        strengths.append("Réponse illustrée par des éléments concrets.")
    else:
        improvements.append("Ajoutez un exemple concret et, si possible, un résultat chiffré.")
    if words < 40:
        improvements.append("Développez davantage votre réponse (au moins 3 à 5 phrases).")
    elif words > 400:
        improvements.append("Soyez plus synthétique : visez 1 à 2 minutes de réponse.")

    if score >= 75:
        comment = "Très bonne réponse, claire et convaincante."
    elif score >= 55:
        comment = "Réponse correcte, qui peut être renforcée."
    elif score >= 35:
        comment = "Réponse insuffisante : elle manque de précision."
    else:
        comment = "Réponse à retravailler en profondeur."

    return {
        "score": int(clamp(score)),
        "criteres": criteria,
        "points_forts": strengths,
        "axes_amelioration": improvements,
        "commentaire": comment,
        "mots_cles_trouves": found,
        "mots_cles_manquants": missing,
    }


def summarize_session(evaluations: list[dict], categories: list[str]) -> dict:
    """Synthèse de l'entretien à partir des évaluations de chaque réponse."""
    if not evaluations:
        return {"score_global": 0, "points_forts": [], "points_faibles": ["Aucune réponse fournie."],
                "conseils": ["Répondez à chaque question pour obtenir un retour détaillé."], "scores_par_categorie": {}}

    scores = [e.get("score", 0) for e in evaluations]
    global_score = round(sum(scores) / len(scores))

    by_category: dict[str, list[int]] = {}
    for evaluation, category in zip(evaluations, categories):
        by_category.setdefault(category or "AUTRE", []).append(evaluation.get("score", 0))
    category_scores = {k: round(sum(v) / len(v)) for k, v in by_category.items()}

    labels = {"RH": "questions de motivation", "COMPORTEMENTAL": "questions comportementales",
              "TECHNIQUE": "questions techniques", "AUTRE": "autres questions"}
    strengths, weaknesses, tips = [], [], []
    for category, value in sorted(category_scores.items(), key=lambda kv: -kv[1]):
        if value >= 65:
            strengths.append(f"Bonne maîtrise des {labels.get(category, category.lower())} ({value}/100).")
        elif value < 50:
            weaknesses.append(f"Les {labels.get(category, category.lower())} sont à travailler ({value}/100).")

    unanswered = sum(1 for e in evaluations if not e.get("criteres"))
    if unanswered:
        weaknesses.append(f"{unanswered} question(s) sans réponse.")

    criteria_totals: dict[str, list[int]] = {}
    for evaluation in evaluations:
        for key, value in (evaluation.get("criteres") or {}).items():
            criteria_totals.setdefault(key, []).append(value)
    averages = {k: sum(v) / len(v) for k, v in criteria_totals.items()}
    if averages.get("structure", 100) < 50:
        tips.append("Utilisez la méthode STAR (Situation, Tâche, Action, Résultat) pour structurer vos exemples.")
    if averages.get("concret", 100) < 50:
        tips.append("Illustrez chaque réponse avec un exemple réel et un résultat chiffré.")
    if averages.get("mots_cles", 100) < 50:
        tips.append("Révisez les notions techniques clés du poste et employez le vocabulaire du métier.")
    if averages.get("longueur", 100) < 60:
        tips.append("Développez vos réponses : 1 à 2 minutes à l'oral, soit 5 à 10 phrases.")
    if averages.get("pertinence", 100) < 50:
        tips.append("Écoutez bien la question et répondez-y directement avant de développer.")
    if not tips:
        tips.append("Continuez à vous entraîner sur des questions variées pour gagner en aisance.")
    if not strengths and global_score >= 55:
        strengths.append("Des réponses globalement cohérentes.")

    return {
        "score_global": global_score,
        "points_forts": strengths,
        "points_faibles": weaknesses,
        "conseils": tips,
        "scores_par_categorie": category_scores,
    }
