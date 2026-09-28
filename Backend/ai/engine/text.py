"""
Outils de traitement du texte pour le moteur IA interne.

Tout est implémenté en Python pur (aucune API externe, aucun modèle à
télécharger) : normalisation, découpage en mots, racinisation légère et
similarité cosinus entre deux textes.
"""

import math
import re
import unicodedata
from collections import Counter
from typing import Iterable

STOPWORDS = {
    # Français
    "a", "au", "aux", "avec", "ce", "ces", "cet", "cette", "dans", "de", "des", "du",
    "elle", "en", "et", "eux", "il", "ils", "je", "la", "le", "les", "leur", "leurs",
    "lui", "ma", "mais", "me", "meme", "mes", "moi", "mon", "ne", "nos", "notre",
    "nous", "on", "ou", "par", "pas", "pour", "qu", "que", "qui", "sa", "se", "ses",
    "son", "sur", "ta", "te", "tes", "toi", "ton", "tu", "un", "une", "vos", "votre",
    "vous", "c", "d", "j", "l", "m", "n", "s", "t", "y", "est", "sont", "ete", "etre",
    "avoir", "ai", "as", "avons", "avez", "ont", "etait", "sera", "fait", "faire",
    "plus", "tres", "tout", "tous", "toute", "toutes", "aussi", "ainsi", "comme",
    "si", "sans", "sous", "entre", "chez", "vers", "dont", "cela", "ceci", "ca",
    "quel", "quelle", "quels", "quelles", "comment", "pourquoi", "quand", "lors",
    # Anglais
    "the", "and", "or", "of", "to", "in", "on", "for", "with", "at", "by", "from",
    "is", "are", "was", "were", "be", "been", "an", "as", "it", "its", "this", "that",
    "these", "those", "i", "you", "he", "she", "we", "they", "my", "your", "our",
    "their", "have", "has", "had", "do", "does", "did", "not", "but", "so", "if",
}

_WORD_RE = re.compile(r"[a-z0-9][a-z0-9+#]*(?:\.[a-z0-9]+)*")
_SPACES_RE = re.compile(r"\s+")


def strip_accents(value: str) -> str:
    """Supprimer les accents (é -> e, ç -> c...)."""
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))


def normalize(value: str | None) -> str:
    """Mettre un texte en minuscules, sans accents et avec des espaces uniformes."""
    if not value:
        return ""
    value = strip_accents(value.lower())
    value = value.replace("’", "'").replace("`", "'")
    return _SPACES_RE.sub(" ", value).strip()


def stem(token: str) -> str:
    """Racinisation très légère (pluriels et quelques suffixes FR/EN)."""
    if len(token) <= 4 or any(ch.isdigit() for ch in token) or token[-1] in "+#":
        return token
    for suffix in ("ements", "ement", "ations", "ation", "ments", "ment", "ings", "ing",
                   "euses", "euse", "eurs", "eur", "ives", "ive", "ees", "ee", "es", "s", "e"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 4:
            return token[: -len(suffix)]
    return token


def tokenize(value: str | None, *, keep_stopwords: bool = False, stemmed: bool = True) -> list[str]:
    """Découper un texte en mots normalisés (et racinisés par défaut)."""
    tokens = _WORD_RE.findall(normalize(value))
    result = []
    for token in tokens:
        token = token.strip(".")
        if not token or (not keep_stopwords and token in STOPWORDS):
            continue
        if len(token) == 1 and not token.isdigit():
            continue
        result.append(stem(token) if stemmed else token)
    return result


def term_frequencies(value: str | None) -> Counter:
    return Counter(tokenize(value))


def cosine_similarity(text_a: str | None, text_b: str | None) -> float:
    """Similarité cosinus (tf sous-linéaire) entre deux textes, entre 0 et 1."""
    tf_a, tf_b = term_frequencies(text_a), term_frequencies(text_b)
    if not tf_a or not tf_b:
        return 0.0
    weight_a = {t: 1 + math.log(c) for t, c in tf_a.items()}
    weight_b = {t: 1 + math.log(c) for t, c in tf_b.items()}
    dot = sum(w * weight_b[t] for t, w in weight_a.items() if t in weight_b)
    norm_a = math.sqrt(sum(w * w for w in weight_a.values()))
    norm_b = math.sqrt(sum(w * w for w in weight_b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def term_pattern(term: str) -> re.Pattern:
    """Expression régulière qui trouve un terme entier dans un texte normalisé."""
    escaped = re.escape(normalize(term))
    escaped = escaped.replace(r"\ ", r"[\s\-_/]*")
    return re.compile(rf"(?<![a-z0-9]){escaped}(?![a-z0-9+#])")


def contains_term(normalized_text: str, term: str) -> bool:
    return bool(term_pattern(term).search(normalized_text))


def keyword_coverage(text: str | None, keywords: Iterable[str]) -> tuple[float, list[str], list[str]]:
    """Proportion des mots-clés présents dans le texte.

    La comparaison se fait sur les racines, ce qui tolère les pluriels et
    les variantes simples (« équipe » / « équipes »).
    """
    keywords = [k for k in keywords if k]
    if not keywords:
        return 0.0, [], []
    stems = set(tokenize(text, keep_stopwords=True))
    found, missing = [], []
    for keyword in keywords:
        keyword_stems = tokenize(keyword, keep_stopwords=True)
        if keyword_stems and all(s in stems for s in keyword_stems):
            found.append(keyword)
        else:
            missing.append(keyword)
    return len(found) / len(keywords), found, missing


def word_count(value: str | None) -> int:
    return len(_WORD_RE.findall(normalize(value)))


def clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, value))
