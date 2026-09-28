"""
Suggestions de profil extraites du CV : l'IA propose, le candidat valide.
"""

from datetime import date

import pytest
from django.core.files.base import ContentFile

from ai.engine.profile_extractor import extract_profile
from ai.services import SkillService
from cv_analysis.models import CV, AnalysisStatus, CVAnalysis, DetectedSkill
from users.models import CandidateSkill, Education, WorkExperience

URL = "/api/users/candidates/me/cv-suggestions/"

CV_TEXT = """Jean MBALLA
Développeur Python
Douala, Cameroun | +237 6 99 12 34 56 | jean.mballa@mail.com
linkedin.com/in/jeanmballa  github.com/jmballa

PROFIL
Développeur backend passionné, 4 ans d'expérience sur Django et PostgreSQL.

EXPÉRIENCE PROFESSIONNELLE
Développeur Backend chez Orange Cameroun   Janvier 2021 - Présent
- Conception d'API REST avec Django
- Mise en place de Docker et CI
Stagiaire développeur
MTN Cameroon
06/2019 - 12/2020
• Maintenance d'applications internes

FORMATION
Master en Génie Logiciel - Université de Douala   2017 - 2019
Licence en Informatique
Université de Yaoundé I
2016

COMPÉTENCES
Python, Django, PostgreSQL, Docker
"""


TWO_COLUMN_CV = """AMINA BELLO
Etudiante
2021 - 2022 Alpha Digital, Douala
Développeur web
Juillet 2020 -
septembre
2020
Beta Print, Douala
Infographiste
Date de naissance
Le 15 Mars 2000
Téléphone
699112233 / 677445566
Adresse
Akwa, Douala, Cameroun
PROFIL EXPÉRIENCES PROFESSIONNELLES
2012 - 2019 Lycée de New-Bell
Baccalauréat C (2019)
Probatoire C (2018)
BEPC (2016)
2011/2012 École publique de Bonabéri
CEPE
ÉDUCATION
Conception de sites Web
COMPÉTENCES
BEPC (2016)
"""


class TestProfileExtractor:
    def test_personal_information(self):
        info = extract_profile(CV_TEXT)["informations"]
        assert info["ville"] == "Douala"
        assert info["telephone"] == "+237 6 99 12 34 56"
        assert info["linkedin"] == "https://linkedin.com/in/jeanmballa"
        assert info["github"] == "https://github.com/jmballa"
        assert info["biographie"].startswith("Développeur backend passionné")

    def test_experiences_inline_and_multiline(self):
        first, second = extract_profile(CV_TEXT)["experiences"]
        assert (first["poste"], first["entreprise"]) == ("Développeur Backend", "Orange Cameroun")
        assert first["date_debut"] == "2021-01-01" and first["en_cours"] is True and first["date_fin"] is None
        assert "Conception d'API REST avec Django" in first["description"]
        assert "Stagiaire" not in first["description"]
        assert (second["poste"], second["entreprise"]) == ("Stagiaire développeur", "MTN Cameroon")
        assert (second["date_debut"], second["date_fin"]) == ("2019-06-01", "2020-12-01")

    def test_educations_have_single_obtention_date(self):
        master, licence = extract_profile(CV_TEXT)["formations"]
        assert master == {"diplome": "Master en Génie Logiciel", "etablissement": "Université de Douala",
                          "annee": 2019, "mois": None}
        assert licence == {"diplome": "Licence en Informatique", "etablissement": "Université de Yaoundé I",
                           "annee": 2016, "mois": None}

    def test_two_column_pdf_layout(self):
        """PDF en colonnes : titres après le contenu, dates coupées sur plusieurs lignes."""
        result = extract_profile(TWO_COLUMN_CV)
        info = result["informations"]
        assert info["telephone"] == "699112233"  # et non la période « 2021 - 2022 »
        assert info["date_naissance"] == "2000-03-15"
        assert info["adresse"] == "Akwa, Douala, Cameroun"
        assert "biographie" not in info  # la scolarité n'est pas une présentation

        assert [(e["poste"], e["entreprise"], e["date_debut"], e["date_fin"]) for e in result["experiences"]] == [
            ("Développeur web", "Alpha Digital", "2021-01-01", "2022-12-01"),
            ("Infographiste", "Beta Print", "2020-07-01", "2020-09-01"),
        ]
        assert result["formations"] == [
            {"diplome": "Baccalauréat C", "etablissement": "Lycée de New-Bell", "annee": 2019, "mois": None},
            {"diplome": "Probatoire C", "etablissement": "Lycée de New-Bell", "annee": 2018, "mois": None},
            {"diplome": "BEPC", "etablissement": "Lycée de New-Bell", "annee": 2016, "mois": None},
            {"diplome": "CEPE", "etablissement": "École publique de Bonabéri", "annee": 2012, "mois": None},
        ]

    def test_month_of_obtention_is_read_when_present(self):
        (formation,) = extract_profile("FORMATION\nBTS Comptabilité - Juin 2021\nInstitut Siantou")["formations"]
        assert formation == {"diplome": "BTS Comptabilité", "etablissement": "Institut Siantou",
                             "annee": 2021, "mois": 6}

    def test_empty_text(self):
        assert extract_profile("") == {"informations": {}, "experiences": [], "formations": []}


@pytest.fixture
def analyzed_cv(candidate_user):
    profile = candidate_user.candidate_profile
    cv = CV.objects.create(
        candidate=profile, file=ContentFile(b"x", name="cv.txt"), file_name="cv.txt",
        file_size=1, file_type="text/plain", extracted_text=CV_TEXT, is_processed=True,
    )
    analysis = CVAnalysis.objects.create(cv=cv, status=AnalysisStatus.COMPLETED, employability_score=70)
    for name in ("Python", "Django", "Docker"):
        DetectedSkill.objects.create(analysis=analysis, name=name, proficiency_level="AVANCE")
    return cv


class TestSuggestionsAPI:
    def test_without_cv(self, authenticated_client):
        response = authenticated_client.get(URL)
        assert response.status_code == 200
        assert response.data["cv"] is None
        assert response.data["experiences"] == []

    def test_suggestions_are_read_only(self, authenticated_client, candidate_user, analyzed_cv):
        profile = candidate_user.candidate_profile
        response = authenticated_client.get(URL)
        assert response.status_code == 200
        data = response.data
        assert data["cv"]["file_name"] == "cv.txt"
        assert {s["nom"] for s in data["competences"]} == {"Python", "Django", "Docker"}
        assert len(data["experiences"]) == 2 and len(data["formations"]) == 2
        # Rien n'a été enregistré : la validation appartient au candidat.
        profile.refresh_from_db()
        candidate_user.refresh_from_db()
        assert not CandidateSkill.objects.filter(candidate=profile).exists()
        assert not WorkExperience.objects.filter(candidate=profile).exists()
        assert not Education.objects.filter(candidate=profile).exists()
        assert candidate_user.telephone in (None, "")
        assert profile.linkedin in (None, "")

    def test_already_known_items_are_not_suggested(self, authenticated_client, candidate_user, analyzed_cv):
        profile = candidate_user.candidate_profile
        # La ville du profil (Douala) correspond déjà au CV.
        CandidateSkill.objects.create(candidate=profile, skill=SkillService.get_or_create("Python"))
        WorkExperience.objects.create(candidate=profile, poste="Développeur backend", entreprise="Orange",
                                      date_debut=date(2021, 1, 1), en_cours=True)
        Education.objects.create(candidate=profile, diplome="Licence en informatique", etablissement="UY1")

        data = authenticated_client.get(URL).data
        assert "ville" not in {i["champ"] for i in data["informations"]}
        assert "Python" not in {s["nom"] for s in data["competences"]}
        assert [e["poste"] for e in data["experiences"]] == ["Stagiaire développeur"]
        assert [f["diplome"] for f in data["formations"]] == ["Master en Génie Logiciel"]

    def test_current_value_is_returned_for_comparison(self, authenticated_client, candidate_user, analyzed_cv):
        profile = candidate_user.candidate_profile
        profile.linkedin = "https://linkedin.com/in/ancien"
        profile.save()
        linkedin = next(i for i in authenticated_client.get(URL).data["informations"] if i["champ"] == "linkedin")
        assert linkedin["valeur"] == "https://linkedin.com/in/jeanmballa"
        assert linkedin["valeur_actuelle"] == "https://linkedin.com/in/ancien"

    def test_only_own_cv_is_used(self, api_client, other_candidate_user, analyzed_cv):
        from tests.conftest import auth_client

        data = auth_client(other_candidate_user).get(URL).data
        assert data["cv"] is None

    def test_company_is_forbidden(self, company_client):
        assert company_client.get(URL).status_code == 403
