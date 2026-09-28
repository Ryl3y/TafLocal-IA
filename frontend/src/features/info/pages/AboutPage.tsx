import { BrainCircuit, Briefcase, FileSearch, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'
import { InfoPageLayout, InfoSection } from '../components/InfoPageLayout'

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Analyse de CV',
    text: 'Votre CV est comparé aux offres publiées : compatibilité, compétences exigées qui vous manquent et axes d’amélioration.',
  },
  {
    icon: Briefcase,
    title: 'Offres recommandées',
    text: 'Chaque offre reçoit un score de compatibilité expliqué (compétences, expérience, formation, localisation).',
  },
  {
    icon: MessagesSquare,
    title: 'Entretiens simulés',
    text: 'Entraînez-vous sur des questions adaptées au poste visé et recevez un retour détaillé sur vos réponses.',
  },
  {
    icon: BrainCircuit,
    title: 'Pour les recruteurs',
    text: 'Publiez vos offres et consultez les candidatures classées par compatibilité, à titre indicatif.',
  },
]

export function AboutPage() {
  const { isAuthenticated } = useAuth()

  return (
    <InfoPageLayout
      eyebrow="À propos"
      title="TafLocal AI, l’emploi local assisté par l’IA"
      intro="TafLocal AI rapproche les chercheurs d’emploi et les entreprises locales. La plateforme aide les candidats à comprendre ce que les recruteurs attendent, et les recruteurs à identifier plus vite les profils adaptés."
    >
      <InfoSection title="Notre mission">
        <p>
          Trouver un emploi ne devrait pas dépendre de la chance ou du réseau. TafLocal AI rend visibles les
          compétences réellement demandées par les offres et accompagne chaque candidat, de l’analyse de son CV
          jusqu’à la préparation de ses entretiens.
        </p>
      </InfoSection>

      <InfoSection title="Ce que propose la plateforme">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-5">
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-3 font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection title="Une IA qui s’explique">
        <p>
          Le moteur d’intelligence artificielle de TafLocal fonctionne sur nos propres serveurs : vos documents ne
          sont pas transmis à un service d’IA tiers. Chaque score est accompagné de son explication, pour que vous
          sachiez toujours sur quoi il repose. Les scores restent indicatifs : la décision finale appartient
          toujours aux personnes.
        </p>
      </InfoSection>

      {!isAuthenticated && (
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.REGISTER}>
            <Button>Créer un compte</Button>
          </Link>
          <Link to={ROUTES.CONTACT}>
            <Button variant="outline">Nous contacter</Button>
          </Link>
        </div>
      )}
    </InfoPageLayout>
  )
}

export default AboutPage
