"""
Tests unitaires du moteur IA interne (sans base de données).
"""

from datetime import date

import pytest

from ai.engine.cover_letter import CoverLetterInput, generate_cover_letter
from ai.engine.cv_analyzer import NoOffersError, OfferInput, analyze_cv_text
from ai.engine.cv_parser import education_level_from_text, estimate_experience_years, parse_cv_text
from ai.engine.interview import evaluate_answer, generate_questions, summarize_session
from ai.engine.matching import CandidateData, JobData, compute_match
from ai.engine.skills import canonical_skill_name, extract_skill_names
from ai.engine.text import cosine_similarity, keyword_coverage, normalize

SAMPLE_CV = """Jean Mballa
jean.mballa@mail.com  +237 699 88 77 66  linkedin.com/in/jmballa
PROFIL
Développeur Python / Django, 4 ans d'expérience dans les API REST.
EXPÉRIENCE PROFESSIONNELLE
Développeur backend — MTN Cameroon, mars 2021 - présent
Conception d'API REST avec Django et PostgreSQL, conteneurisation Docker, Git.
Stagiaire développeur — Orange, 06/2020 - 12/2020
FORMATION
Master en génie logiciel, Université de Douala, 2018 - 2020
COMPÉTENCES
Python, Django, SQL, PostgreSQL, Docker, Git, JavaScript, travail en équipe, rigueur
LANGUES
Français, Anglais
"""


def test_normalize_and_similarity():
    assert normalize("Développeur  Été") == "developpeur ete"
    assert cosine_similarity("développeur python django", "Développeurs Python et Django") > 0.8
    assert cosine_similarity("comptabilité", "python") == 0.0


def test_keyword_coverage_tolerates_plurals():
    coverage, found, missing = keyword_coverage("Nous avons travaillé en équipes", ["équipe", "budget"])
    assert found == ["équipe"] and missing == ["budget"] and coverage == 0.5


def test_skill_extraction_and_canonical_names():
    names = extract_skill_names("Maîtrise de ReactJS, Node.js, SQL et MySQL ; anglais courant.")
    assert {"React", "Node.js", "SQL", "MySQL", "Anglais"} <= set(names)
    assert "Java" not in extract_skill_names("JavaScript uniquement")
    assert canonical_skill_name("postgres") == "PostgreSQL"
    assert canonical_skill_name("compétence inconnue") == "Compétence inconnue"


def test_cv_parsing():
    parsed = parse_cv_text(SAMPLE_CV)
    assert {"profil", "experience", "formation", "competences", "langues"} <= set(parsed.sections)
    assert parsed.contacts["email"] == "jean.mballa@mail.com"
    assert parsed.contacts["telephone"]
    assert parsed.education_level == 5
    assert parsed.experience_years >= 4


def test_experience_ranges_are_merged():
    text = "Poste A 2015 - 2018\nPoste B 2017 - 2019"
    assert estimate_experience_years(text, {"experience": text}) == 5.0


def test_education_levels():
    assert education_level_from_text("Licence professionnelle")[0] == 3
    assert education_level_from_text("BTS comptabilité")[0] == 2
    assert education_level_from_text("Doctorat en chimie")[0] == 8
    assert education_level_from_text("aucun diplôme")[0] is None


OFFERS = [
    OfferInput(
        job=JobData(title="Développeur backend Django", description="API REST Python, Django, PostgreSQL.",
                    skills=["Python", "Django", "PostgreSQL", "Kubernetes"], required_experience=3,
                    location="Douala", education="Bac+5"),
        meta={"id": "dev"},
    ),
    OfferInput(
        job=JobData(title="Comptable", description="Comptabilité générale OHADA, fiscalité.",
                    skills=["Comptabilité", "Excel"], required_experience=2, location="Yaoundé"),
        meta={"id": "compta"},
    ),
]


def test_cv_analysis_is_relative_to_offers():
    result = analyze_cv_text(SAMPLE_CV, OFFERS, city="Douala")
    assert set(result.score_details) == {"competences", "experience", "semantique", "localisation", "formation"}
    names = {s["name"] for s in result.detected_skills}
    assert {"Python", "Django", "PostgreSQL", "Docker"} <= names
    # Les offres sont classées de la plus proche à la plus éloignée du CV.
    assert [o["id"] for o in result.offers] == ["dev", "compta"]
    assert result.offers[0]["score"] > result.offers[1]["score"]
    assert result.offers_count == 2
    # Les compétences manquantes viennent des offres, pas d'un référentiel général.
    assert "Kubernetes" in {m["name"] for m in result.missing_skills}
    assert result.strengths and "Développeur backend Django" in result.summary


def test_cv_close_to_offer_scores_higher():
    close = analyze_cv_text(SAMPLE_CV, OFFERS[:1], city="Douala")
    far = analyze_cv_text(SAMPLE_CV, OFFERS[1:], city="Douala")
    assert close.employability_score > far.employability_score
    assert far.weaknesses and far.recommendations


def test_no_offer_means_no_analysis():
    with pytest.raises(NoOffersError):
        analyze_cv_text(SAMPLE_CV, [])


def _candidate(**overrides):
    data = dict(
        skills={"Python": "AVANCE", "Django": "AVANCE", "PostgreSQL": "INTERMEDIAIRE", "Docker": "DEBUTANT"},
        experience_years=4, city="Douala", education_level=5, text=SAMPLE_CV, job_titles=["Développeur backend"],
    )
    data.update(overrides)
    return CandidateData(**data)


def test_matching_ranks_relevant_job_higher():
    backend = JobData(title="Développeur backend Django", description="API REST", skills=["Python", "Django"],
                      required_experience=3, location="Douala", education="Bac+5")
    accounting = JobData(title="Comptable", description="Comptabilité OHADA", skills=["Comptabilité", "Sage"],
                         required_experience=3, location="Yaoundé", education="Bac+3")
    good, bad = compute_match(_candidate(), backend), compute_match(_candidate(), accounting)
    assert good["score"] >= 80 > 40 > bad["score"]
    assert good["matched_skills"] == ["Python", "Django"]
    assert bad["missing_skills"] == ["Comptabilité", "Sage"]
    assert good["explanation"]


def test_matching_ignores_unknown_criteria_instead_of_default_score():
    job = JobData(title="Poste", description="", skills=["Python"])
    result = compute_match(_candidate(city=None, education_level=None), job)
    assert result["details"]["experience"] is None
    assert result["details"]["localisation"] is None
    assert result["details"]["formation"] is None


def test_related_skills_give_partial_credit():
    job = JobData(title="Dev", skills=["Kubernetes"])
    result = compute_match(_candidate(), job)
    assert result["partial_skills"] == [{"competence": "Kubernetes", "proche_de": "Docker"}]
    assert 0 < result["details"]["competences"] < 50


def test_remote_job_location():
    job = JobData(title="Dev", skills=["Python"], location="Télétravail")
    assert compute_match(_candidate(city="Garoua"), job)["details"]["localisation"] == 100


def test_interview_generation_targets_missing_skills():
    questions = generate_questions(job_title="Dev backend", company="Acme", job_skills=["Python", "Kubernetes"],
                                   candidate_skills=["Python"], interview_type="TECHNICAL", count=4, seed=1)
    assert len(questions) >= 3
    assert any(q.competence == "Kubernetes" and "monter en compétence" in q.question for q in questions)
    assert questions[0].categorie == "RH"


def test_interview_generation_types():
    for interview_type in ["MIXED", "BEHAVIORAL", "HR", "TECHNICAL"]:
        questions = generate_questions(job_title=None, company=None, job_skills=[], candidate_skills=[],
                                       interview_type=interview_type, count=6, seed=2)
        assert 3 <= len(questions) <= 6
        assert len({q.question for q in questions}) == len(questions)


def test_answer_evaluation():
    question = "Racontez une situation où vous avez géré un conflit dans une équipe."
    keywords = ["situation", "equipe", "ecoute", "solution", "resultat"]
    good = evaluate_answer(
        question,
        "Dans mon précédent poste chez Orange, la situation était tendue entre deux collègues de l'équipe. "
        "Mon objectif était de livrer le projet à temps. J'ai organisé une réunion d'écoute, puis j'ai proposé "
        "une solution de répartition des tâches. Résultat : le projet a été livré avec 2 jours d'avance et "
        "la satisfaction de l'équipe a augmenté de 20 %.",
        keywords, "BEHAVIORAL",
    )
    bad = evaluate_answer(question, "Je ne sais pas.", keywords, "BEHAVIORAL")
    empty = evaluate_answer(question, "", keywords, "BEHAVIORAL")
    assert good["score"] > 70 > bad["score"] > empty["score"] == 0
    assert bad["axes_amelioration"]


def test_session_summary():
    summary = summarize_session([{"score": 80, "criteres": {"structure": 80}}, {"score": 0}], ["RH", "TECHNIQUE"])
    assert summary["score_global"] == 40
    assert summary["scores_par_categorie"] == {"RH": 80, "TECHNIQUE": 0}
    assert summary["points_faibles"]


def test_cover_letter():
    letter = generate_cover_letter(CoverLetterInput(
        candidate_name="Jean Mballa", job_title="Développeur Django", company="Tech Corp", city="Douala",
        matched_skills=["Python", "Django"], missing_skills=["Kubernetes"], experience_years=4,
        last_position="Développeur backend", last_employer="MTN",
    ), today=date(2026, 9, 23))
    assert "Douala, le 23 septembre 2026" in letter
    assert "Développeur Django" in letter and "Tech Corp" in letter
    assert "Python et Django" in letter and "Kubernetes" in letter
