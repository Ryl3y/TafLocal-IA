import { FileText, MessageCircleMore, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AICompanion, AIInsightCard, AIScoreRing, CareerJourney } from '../../../components/ai'
import { JobCard } from '../../../components/cards/JobCard'
import { Card } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { CompanyLogo } from '../../../components/ui/CompanyLogo'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'
import { applicationsService, type Application } from '../../../services/api/applicationsService'
import { getLatestAnalysis, type CVAnalysis } from '../../../services/api/cvServices'
import {
  getInterviewSessions,
  type InterviewSession,
} from '../../../services/api/interviewServices'
import {
  formatJobPay,
  jobsService,
  type JobRecommendation,
} from '../../../services/api/jobsService'
import { cn } from '../../../utils/cn'

const quickLinks = [
  {
    title: 'Analyser mon CV',
    description: 'Score d’employabilité et recommandations.',
    href: ROUTES.CV_ANALYSIS,
    icon: FileText,
    tone: 'bg-pastel-blue',
  },
  {
    title: 'Offres recommandées',
    description: 'Les offres classées selon votre profil.',
    href: ROUTES.RECOMMENDED_JOBS,
    icon: Sparkles,
    tone: 'bg-pastel-mint',
  },
  {
    title: 'Entretien simulé',
    description: 'Préparez les entretiens des offres auxquelles vous avez postulé.',
    href: ROUTES.INTERVIEW.replace(':sessionId', 'new'),
    icon: MessageCircleMore,
    tone: 'bg-pastel-sand',
  },
]

const pastelTones = [
  'bg-pastel-pink',
  'bg-pastel-blue',
  'bg-pastel-mint',
  'bg-pastel-sand',
] as const

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Chaque bloc est indépendant : l'échec de l'un n'empêche pas l'affichage des autres.
    Promise.allSettled([
      // Seule une analyse terminée a un score (sans offre publiée, le CV n'est pas analysé).
      getLatestAnalysis().then((latest) => setAnalysis(latest?.status === 'COMPLETED' ? latest : null)),
      jobsService.getRecommendations({ limit: 7 }).then(setRecommendations),
      applicationsService.getApplications().then(setApplications),
      getInterviewSessions().then(setSessions),
    ]).finally(() => setIsLoading(false))
  }, [])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `${ROUTES.JOBS_LIST}?search=${encodeURIComponent(query)}` : ROUTES.JOBS_LIST)
  }

  // Première session (inscription ou première connexion) : bienvenue ; ensuite : bon retour.
  const isFirstVisit = (user?.loginCount ?? 0) <= 1
  const completedInterviews = sessions.filter((s) => s.statut === 'COMPLETED')
  const journeySteps = [
    {
      id: 'cv',
      title: 'CV analysé',
      description: analysis
        ? `Compatibilité avec les offres : ${analysis.employability_score}/100`
        : 'Déposez votre CV pour démarrer',
      status: analysis ? ('completed' as const) : ('current' as const),
    },
    {
      id: 'apply',
      title: 'Candidatures envoyées',
      description: applications.length
        ? `${applications.length} candidature(s)`
        : 'Postulez aux offres recommandées',
      status: applications.length
        ? ('completed' as const)
        : analysis
          ? ('current' as const)
          : ('upcoming' as const),
    },
    {
      id: 'interview',
      title: 'Entretien simulé',
      description: completedInterviews.length
        ? `${completedInterviews.length} simulation(s) terminée(s)`
        : 'Préparez vos entretiens',
      status: completedInterviews.length
        ? ('completed' as const)
        : applications.length
          ? ('current' as const)
          : ('upcoming' as const),
    },
  ]
  const topRecommendation = analysis?.recommendations[0]
  const featured = recommendations.slice(0, 3)
  const recommended = recommendations.slice(3, 7)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      {/* Salutation + recherche */}
      <header className="space-y-5">
        <div>
          <p className="text-sm text-muted">
            {isFirstVisit ? 'Bienvenue sur TafLocal IA !' : 'Bon retour parmi nous !'}
          </p>
          <h1 className="text-2xl font-bold text-foreground sm:text-[1.75rem]">
            {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Bienvenue'}{' '}
            <span aria-hidden>👋</span>
          </h1>
        </div>
        <form onSubmit={handleSearch} role="search" className="flex gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Rechercher une offre</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un poste, une compétence…"
              className="h-13 w-full rounded-lg bg-field pr-4 pl-12 text-sm text-foreground placeholder:text-muted focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:outline-none"
            />
          </label>
          <Link
            to={ROUTES.JOBS_LIST}
            aria-label="Filtres avancés"
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-lg bg-field text-primary transition-colors hover:bg-primary-light"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Link>
        </form>
      </header>

      {isLoading ? (
        <div className="rounded-2xl bg-surface p-6">
          <Loader label="Chargement de votre tableau de bord…" />
        </div>
      ) : (
        <>
          {/* Offres à la une — carrousel horizontal */}
          <section className="space-y-4" aria-labelledby="featured-title">
            <div className="section-title">
              <h2 id="featured-title">Offres à la une</h2>
              <Link to={ROUTES.RECOMMENDED_JOBS}>Voir tout</Link>
            </div>
            {featured.length === 0 ? (
              <Card className="text-sm text-muted">
                Aucune offre pour le moment.{' '}
                <Link to={ROUTES.CV_ANALYSIS} className="font-medium text-primary">
                  Analysez votre CV
                </Link>{' '}
                pour recevoir des recommandations.
              </Card>
            ) : (
              <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
                {featured.map(({ job, match }, index) => (
                  <Link
                    key={job.id}
                    to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}
                    className="w-[82%] shrink-0 snap-start sm:w-[55%] lg:w-auto"
                  >
                    <JobCard
                      featured
                      title={job.titre}
                      company={job.entreprise_nom}
                      location={job.localisation || 'Non précisée'}
                      contractType={job.type_contrat_display}
                      tags={job.competences_requises.slice(0, 2)}
                      salary={formatJobPay(job)}
                      compatibilityScore={match.score}
                      className={cn('h-full', index === 1 && '[background:var(--color-navy)]')}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recommandées — cartes pastel */}
          {recommended.length > 0 && (
            <section className="space-y-4" aria-labelledby="recommended-title">
              <div className="section-title">
                <h2 id="recommended-title">Recommandées pour vous</h2>
                <Link to={ROUTES.RECOMMENDED_JOBS}>Voir tout</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {recommended.map(({ job, match }, index) => (
                  <Link
                    key={job.id}
                    to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5',
                      pastelTones[index % pastelTones.length],
                    )}
                  >
                    <CompanyLogo
                      name={job.entreprise_nom}
                      src={job.entreprise_logo}
                      className="rounded-full"
                    />
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                      {job.titre}
                    </p>
                    <p className="text-xs text-muted">{job.entreprise_nom}</p>
                    <p className="text-xs font-semibold text-foreground">
                      {match.score}% compatible
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Assistant IA */}
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="relative overflow-hidden border-0 bg-navy p-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wider text-white/60 uppercase">
                    Compatibilité CV / offres
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {analysis ? `Score : ${analysis.employability_score}/100` : 'Aucun CV analysé'}
                  </h2>
                </div>
                {analysis ? (
                  <Link to={ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(analysis.id))}>
                    <Badge variant="glass">Voir le rapport</Badge>
                  </Link>
                ) : (
                  <Link to={ROUTES.CV_ANALYSIS}>
                    <Button
                      size="sm"
                      className="bg-white text-primary shadow-none hover:bg-white/90"
                    >
                      Analyser mon CV
                    </Button>
                  </Link>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="self-start rounded-2xl bg-surface p-2">
                  <AIScoreRing score={analysis?.employability_score ?? 0} label="Compatibilité" />
                </div>
                <p className="max-w-xl text-sm leading-6 text-white/75">
                  {analysis?.summary ??
                    'Déposez votre CV : le moteur IA le comparera aux offres publiées et calculera votre compatibilité.'}
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

          <section className="space-y-4" aria-labelledby="quick-title">
            <div className="section-title">
              <h2 id="quick-title">Actions rapides</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="group flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary',
                        item.tone,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">{item.title}</span>
                      <span className="block text-xs text-muted">{item.description}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {topRecommendation && (
              <AIInsightCard
                title={topRecommendation.title}
                category="Recommandation de votre analyse de CV"
                priority={topRecommendation.priority}
                insight={topRecommendation.description}
                actionItems={analysis?.recommendations.slice(1, 4).map((r) => r.title)}
              />
            )}
            <CareerJourney steps={journeySteps} title="Parcours de progression" />
          </div>
        </>
      )}
    </motion.div>
  )
}

export default DashboardPage
