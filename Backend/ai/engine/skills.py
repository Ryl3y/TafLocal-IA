"""
Référentiel de compétences et extraction de compétences depuis un texte.

Le référentiel associe à chaque compétence « canonique » une catégorie et une
liste de synonymes. Il remplace l'extraction par LLM (Gemini) : la détection
est déterministe, explicable et fonctionne hors ligne.
"""

import re
from dataclasses import dataclass, field
from functools import lru_cache

from .text import normalize, term_pattern

# nom canonique -> (catégorie, synonymes)
SKILL_TAXONOMY: dict[str, tuple[str, tuple[str, ...]]] = {
    # Langages de programmation
    "Python": ("Langages", ("python", "python3")),
    "Java": ("Langages", ("java", "java ee", "jee", "j2ee")),
    "JavaScript": ("Langages", ("javascript", "js", "ecmascript", "es6")),
    "TypeScript": ("Langages", ("typescript",)),
    "PHP": ("Langages", ("php",)),
    "C#": ("Langages", ("c#", "csharp", "c sharp")),
    "C++": ("Langages", ("c++", "cpp")),
    "C": ("Langages", ("langage c", "programmation c", "c ansi")),
    "Go": ("Langages", ("golang", "go lang")),
    "Rust": ("Langages", ("rust",)),
    "Kotlin": ("Langages", ("kotlin",)),
    "Swift": ("Langages", ("swiftui", "langage swift", "swift ios")),
    "Dart": ("Langages", ("dart",)),
    "Ruby": ("Langages", ("ruby",)),
    "R": ("Langages", ("langage r", "rstudio", "r studio")),
    "Scala": ("Langages", ("scala",)),
    "Bash": ("Langages", ("bash", "script shell", "scripts shell", "powershell")),
    "VBA": ("Langages", ("vba", "macros excel")),
    "MATLAB": ("Langages", ("matlab",)),
    # Frontend
    "HTML": ("Frontend", ("html", "html5")),
    "CSS": ("Frontend", ("css", "css3", "sass", "scss")),
    "React": ("Frontend", ("react", "reactjs", "react.js")),
    "Angular": ("Frontend", ("angular", "angularjs")),
    "Vue.js": ("Frontend", ("vue", "vuejs", "vue.js")),
    "Next.js": ("Frontend", ("next.js", "nextjs")),
    "Tailwind CSS": ("Frontend", ("tailwind", "tailwindcss")),
    "Bootstrap": ("Frontend", ("bootstrap",)),
    "jQuery": ("Frontend", ("jquery",)),
    "Redux": ("Frontend", ("redux",)),
    # Backend
    "Django": ("Backend", ("django", "django rest framework", "drf")),
    "Flask": ("Backend", ("flask",)),
    "FastAPI": ("Backend", ("fastapi",)),
    "Node.js": ("Backend", ("node.js", "nodejs", "node js")),
    "Express": ("Backend", ("express", "express.js", "expressjs")),
    "NestJS": ("Backend", ("nestjs", "nest.js")),
    "Spring": ("Backend", ("spring", "spring boot", "springboot")),
    "Laravel": ("Backend", ("laravel",)),
    "Symfony": ("Backend", ("symfony",)),
    ".NET": ("Backend", (".net", "dotnet", "asp.net", "asp net")),
    "API REST": ("Backend", ("api rest", "rest api", "restful", "api restful", "web services")),
    "GraphQL": ("Backend", ("graphql",)),
    "Microservices": ("Backend", ("microservices", "micro services", "micro-services")),
    # Mobile
    "Android": ("Mobile", ("android",)),
    "iOS": ("Mobile", ("ios",)),
    "Flutter": ("Mobile", ("flutter",)),
    "React Native": ("Mobile", ("react native",)),
    # Données & IA
    "SQL": ("Données", ("sql", "t-sql", "pl/sql", "plsql")),
    "PostgreSQL": ("Données", ("postgresql", "postgres")),
    "MySQL": ("Données", ("mysql", "mariadb")),
    "Oracle": ("Données", ("oracle", "oracle database")),
    "SQL Server": ("Données", ("sql server", "mssql")),
    "MongoDB": ("Données", ("mongodb", "mongo")),
    "Redis": ("Données", ("redis",)),
    "Elasticsearch": ("Données", ("elasticsearch", "elastic search")),
    "Power BI": ("Données", ("power bi", "powerbi")),
    "Tableau": ("Données", ("tableau software", "tableau desktop")),
    "Pandas": ("Données", ("pandas",)),
    "NumPy": ("Données", ("numpy",)),
    "Machine Learning": ("Données", ("machine learning", "apprentissage automatique", "ml")),
    "Deep Learning": ("Données", ("deep learning", "apprentissage profond", "reseaux de neurones")),
    "Data Science": ("Données", ("data science", "science des donnees", "data scientist")),
    "Data Analysis": ("Données", ("analyse de donnees", "data analysis", "data analyst", "analyse des donnees")),
    "Big Data": ("Données", ("big data", "hadoop", "spark", "pyspark")),
    "TensorFlow": ("Données", ("tensorflow",)),
    "PyTorch": ("Données", ("pytorch",)),
    "Scikit-learn": ("Données", ("scikit-learn", "sklearn", "scikit learn")),
    "NLP": ("Données", ("nlp", "traitement du langage naturel", "natural language processing")),
    "Statistiques": ("Données", ("statistiques", "statistics", "statistique")),
    "ETL": ("Données", ("etl", "talend", "informatica")),
    # Cloud / DevOps / Systèmes
    "Docker": ("Cloud & DevOps", ("docker", "conteneurisation", "containers")),
    "Kubernetes": ("Cloud & DevOps", ("kubernetes", "k8s")),
    "AWS": ("Cloud & DevOps", ("aws", "amazon web services")),
    "Azure": ("Cloud & DevOps", ("azure", "microsoft azure")),
    "Google Cloud": ("Cloud & DevOps", ("gcp", "google cloud")),
    "CI/CD": ("Cloud & DevOps", ("ci/cd", "ci cd", "integration continue", "jenkins", "gitlab ci", "github actions")),
    "Terraform": ("Cloud & DevOps", ("terraform",)),
    "Ansible": ("Cloud & DevOps", ("ansible",)),
    "Linux": ("Cloud & DevOps", ("linux", "ubuntu", "debian", "centos", "unix")),
    "Windows Server": ("Cloud & DevOps", ("windows server", "active directory")),
    "Réseaux": ("Cloud & DevOps", ("reseaux", "reseau informatique", "tcp/ip", "cisco", "ccna", "networking")),
    "Cybersécurité": ("Cloud & DevOps", ("cybersecurite", "securite informatique", "cybersecurity", "pentest", "securite des systemes")),
    "Nginx": ("Cloud & DevOps", ("nginx", "apache")),
    # Outils
    "Git": ("Outils", ("git", "github", "gitlab", "bitbucket")),
    "Jira": ("Outils", ("jira", "confluence")),
    "Figma": ("Design", ("figma",)),
    "Adobe Photoshop": ("Design", ("photoshop",)),
    "Adobe Illustrator": ("Design", ("illustrator",)),
    "UI/UX Design": ("Design", ("ui/ux", "ux design", "ui design", "design ux", "experience utilisateur", "ux/ui")),
    "Canva": ("Design", ("canva",)),
    "AutoCAD": ("Design", ("autocad",)),
    # Méthodes
    "Agile": ("Méthodes", ("agile", "methodes agiles", "methodologie agile")),
    "Scrum": ("Méthodes", ("scrum",)),
    "Kanban": ("Méthodes", ("kanban",)),
    "Tests unitaires": ("Méthodes", ("tests unitaires", "unit tests", "pytest", "jest", "junit", "tdd")),
    "UML": ("Méthodes", ("uml", "merise")),
    "DevOps": ("Méthodes", ("devops",)),
    # Bureautique
    "Microsoft Excel": ("Bureautique", ("excel", "ms excel", "microsoft excel", "tableur")),
    "Microsoft Word": ("Bureautique", ("word", "ms word", "microsoft word", "traitement de texte")),
    "Microsoft PowerPoint": ("Bureautique", ("powerpoint", "ms powerpoint")),
    "Pack Office": ("Bureautique", ("pack office", "microsoft office", "ms office", "suite office")),
    "Google Workspace": ("Bureautique", ("google workspace", "google sheets", "google docs")),
    # Gestion & business
    "Gestion de projet": ("Gestion", ("gestion de projet", "gestion de projets", "project management", "chef de projet", "pmp", "prince2")),
    "Management d'équipe": ("Gestion", ("management d'equipe", "management", "encadrement", "leadership", "team management", "gestion d'equipe")),
    "Planification": ("Gestion", ("planification", "planning", "ms project")),
    "Analyse financière": ("Finance", ("analyse financiere", "financial analysis", "controle de gestion")),
    "Comptabilité": ("Finance", ("comptabilite", "accounting", "comptable", "ohada", "syscohada")),
    "Fiscalité": ("Finance", ("fiscalite", "fiscal", "declarations fiscales")),
    "Audit": ("Finance", ("audit", "audit interne", "commissariat aux comptes")),
    "Sage": ("Finance", ("sage", "sage saari", "sage 100")),
    "SAP": ("Finance", ("sap", "sap erp")),
    "Trésorerie": ("Finance", ("tresorerie", "cash management")),
    "Paie": ("RH", ("paie", "gestion de la paie", "payroll")),
    "Recrutement": ("RH", ("recrutement", "recruitment", "talent acquisition", "sourcing")),
    "Gestion RH": ("RH", ("ressources humaines", "gestion rh", "gestion des ressources humaines", "human resources", "grh")),
    "Droit du travail": ("RH", ("droit du travail", "droit social", "code du travail")),
    "Formation": ("RH", ("ingenierie de formation", "animation de formation", "formateur")),
    "Marketing digital": ("Marketing", ("marketing digital", "digital marketing", "webmarketing", "marketing numerique")),
    "SEO": ("Marketing", ("seo", "referencement naturel")),
    "SEA": ("Marketing", ("google ads", "adwords", "referencement payant")),
    "Réseaux sociaux": ("Marketing", ("reseaux sociaux", "social media", "community management", "community manager")),
    "Content marketing": ("Marketing", ("content marketing", "redaction web", "copywriting", "creation de contenu")),
    "Étude de marché": ("Marketing", ("etude de marche", "market research", "veille concurrentielle")),
    "Communication": ("Marketing", ("communication", "relations publiques", "communication interne")),
    "Vente": ("Commercial", ("vente", "ventes", "sales", "commercial", "prospection", "business development")),
    "Négociation": ("Commercial", ("negociation", "negotiation")),
    "Relation client": ("Commercial", ("relation client", "service client", "customer service", "satisfaction client", "fidelisation")),
    "CRM": ("Commercial", ("crm", "salesforce", "hubspot")),
    "E-commerce": ("Commercial", ("e-commerce", "ecommerce", "commerce en ligne", "shopify", "woocommerce")),
    "Logistique": ("Logistique", ("logistique", "supply chain", "chaine d'approvisionnement")),
    "Gestion des stocks": ("Logistique", ("gestion des stocks", "inventaire", "stock management")),
    "Achats": ("Logistique", ("achats", "approvisionnement", "procurement")),
    "Transport": ("Logistique", ("transport", "transit", "douane", "dedouanement")),
    "Qualité": ("Industrie", ("qualite", "iso 9001", "controle qualite", "quality assurance", "assurance qualite")),
    "HSE": ("Industrie", ("hse", "qhse", "hygiene securite environnement", "securite au travail")),
    "Maintenance industrielle": ("Industrie", ("maintenance industrielle", "maintenance", "electromecanique")),
    "Électricité": ("Industrie", ("electricite", "electrotechnique", "electricien")),
    "BTP": ("Industrie", ("btp", "genie civil", "batiment", "travaux publics")),
    "Agronomie": ("Industrie", ("agronomie", "agriculture", "agro-industrie", "agroalimentaire")),
    "Soins infirmiers": ("Santé", ("soins infirmiers", "infirmier", "infirmiere")),
    "Pharmacie": ("Santé", ("pharmacie", "pharmacien", "pharmaceutique")),
    "Enseignement": ("Éducation", ("enseignement", "pedagogie", "enseignant", "professeur")),
    "Juridique": ("Juridique", ("droit des affaires", "juriste", "juridique", "contrats", "droit des contrats")),
    # Compétences comportementales
    "Travail en équipe": ("Savoir-être", ("travail en equipe", "esprit d'equipe", "teamwork", "collaboration")),
    "Communication orale": ("Savoir-être", ("communication orale", "prise de parole", "aisance relationnelle", "presentation orale")),
    "Autonomie": ("Savoir-être", ("autonomie", "autonome")),
    "Rigueur": ("Savoir-être", ("rigueur", "rigoureux", "rigoureuse", "sens du detail")),
    "Résolution de problèmes": ("Savoir-être", ("resolution de problemes", "problem solving", "esprit d'analyse", "esprit analytique")),
    "Organisation": ("Savoir-être", ("organisation", "organise", "organisee", "gestion du temps")),
    "Adaptabilité": ("Savoir-être", ("adaptabilite", "capacite d'adaptation", "flexibilite")),
    "Créativité": ("Savoir-être", ("creativite", "creatif", "creative")),
    "Gestion du stress": ("Savoir-être", ("gestion du stress", "resistance au stress", "sous pression")),
    # Langues
    "Français": ("Langues", ("francais", "french")),
    "Anglais": ("Langues", ("anglais", "english", "toeic", "toefl", "ielts")),
    "Espagnol": ("Langues", ("espagnol", "spanish")),
    "Allemand": ("Langues", ("allemand", "german")),
    "Arabe": ("Langues", ("arabe", "arabic")),
    "Chinois": ("Langues", ("chinois", "mandarin", "chinese")),
    "Portugais": ("Langues", ("portugais", "portuguese")),
}

# Compétences proches : un candidat qui maîtrise l'une a une base pour l'autre.
RELATED_SKILLS: dict[str, tuple[str, ...]] = {
    "JavaScript": ("TypeScript", "React", "Vue.js", "Angular", "Node.js"),
    "TypeScript": ("JavaScript", "Angular", "React"),
    "React": ("JavaScript", "Next.js", "React Native", "Redux", "Vue.js"),
    "Vue.js": ("JavaScript", "React", "Angular"),
    "Angular": ("TypeScript", "React", "Vue.js"),
    "Python": ("Django", "Flask", "FastAPI", "Pandas"),
    "Django": ("Python", "Flask", "FastAPI"),
    "Flask": ("Python", "Django", "FastAPI"),
    "FastAPI": ("Python", "Django", "Flask"),
    "Java": ("Spring", "Kotlin"),
    "Spring": ("Java",),
    "PHP": ("Laravel", "Symfony"),
    "Laravel": ("PHP", "Symfony"),
    "Symfony": ("PHP", "Laravel"),
    "SQL": ("PostgreSQL", "MySQL", "Oracle", "SQL Server"),
    "PostgreSQL": ("SQL", "MySQL"),
    "MySQL": ("SQL", "PostgreSQL"),
    "Docker": ("Kubernetes", "CI/CD", "Linux"),
    "Kubernetes": ("Docker",),
    "AWS": ("Azure", "Google Cloud"),
    "Azure": ("AWS", "Google Cloud"),
    "Google Cloud": ("AWS", "Azure"),
    "Machine Learning": ("Deep Learning", "Data Science", "Scikit-learn", "Python"),
    "Data Analysis": ("SQL", "Microsoft Excel", "Power BI", "Statistiques"),
    "Power BI": ("Tableau", "Microsoft Excel", "Data Analysis"),
    "Comptabilité": ("Fiscalité", "Analyse financière", "Sage", "Audit"),
    "Analyse financière": ("Comptabilité", "Microsoft Excel", "Trésorerie"),
    "Marketing digital": ("SEO", "SEA", "Réseaux sociaux", "Content marketing"),
    "Vente": ("Négociation", "Relation client", "CRM"),
    "Gestion de projet": ("Agile", "Scrum", "Planification"),
    "Agile": ("Scrum", "Kanban"),
    "Scrum": ("Agile", "Kanban"),
    "Flutter": ("Dart", "Android", "iOS"),
    "React Native": ("React", "Android", "iOS"),
    "Microsoft Excel": ("Pack Office", "VBA"),
    "Pack Office": ("Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint"),
    "Recrutement": ("Gestion RH",),
    "Gestion RH": ("Recrutement", "Paie", "Droit du travail"),
}

SOFT_SKILL_CATEGORIES = {"Savoir-être", "Langues"}


@dataclass
class DetectedSkillInfo:
    name: str
    category: str
    occurrences: int = 1
    years: int | None = None
    positions: list[int] = field(default_factory=list)


@lru_cache(maxsize=1)
def _compiled_taxonomy() -> list[tuple[str, str, list[re.Pattern]]]:
    compiled = []
    for name, (category, aliases) in SKILL_TAXONOMY.items():
        patterns = [term_pattern(alias) for alias in aliases]
        compiled.append((name, category, patterns))
    return compiled


@lru_cache(maxsize=1)
def _alias_index() -> dict[str, str]:
    index = {}
    for name, (_, aliases) in SKILL_TAXONOMY.items():
        index[normalize(name)] = name
        for alias in aliases:
            index[normalize(alias)] = name
    return index


def canonical_skill_name(raw: str) -> str:
    """Retourner le nom canonique d'une compétence (ou le nom nettoyé s'il est inconnu)."""
    cleaned = " ".join((raw or "").split()).strip(" ,;.-")
    if not cleaned:
        return ""
    known = _alias_index().get(normalize(cleaned))
    if known:
        return known
    return cleaned[:1].upper() + cleaned[1:]


def skill_category(name: str) -> str | None:
    entry = SKILL_TAXONOMY.get(canonical_skill_name(name))
    return entry[0] if entry else None


def related_skills(name: str) -> tuple[str, ...]:
    return RELATED_SKILLS.get(canonical_skill_name(name), ())


_YEARS_NEAR_RE = re.compile(r"(\d{1,2})\s*\+?\s*(?:ans|annees|an|years?|yrs?)")


def extract_skills(text: str | None) -> list[DetectedSkillInfo]:
    """Détecter les compétences du référentiel présentes dans un texte."""
    normalized = normalize(text)
    if not normalized:
        return []

    found: list[DetectedSkillInfo] = []
    for name, category, patterns in _compiled_taxonomy():
        positions = []
        for pattern in patterns:
            positions.extend(m.start() for m in pattern.finditer(normalized))
        if not positions:
            continue
        positions.sort()
        years = None
        for pos in positions:
            window = normalized[max(0, pos - 40): pos + 60]
            match = _YEARS_NEAR_RE.search(window)
            if match:
                value = int(match.group(1))
                if 0 < value <= 40:
                    years = max(years or 0, value)
        found.append(DetectedSkillInfo(name, category, len(positions), years, positions))

    return sorted(found, key=lambda s: (-s.occurrences, s.name))


def extract_skill_names(text: str | None) -> list[str]:
    return [skill.name for skill in extract_skills(text)]


def proficiency_from_occurrences(occurrences: int, years: int | None) -> str:
    """Estimer un niveau de maîtrise à partir des indices présents dans le CV."""
    if years is not None:
        if years >= 5:
            return "EXPERT"
        if years >= 3:
            return "AVANCE"
        if years >= 1:
            return "INTERMEDIAIRE"
    if occurrences >= 4:
        return "AVANCE"
    if occurrences >= 2:
        return "INTERMEDIAIRE"
    return "DEBUTANT"


LEVEL_WEIGHTS = {"DEBUTANT": 0.6, "INTERMEDIAIRE": 0.8, "AVANCE": 0.95, "EXPERT": 1.0}
