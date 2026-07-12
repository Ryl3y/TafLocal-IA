import { FileText, MessageCircleMore, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AICompanion, AIInsightCard, AIScoreRing, CareerJourney } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'

const quickLinks = [
  {
    title: 'Analyser mon CV',
    description: 'Obtenez un score IA et des recommandations métiers.',
    href: ROUTES.CV_ANALYSIS,
    icon: FileText,
  },
  {
    title: 'Offres recommandées',
    description: 'Découvrez les missions qui correspondent à votre profil.',
    href: ROUTES.RECOMMENDED_JOBS,
    icon: Sparkles,
  },
  {
    title: 'Entretien simulé',
    description: 'Préparez vos réponses avec un coach IA.',
    href: ROUTES.INTERVIEW.replace(':sessionId', 'demo-session'),
    icon: MessageCircleMore,
  },
]

const journeySteps = [
  { id: 'cv', title: 'CV uploadé', description: 'Profil enrichi par l’analyse IA', status: 'completed' as const },
  { id: 'match', title: 'Matching opportunités', description: '3 offres qualifiées identifiées', status: 'current' as const },
  { id: 'interview', title: 'Entretien simulé', description: 'Préparation à venir', status: 'upcoming' as const },
]

export function DashboardPage() {
  return (
    <PageShell
      eyebrow="Tableau de bord candidat"
      title="Votre trajectoire professionnelle, clarifiée"
      description="Suivez votre progression, consultez vos recommandations IA et préparez votre prochain mouvement.
"
      actions={
        <Link to={ROUTES.CV_ANALYSIS}>
          <Button>Analyser mon CV</Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Employabilité IA</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Score d’alignement : 84/100</h2>
            </div>
            <Badge variant="secondary">Évolution +12%</Badge>
          </div>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <AIScoreRing score={84} label="Alignement profil" />
            <div className="max-w-xl space-y-3 text-sm text-muted">
              <p>Votre profil est particulièrement bien positionné pour les rôles de Product Analyst, Junior Data Analyst et Business Analyst.</p>
              <p>Deux leviers sont encore à renforcer : la preuve de leadership et l’optimisation de votre pitch de candidature.</p>
            </div>
          </div>
        </Card>

        <AICompanion
          name="Coach TafLocal"
          status="online"
          message="Vous êtes à 2 étapes d’un entretien prêt à être envoyé."
          className="h-full"
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Priorité haute</Badge>
            <Badge variant="outline">Réponse à préparer</Badge>
          </div>
        </AICompanion>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <AIInsightCard
            title="Insight IA du jour"
            category="Positionnement de carrière"
            priority="high"
            insight="Votre expérience en product et en analyse montre une forte maturité pour les postes orientés stratégie et efficacité opérationnelle."
            actionItems={['Renforcer votre preuve d’impact sur 2 projets récents', 'Adapter votre CV au format des missions ciblées', 'Préparer un pitch court pour les recruteurs']}
          />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>Explorez les prochaines étapes recommandées par l’IA.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} to={item.href} className="rounded-xl border border-border bg-background p-4 transition hover:border-primary/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CareerJourney steps={journeySteps} title="Parcours de progression" />
          <Card>
            <CardHeader>
              <CardTitle>Recommandation d’alignement</CardTitle>
              <CardDescription>Le profil est bien positionné pour les offres de niveau confirmé.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <span className="text-sm text-foreground">Product Analyst</span>
                <Badge variant="secondary">Très fort</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <span className="text-sm text-foreground">Junior Data Analyst</span>
                <Badge variant="primary">Fort</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <span className="text-sm text-foreground">Business Analyst</span>
                <Badge variant="accent">À développer</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

export default DashboardPage
