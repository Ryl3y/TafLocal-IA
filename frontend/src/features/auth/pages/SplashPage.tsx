import { ArrowRight, BrainCircuit, BriefcaseBusiness, Mic, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AIRibbon } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'

const highlights = [
  {
    title: 'Analyse instantanée',
    description: 'Votre CV est transformé en profil d’employabilité avec des recommandations concrètes.',
    icon: BrainCircuit,
  },
  {
    title: 'Offres alignées',
    description: 'Découvrez des missions adaptées à votre expérience et à votre niveau de seniorité.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Préparation interview',
    description: 'Entraînez-vous avec un simulateur IA et recevez un feedback exploitable.',
    icon: Mic,
  },
]

const stats = [
  { label: 'Taux de matching', value: '+82%' },
  { label: 'Temps d’analyse', value: '2 min' },
  { label: 'Entretiens préparés', value: '4.8k+' },
]

export function SplashPage() {
  return (
    <PageShell
      eyebrow="L’IA qui transforme votre profil en opportunités"
      title="TafLocal AI"
      description="Un assistant de carrière premium pour analyser votre CV, découvrir des missions pertinentes et préparer vos entretiens avec confiance."
      actions={
        <>
          <Link to={ROUTES.AUTH}>
            <Button>Commencer gratuitement</Button>
          </Link>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="outline">Voir la démo</Button>
          </Link>
        </>
      }
      className="space-y-8"
    >
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 via-surface to-secondary-light/50 p-7 md:p-8">
          <AIRibbon className="mb-4" />
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Votre carrière mérite une expérience plus intelligente.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            TafLocal AI consolide l’analyse de CV, les recommandations d’offres et la préparation d’entretien dans une seule experience premium.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="primary">CV analysé par l’IA</Badge>
            <Badge variant="secondary">Offres qualifiées</Badge>
            <Badge variant="accent">Interview coaching</Badge>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-surface/90 p-4 shadow-sm">
                <p className="text-2xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="bg-surface w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <CardTitle>Assistant IA en continu</CardTitle>
            </div>
            <CardDescription>
              Un accompagnement intelligent, adapté à votre parcours professionnel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4">
              <p className="text-sm font-semibold text-foreground">“Votre profil montre une forte progression en data et product.”</p>
              <p className="mt-2 text-sm text-muted">Recommandation prioritaire : renforcer votre preuve de leadership sur 2 projets récents.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Prêt à passer à l’action ?</p>
                <p className="text-sm text-muted">Créez votre espace en moins de 2 minutes.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} hoverable className="border-border/70 bg-surface">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}

export default SplashPage
