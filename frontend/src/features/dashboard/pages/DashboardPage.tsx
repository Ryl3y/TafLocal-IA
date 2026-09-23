import { FileText, MessageCircleMore, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AICompanion, AIInsightCard, AIScoreRing, CareerJourney, MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'
import { applicationsService, type Application } from '../../../services/api/applicationsService'
import { getLatestAnalysis, type CVAnalysis } from '../../../services/api/cvServices'
import { getInterviewSessions, type InterviewSession } from '../../../services/api/interviewServices'
import { jobsService, type JobRecommendation } from '../../../services/api/jobsService'

const quickLinks = [
  { title: 'Analyser mon CV', description: 'Score d’employabilité et recommandations.', href: ROUTES.CV_ANALYSIS, icon: FileText },
  { title: 'Offres recommandées', description: 'Les offres classées selon votre profil.', href: ROUTES.RECOMMENDED_JOBS, icon: Sparkles },
  { title: 'Entretien simulé', description: 'Entraînez-vous avec le coach IA.', href: ROUTES.INTERVIEW.replace(':sessionId', 'new'), icon: MessageCircleMore },
]

export function DashboardPage() {
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Chaque bloc est indépendant : l'échec de l'un n'empêche pas l'affichage des autres.
    Promise.allSettled([
      getLatestAnalysis().then(setAnalysis),
      jobsService.getRecommendations({ limit: 3 }).then(setRecommendations),
      applicationsService.getApplications().then(setApplications),
      getInterviewSessions().then(setSessions),
    ]).finally(() => setIsLoading(false))
  }, [])

  const completedInterviews = sessions.filter((s) => s.statut === 'COMPLETED')
  const journeySteps = [
    {
      id: 'cv',
      title: 'CV analysé',
      description: analysis ? `Score d’employabilité : ${analysis.employability_score}/100` : 'Déposez votre CV pour démarrer',
      status: analysis ? ('completed' as const) : ('current' as const),
    },
    {
      id: 'apply',
      title: 'Candidatures envoyées',
      description: applications.length ? `${applications.length} candidature(s)` : 'Postulez aux offres recommandées',
      status: applications.length ? ('completed' as const) : analysis ? ('current' as const) : ('upcoming' as const),
    },
    {
      id: 'interview',
      title: 'Entretien simulé',
      description: completedInterviews.length ? `${completedInterviews.length} simulation(s) terminée(s)` : 'Préparez vos entretiens',
      status: completedInterviews.length ? ('completed' as const) : applications.length ? ('current' as const) : ('upcoming' as const),
    },
  ]
  const topRecommendation = analysis?.recommendations[0]

  return (
    <PageShell
      eyebrow="Tableau de bord candidat"
      title={`Bonjour ${user?.firstName ?? ''}, voici votre trajectoire`}
      description="Suivez votre progression, consultez vos recommandations IA et préparez votre prochain mouvement."
      actions={<Link to={ROUTES.CV_ANALYSIS}><Button>Analyser mon CV</Button></Link>}
    >
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement de votre tableau de bord…" /></div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Employabilité IA</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    {analysis ? `Score : ${analysis.employability_score}/100` : 'Aucun CV analysé'}
                  </h2>
                </div>
                {analysis && (
                  <Link to={ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(analysis.id))}>
                    <Badge variant="secondary">Voir le rapport</Badge>
                  </Link>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <AIScoreRing score={analysis?.employability_score ?? 0} label="Employabilité" />
                <p className="max-w-xl text-sm text-muted">
                  {analysis?.summary ?? 'Déposez votre CV : le moteur IA détectera vos compétences et calculera votre score d’employabilité.'}
                </p>
              </div>
            </Card>

            <AICompanion
              name="Coach TafLocal"
              status="online"
              message={
                !analysis
                  ? 'Commencez par analyser votre CV pour des recommandations personnalisées.'
                  : recommendations[0]
                    ? `Votre meilleure opportunité : ${recommendations[0].job.titre} (${recommendations[0].match.score} % compatible).`
                    : 'Complétez votre profil pour découvrir des offres compatibles.'
              }
              className="h-full"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{applications.length} candidature(s)</Badge>
                <Badge variant="outline">{completedInterviews.length} entretien(s) simulé(s)</Badge>
              </div>
            </AICompanion>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              {topRecommendation && (
                <AIInsightCard
                  title={topRecommendation.title}
                  category="Recommandation de votre analyse de CV"
                  priority={topRecommendation.priority}
                  insight={topRecommendation.description}
                  actionItems={analysis?.recommendations.slice(1, 4).map((r) => r.title)}
                />
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>Les prochaines étapes recommandées.</CardDescription>
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
                  <CardTitle>Meilleures offres pour vous</CardTitle>
                  <CardDescription>Calculées par le moteur IA à partir de votre profil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.length === 0 ? (
                    <p className="text-sm text-muted">Aucune offre publiée pour le moment.</p>
                  ) : (
                    recommendations.map(({ job, match }) => (
                      <Link
                        key={job.id}
                        to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/30"
                      >
                        <span className="text-sm text-foreground">{job.titre} · <span className="text-muted">{job.entreprise_nom}</span></span>
                        <MatchScoreBadge score={match.score} label="" />
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}

export default DashboardPage
