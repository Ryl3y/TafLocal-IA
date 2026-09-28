import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { InfoPageLayout, InfoSection } from '../components/InfoPageLayout'

export function PrivacyPage() {
  return (
    <InfoPageLayout
      eyebrow="Confidentialité"
      title="Politique de confidentialité"
      updatedAt="28 septembre 2026"
      intro="Cette page explique quelles données TafLocal AI collecte, pourquoi, qui peut les consulter et comment vous gardez la main dessus."
    >
      <InfoSection title="Données collectées">
        <ul>
          <li><strong>Compte</strong> : nom, prénom, email, téléphone, rôle (candidat ou entreprise) et mot de passe (stocké chiffré, jamais en clair).</li>
          <li><strong>Profil candidat</strong> : ville, expériences, formations, compétences et liens professionnels que vous renseignez.</li>
          <li><strong>CV</strong> : le fichier déposé et le texte qui en est extrait pour l’analyse.</li>
          <li><strong>Profil entreprise</strong> : informations de l’entreprise et documents fournis pour sa vérification (RCCM).</li>
          <li><strong>Activité</strong> : candidatures, entretiens simulés et notifications.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Utilisation des données">
        <p>Vos données servent uniquement à faire fonctionner la plateforme :</p>
        <ul>
          <li>analyser votre CV par rapport aux offres publiées et calculer votre compatibilité avec elles ;</li>
          <li>vous recommander des offres et transmettre vos candidatures aux entreprises concernées ;</li>
          <li>générer les entretiens simulés et leurs retours ;</li>
          <li>sécuriser votre compte (connexion, réinitialisation du mot de passe, protection contre les tentatives d’intrusion).</li>
        </ul>
        <p>
          L’analyse par intelligence artificielle est réalisée par notre propre moteur, sur nos serveurs : vos
          documents ne sont pas envoyés à un service d’IA externe. Vos données ne sont ni vendues ni louées.
        </p>
      </InfoSection>

      <InfoSection title="Qui peut voir vos données">
        <ul>
          <li><strong>Vos CV</strong> sont stockés dans un espace privé, jamais accessible par un lien public.</li>
          <li>
            <strong>Une entreprise</strong> ne voit que les CV et informations joints à une candidature que vous avez
            envoyée sur l’une de ses offres — pas vos autres CV.
          </li>
          <li><strong>Les administrateurs</strong> de la plateforme peuvent y accéder pour la modération et le support.</li>
        </ul>
      </InfoSection>

      <InfoSection id="cookies" title="Cookies et stockage local">
        <p>TafLocal AI n’utilise ni cookie publicitaire ni traceur tiers. Seuls sont utilisés :</p>
        <ul>
          <li>des <strong>cookies de session</strong> sécurisés (inaccessibles aux scripts de la page) qui vous maintiennent connecté ;</li>
          <li>un <strong>cookie de sécurité</strong> (CSRF) qui protège les formulaires ;</li>
          <li>le <strong>stockage local du navigateur</strong> pour mémoriser vos préférences d’affichage, comme le thème clair ou sombre.</li>
        </ul>
        <p>Ces éléments sont indispensables au service et ne servent pas à vous suivre sur d’autres sites.</p>
      </InfoSection>

      <InfoSection title="Vos droits">
        <p>
          Vous pouvez consulter et modifier à tout moment les informations de votre profil depuis votre espace, et
          supprimer vos CV (sauf s’ils sont joints à une candidature en cours : retirez-la d’abord). Pour obtenir une
          copie de vos données ou demander la suppression de votre compte,{' '}
          <Link to={ROUTES.CONTACT} className="font-medium text-primary hover:text-primary-hover">
            contactez-nous
          </Link>
          .
        </p>
      </InfoSection>
    </InfoPageLayout>
  )
}

export default PrivacyPage
