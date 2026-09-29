"""
Extraction de propositions de profil à partir du texte d'un CV.

Le module ne fait que *proposer* : coordonnées, présentation, ville,
expériences et formations. Rien n'est enregistré ici ; le candidat valide
(ou corrige) chaque proposition avant l'ajout à son profil.

Les CV en colonnes sortent du PDF dans le désordre (titres de section après
leur contenu, dates coupées sur plusieurs lignes). L'extraction ne s'appuie
donc pas sur les sections mais sur le *contenu* de chaque ligne : mots de
diplôme, d'établissement, de métier et formats de date.
"""

import re
from datetime import date

from .cv_parser import MONTHS, RANGE_RE, _MONTH_NAMES, _month, extract_contacts, split_sections
from .text import normalize, strip_accents

# Villes reconnues (Cameroun en priorité, puis grandes villes francophones).
KNOWN_CITIES = [
    "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Ngaoundéré", "Bertoua",
    "Kribi", "Limbé", "Buea", "Ebolowa", "Dschang", "Edéa", "Kumba", "Nkongsamba", "Foumban",
    "Koutaba", "Abidjan", "Dakar", "Libreville", "Lomé", "Cotonou", "Kinshasa", "Brazzaville",
    "Bamako", "Ouagadougou", "Niamey", "N'Djamena", "Malabo", "Bangui", "Conakry", "Paris", "Lyon",
    "Marseille", "Toulouse", "Lille", "Bruxelles", "Genève", "Montréal", "Québec",
]

SCHOOL_KEYWORDS = (
    "universite", "university", "ecole", "school", "institut", "institute", "faculte", "faculty",
    "lycee", "college", "iut", "academie", "academy", "polytechnique", "enset", "essec", "esstic",
    "centre de formation", "campus", "complexe scolaire", "groupe scolaire",
)

# Diplômes et certificats (sans « ingénieur », souvent un intitulé de poste).
DEGREE_KEYWORDS = (
    "doctorat", "phd", "master", "mastere", "msc", "mba", "maitrise", "licence", "bachelor", "bsc",
    "bts", "dut", "hnd", "deug", "dts", "deust", "baccalaureat", "bac", "probatoire", "bepc", "cepe",
    "cap", "bep", "brevet", "gce", "diplome", "certificat", "certification", "attestation",
    "dipes", "dipet", "capes", "capiet", "cafop",
)

JOB_KEYWORDS = (
    "developpeur", "developer", "ingenieur", "engineer", "stagiaire", "stage", "intern", "assistant",
    "assistante", "chef", "responsable", "technicien", "technicienne", "comptable", "manager",
    "consultant", "consultante", "designer", "analyste", "analyst", "commercial", "commerciale",
    "directeur", "directrice", "gestionnaire", "agent", "enseignant", "enseignante", "professeur",
    "secretaire", "charge", "chargee", "administrateur", "administratrice", "architecte",
    "infographiste", "graphiste", "redacteur", "redactrice", "formateur", "formatrice", "caissier",
    "caissiere", "vendeur", "vendeuse", "operateur", "operatrice", "superviseur", "coordinateur",
    "coordinatrice", "auditeur", "juriste", "infirmier", "infirmiere", "medecin", "chauffeur",
    "livreur", "magasinier", "logisticien", "marketeur", "community manager", "webmaster",
    "freelance", "benevole", "moniteur", "animateur", "animatrice",
)

_BULLET_RE = re.compile(r"^\s*[-•*▪●◦·➢>]\s*")
_YEAR_RE = re.compile(r"(?<!\d)((?:19|20)\d{2})(?!\d)")
_MONTH_YEAR_RE = re.compile(rf"(?<![a-z])({_MONTH_NAMES})\.?\s+((?:19|20)\d{{2}})(?!\d)")
_NUMERIC_MONTH_YEAR_RE = re.compile(r"(?<!\d)(\d{1,2})[/.-]((?:19|20)\d{2})(?!\d)")
_TITLE_SEPARATORS = re.compile(r"\s+(?:chez|at|@|pour|-|–|—|\|)\s+|\s*\|\s*", re.IGNORECASE)
_EDGE_PUNCT = " \t:;,.|-–—()[]/"

MAX_DESCRIPTION = 1000
MAX_BIO = 600


# --------------------------------------------------------------------------- #
# Outils
# --------------------------------------------------------------------------- #

def _normalize_with_map(line: str) -> tuple[str, list[int]]:
    """Normaliser une ligne en gardant, pour chaque caractère produit, sa position d'origine."""
    chars, positions = [], []
    for index, char in enumerate(line):
        converted = strip_accents(char.lower()).replace("’", "'").replace("`", "'")
        for piece in converted:
            chars.append(piece)
            positions.append(index)
    return "".join(chars), positions


def _has_keyword(line: str, keywords) -> bool:
    normalized = f" {normalize(line)} "
    return any(re.search(rf"(?<![a-z0-9]){re.escape(k)}(?![a-z0-9])", normalized) for k in keywords)


def _is_school(line: str) -> bool:
    return _has_keyword(line, SCHOOL_KEYWORDS)


def _is_degree(line: str) -> bool:
    return len(line) <= 100 and _has_keyword(line, DEGREE_KEYWORDS)


def _is_job(line: str) -> bool:
    return _has_keyword(line, JOB_KEYWORDS)


def _is_bullet(line: str) -> bool:
    return bool(_BULLET_RE.match(line))


def _clean(line: str) -> str:
    return re.sub(r"\s{2,}", " ", _BULLET_RE.sub("", line)).strip(_EDGE_PUNCT)


def _looks_like_heading(line: str) -> bool:
    """Ligne courte sans puce ni point final : intitulé de poste, entreprise, établissement…"""
    return not _is_bullet(line) and len(line) <= 90 and not line.rstrip().endswith(".")


def _strip_city(value: str) -> str:
    """« CODE_X Corporation, Douala » -> « CODE_X Corporation »."""
    for city in KNOWN_CITIES:
        pattern = rf"\s*[,\-–|]\s*{re.escape(city)}(?:\s*[,\-–]\s*\w+)?\s*$"
        stripped = re.sub(pattern, "", value, flags=re.IGNORECASE)
        if stripped != value and stripped.strip():
            return stripped.strip(_EDGE_PUNCT)
    return value


def merge_broken_dates(lines: list[str]) -> list[str]:
    """Recoller les dates coupées par la mise en page (« Juillet 2022 - » / « septembre » / « 2022 »)."""
    merged: list[str] = []
    for line in lines:
        if merged:
            previous = normalize(merged[-1])
            current = normalize(line)
            ends_with_dash = previous.endswith(("-", "–", "—", " a", " au", " to"))
            ends_with_month = re.search(rf"(?:^|\s)(?:{_MONTH_NAMES})\.?$", previous)
            if (ends_with_dash and (re.match(rf"(?:{_MONTH_NAMES}|\d)", current) or re.match(r"(?:present|aujourd|en cours|actuel)", current))) \
                    or (ends_with_month and re.fullmatch(r"(?:19|20)\d{2}.*", current)):
                merged[-1] = f"{merged[-1].rstrip()} {line.strip()}"
                continue
        merged.append(line)
    return merged


def _prepared_lines(text: str) -> list[str]:
    return merge_broken_dates([line.strip() for line in (text or "").splitlines() if line.strip()])


def _find_range(line: str):
    """Trouver une période « 2019 - 2022 » dans une ligne.

    Retourne (date_debut, date_fin, en_cours, reste_de_la_ligne) ou None.
    """
    normalized, positions = _normalize_with_map(line)
    match = RANGE_RE.search(normalized)
    if not match:
        return None
    groups = match.groupdict()
    start = date(int(groups["ay"]), _month(groups, "a", 1), 1)
    if groups.get("present"):
        end, current = None, True
    elif groups.get("by"):
        end, current = date(int(groups["by"]), _month(groups, "b", 12), 1), False
    else:
        return None
    if end and end < start:
        return None
    first, last = positions[match.start()], positions[match.end() - 1] + 1
    rest = (line[:first] + " " + line[last:]).strip(_EDGE_PUNCT)
    return start, end, current, re.sub(r"\s{2,}", " ", rest)


def _single_date(line: str) -> tuple[int | None, int | None]:
    """(année, mois) d'obtention : « Juin 2020 », « 06/2020 », « (2020) », « 2008/2009 »."""
    found = _find_range(line)
    if found:
        start, end, current, _ = found
        if current or end is None:
            return None, None
        return end.year, end.month if re.search(rf"{_MONTH_NAMES}|\d{{1,2}}[/.-](?:19|20)", normalize(line)) else None
    normalized = normalize(line)
    match = _MONTH_YEAR_RE.search(normalized)
    if match:
        return int(match.group(2)), MONTHS.get(match.group(1))
    match = _NUMERIC_MONTH_YEAR_RE.search(normalized)
    if match and 1 <= int(match.group(1)) <= 12:
        return int(match.group(2)), int(match.group(1))
    years = _YEAR_RE.findall(normalized)
    return (int(years[-1]), None) if years else (None, None)


def _without_dates(line: str) -> str:
    found = _find_range(line)
    if found:
        line = found[3]
    normalized, positions = _normalize_with_map(line)
    spans = [m.span() for m in _MONTH_YEAR_RE.finditer(normalized)]
    spans += [m.span() for m in _NUMERIC_MONTH_YEAR_RE.finditer(normalized)]
    spans += [m.span() for m in re.finditer(r"\(?(?:19|20)\d{2}(?:\s*/\s*(?:19|20)\d{2})?\)?", normalized)]
    for start, end in sorted(spans, reverse=True):
        if start < len(positions):
            line = line[:positions[start]] + " " + line[positions[min(end, len(positions)) - 1] + 1:]
    return _clean(line)


def _iso(value: date | None) -> str | None:
    return value.isoformat() if value else None


# --------------------------------------------------------------------------- #
# Expériences
# --------------------------------------------------------------------------- #

def _split_title(value: str) -> tuple[str, str]:
    """« Développeur Python chez Orange » -> (« Développeur Python », « Orange »)."""
    parts = [p.strip(_EDGE_PUNCT) for p in _TITLE_SEPARATORS.split(value, maxsplit=1)]
    parts = [p for p in parts if p]
    if len(parts) == 2:
        return parts[0], parts[1]
    return value.strip(_EDGE_PUNCT), ""


def _assign_poste_entreprise(candidates: list[str]) -> tuple[str, str]:
    """Choisir parmi les lignes voisines celle qui est le poste et celle qui est l'entreprise."""
    candidates = [c for c in candidates if c]
    if not candidates:
        return "", ""
    first = candidates[0]
    head, tail = _split_title(first)
    if tail and (_is_job(head) or not _is_job(tail)):
        return head, _strip_city(tail)
    job = next((c for c in candidates if _is_job(c)), None)
    if job is None:
        poste, entreprise = candidates[0], candidates[1] if len(candidates) > 1 else ""
    else:
        poste = job
        entreprise = next((c for c in candidates if c is not job), "")
    return poste, _strip_city(entreprise)


def extract_experiences(text: str) -> list[dict]:
    lines = _prepared_lines(text)
    used: set[int] = set()
    entries: list[dict] = []

    for index, line in enumerate(lines):
        found = _find_range(line)
        if not found:
            continue
        start, end, current, rest = found
        rest = _clean(rest)
        # Une période de scolarité n'est pas une expérience.
        if rest and (_is_school(rest) or _is_degree(rest)):
            continue

        after = []
        for j in range(index + 1, min(index + 3, len(lines))):
            if j in used or _find_range(lines[j]) or not _looks_like_heading(lines[j]):
                break
            after.append(j)
        above = [i for i in (index - 2, index - 1)
                 if i >= 0 and i not in used and _looks_like_heading(lines[i]) and not _find_range(lines[i])]

        chosen: list[int] = []
        if rest and _split_title(rest)[1]:
            candidates = [rest]
        elif rest:
            chosen = after[:1]
            candidates = [rest] + [_clean(lines[j]) for j in chosen]
        elif after:
            chosen = after[:2]
            candidates = [_clean(lines[j]) for j in chosen]
        else:
            chosen = above if len(above) == 2 and above[0] == index - 2 else above[-1:]
            candidates = [_clean(lines[i]) for i in chosen]

        if any(_is_school(c) or _is_degree(c) for c in candidates):
            continue
        poste, entreprise = _assign_poste_entreprise(candidates)
        if not poste:
            continue
        used.update(chosen + [index])

        # Description : puces ou phrases qui suivent immédiatement.
        description = []
        for j in range(max([index, *chosen]) + 1, len(lines)):
            candidate = lines[j]
            if j in used or _find_range(candidate):
                break
            if not (_is_bullet(candidate) or len(candidate.split()) >= 6):
                break
            description.append(_clean(candidate))
            used.add(j)

        entries.append({
            "poste": poste[:255],
            "entreprise": entreprise[:255],
            "date_debut": _iso(start),
            "date_fin": _iso(end),
            "en_cours": current,
            "description": "\n".join(description)[:MAX_DESCRIPTION],
        })
    return entries


# --------------------------------------------------------------------------- #
# Formations : diplôme ou certificat, établissement, mois et année d'obtention
# --------------------------------------------------------------------------- #

def extract_educations(text: str) -> list[dict]:
    lines = _prepared_lines(text)
    educations: list[dict] = []
    seen: set[str] = set()
    last_school: tuple[str, int | None, int | None] | None = None  # (nom, année, mois)

    for index, line in enumerate(lines):
        if _is_school(line) and not _is_degree(line):
            year, month = _single_date(line)
            last_school = (_without_dates(line), year, month)
            continue
        if not _is_degree(line):
            continue

        label = _without_dates(line)
        etablissement = ""
        head, tail = _split_title(label)
        if tail and _is_school(tail):
            label, etablissement = head, tail
        year, month = _single_date(line)

        # Établissement et date sur les lignes qui suivent (avant le diplôme suivant).
        for j in range(index + 1, min(index + 3, len(lines))):
            following = lines[j]
            if _is_degree(following) or _find_range(following) and not _is_school(following):
                break
            # « 2011/2012 École … » : établissement daté = début du bloc suivant.
            if _is_school(following) and _single_date(following)[0] is not None:
                break
            if not etablissement and _is_school(following):
                etablissement = _without_dates(following)
                if year is None:
                    year, month = _single_date(following)
            elif year is None and re.fullmatch(r"[\s()\d/.\-a-z]*", normalize(following)):
                year, month = _single_date(following)

        # Sinon : établissement mentionné juste avant (« 2011 - 2020 Lycée… » puis les diplômes).
        if not etablissement and last_school:
            etablissement = last_school[0]
            if year is None:
                year, month = last_school[1], last_school[2]

        key = normalize(label)
        if not label or key in seen:
            continue
        seen.add(key)
        educations.append({
            "diplome": label[:255],
            "etablissement": etablissement[:255],
            "annee": year,
            "mois": month,
        })
    return educations


# --------------------------------------------------------------------------- #
# Informations personnelles
# --------------------------------------------------------------------------- #

def extract_city(text: str) -> str | None:
    """Ville mentionnée dans l'en-tête / les coordonnées du CV."""
    lines = (text or "").splitlines()
    address = next((lines[i + 1] for i, line in enumerate(lines[:-1]) if normalize(line) in {"adresse", "address"}), "")
    for source in (address, "\n".join(lines[:15]), text or ""):
        normalized = normalize(source)
        for city in KNOWN_CITIES:
            if re.search(rf"(?<![a-z]){re.escape(normalize(city))}(?![a-z])", normalized):
                return city
    return None


def _with_scheme(url: str | None) -> str | None:
    if not url:
        return None
    return url if url.lower().startswith("http") else f"https://{url}"


def extract_biography(sections: dict[str, str]) -> str | None:
    """Texte de présentation : uniquement des phrases, jamais une liste de dates ou de diplômes."""
    kept = [
        _clean(line) for line in (sections.get("profil") or "").splitlines()
        if line.strip() and not _find_range(line) and not _YEAR_RE.search(line)
        and not _is_degree(line) and not _is_school(line)
    ]
    bio = " ".join(k for k in kept if k)
    if len(bio.split()) < 8 or not any(len(k.split()) >= 5 for k in kept):
        return None
    if len(bio) > MAX_BIO:
        bio = bio[:MAX_BIO].rsplit(" ", 1)[0] + "…"
    return bio


_BIRTH_LABELS = ("date de naissance", "ne le", "nee le", "ne(e) le", "birth date", "date of birth")
_DAY_MONTH_YEAR_RE = re.compile(rf"(?<!\d)(\d{{1,2}})(?:er)?\s*(?:[/.-]\s*(\d{{1,2}})\s*[/.-]|\s+({_MONTH_NAMES})\.?\s+)((?:19|20)\d{{2}})(?!\d)")


def extract_birth_date(text: str) -> str | None:
    """Date de naissance, sur la ligne du libellé ou la suivante (« Le 01 Janvier 1999 »)."""
    lines = [line for line in (text or "").splitlines() if line.strip()]
    for index, line in enumerate(lines):
        if not any(label in normalize(line) for label in _BIRTH_LABELS):
            continue
        for candidate in lines[index:index + 2]:
            match = _DAY_MONTH_YEAR_RE.search(normalize(candidate))
            if not match:
                continue
            day, month_num, month_name, year = match.groups()
            month = int(month_num) if month_num else MONTHS.get(month_name)
            try:
                return date(int(year), month, int(day)).isoformat()
            except (TypeError, ValueError):
                return None
    return None


def extract_address(text: str) -> str | None:
    """Ligne qui suit le libellé « Adresse »."""
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    for index, line in enumerate(lines[:-1]):
        if normalize(line).strip(" :") in {"adresse", "address", "domicile"}:
            value = _clean(lines[index + 1])
            return value[:255] if value and not EMAIL_OR_PHONE_RE.search(value) else None
    return None


EMAIL_OR_PHONE_RE = re.compile(r"@|\d{6,}")


def extract_personal_info(text: str, sections: dict[str, str]) -> dict:
    contacts = extract_contacts(text)
    phone = contacts.get("telephone")
    if phone and len(phone) > 20:  # limite du champ User.telephone
        phone = re.sub(r"[\s.\-()]", "", phone)[:20]
    info = {
        "telephone": phone,
        "date_naissance": extract_birth_date(text),
        "adresse": extract_address(text),
        "ville": extract_city(text),
        "linkedin": _with_scheme(contacts.get("linkedin")),
        "github": _with_scheme(contacts.get("github")),
        "portfolio": contacts.get("site_web"),
        "biographie": extract_biography(sections),
    }
    return {key: value for key, value in info.items() if value}


def extract_profile(text: str) -> dict:
    """Propositions de profil extraites d'un CV (jamais enregistrées automatiquement)."""
    text = text or ""
    return {
        "informations": extract_personal_info(text, split_sections(text)),
        "experiences": extract_experiences(text),
        "formations": extract_educations(text),
    }
