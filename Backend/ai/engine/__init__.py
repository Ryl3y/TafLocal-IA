"""
Moteur d'intelligence artificielle interne de TafLocal IA.

Ce paquet est volontairement indépendant de Django : il ne manipule que des
chaînes et des structures Python simples, ce qui le rend testable
unitairement. La couche Django (``ai.services``) se charge de lire et
d'enregistrer les données.

Modules :
- ``text``         : normalisation, découpage, similarité cosinus ;
- ``skills``       : référentiel de compétences et extraction ;
- ``cv_parser``    : lecture PDF/DOCX et extraction d'informations ;
- ``cv_analyzer``  : score d'employabilité et recommandations ;
- ``matching``     : compatibilité candidat ↔ offre ;
- ``interview``    : génération de questions et évaluation des réponses ;
- ``cover_letter`` : rédaction de lettres de motivation.
"""

ENGINE_NAME = "TafLocal IA (moteur interne)"
ENGINE_VERSION = "1.0.0"
