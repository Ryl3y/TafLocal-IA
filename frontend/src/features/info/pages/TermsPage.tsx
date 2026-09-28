import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { InfoPageLayout, InfoSection } from '../components/InfoPageLayout'

export function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Conditions"
      title="Conditions d’utilisation"
      updatedAt="28 septembre 2026"
      intro="En créant un compte ou en utilisant TafLocal AI, vous acceptez les conditions ci-dessous."
    >
      <InfoSection title="1. Objet du service">
        <p>
          TafLocal AI met en relation des candidats et des entreprises : publication d’offres, candidatures, analyse
          de CV, recommandations d’offres et entretiens simulés assistés par intelligence artificielle.
        </p>
      </InfoSection>

      <InfoSection title="2. Compte utilisateur">
        <ul>
          <li>Les informations fournies à l’inscription doivent être exactes et tenues à jour.</li>
          <li>Vous êtes responsable de la confidentialité de votre mot de passe et des actions réalisées depuis votre compte.</li>
          <li>Un compte est personnel : il ne peut être ni partagé ni cédé.</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Engagements des candidats">
        <p>
          Les CV, expériences et diplômes déclarés doivent être authentiques. Déposer les documents d’une autre
          personne ou des informations mensongères est interdit.
        </p>
      </InfoSection>

      <InfoSection title="4. Engagements des entreprises">
        <ul>
          <li>Les offres publiées doivent correspondre à de vrais postes, conformes à la législation du travail.</li>
          <li>Aucune somme ne peut être demandée à un candidat pour postuler ou être recruté.</li>
          <li>
            Les données des candidats reçues via la plateforme ne peuvent servir qu’au recrutement concerné ; elles ne
            peuvent être ni revendues ni réutilisées à d’autres fins.
          </li>
          <li>L’entreprise peut être invitée à justifier son existence (registre de commerce) avant de publier.</li>
        </ul>
      </InfoSection>

      <InfoSection title="5. Résultats de l’intelligence artificielle">
        <p>
          Les scores de compatibilité, analyses de CV, classements de candidatures et retours d’entretien sont
          calculés automatiquement et fournis à titre indicatif. Ils ne garantissent ni un entretien ni une
          embauche, et ne doivent pas être la seule base d’une décision de recrutement.
        </p>
      </InfoSection>

      <InfoSection title="6. Comportements interdits">
        <ul>
          <li>publier des contenus illicites, discriminatoires, trompeurs ou frauduleux ;</li>
          <li>tenter d’accéder aux données d’autres utilisateurs ou de perturber le fonctionnement de la plateforme ;</li>
          <li>collecter automatiquement les offres ou les profils publiés.</li>
        </ul>
        <p>Tout manquement peut entraîner la suspension ou la suppression du compte.</p>
      </InfoSection>

      <InfoSection title="7. Données personnelles">
        <p>
          Le traitement de vos données est décrit dans notre{' '}
          <Link to={ROUTES.PRIVACY} className="font-medium text-primary hover:text-primary-hover">
            politique de confidentialité
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection title="8. Évolution des conditions">
        <p>
          Ces conditions peuvent être modifiées pour suivre l’évolution du service ; la date de mise à jour figure en
          haut de cette page. Pour toute question,{' '}
          <Link to={ROUTES.CONTACT} className="font-medium text-primary hover:text-primary-hover">
            contactez-nous
          </Link>
          .
        </p>
      </InfoSection>
    </InfoPageLayout>
  )
}

export default TermsPage
