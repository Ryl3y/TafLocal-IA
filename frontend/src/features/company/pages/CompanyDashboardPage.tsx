import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, Plus, Users2 } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { applicationsService, type Application } from '../../../services/api/applicationsService'
import { jobsService, JOB_STATUSES, type Job } from '../../../services/api/jobsService'

function isWithinLastDays(dateString: string, days: number): boolean {
  const date = new Date(dateString)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - days)
  return date >= threshold
}

export function CompanyDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        const [jobsData, applicationsData] = await Promise.all([
          jobsService.getJobs({ ordering: '-date_publication' }),
          applicationsService.getApplications({ ordering: '-date_candidature' }),
        ])
        setJobs(jobsData)
        setApplications(applicationsData)
        setErrorMessage(null)
      } catch {
        setErrorMessage('Impossible de charger le tableau de bord.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.statut === JOB_STATUSES.PUBLISHED)
    const recentApplications = applications.filter((app) => isWithinLastDays(app.date_candidature, 7))
    const pendingApplications = applications.filter((app) => app.statut === 'PENDING' || app.statut === 'UNDER_REVIEW')

    const applicationCounts = applications.reduce<Record<string, number>>((acc, app) => {
      acc[app.offre.id] = (acc[app.offre.id] ?? 0) + 1
      return acc
    }, {})

    return {
      activeJobsCount: activeJobs.length,
      recentApplicationsCount: recentApplications.length,
      pendingApplicationsCount: pendingApplications.length,
      activeJobs: activeJobs.slice(0, 5).map((job) => ({
        id: job.id,
        title: job.titre,
        applicants: applicationCounts[job.id] ?? 0,
        status: job.statut_display,
      })),
      nextAction: pendingApplications[0],
    }
  }, [applications, jobs])

  if (isLoading) {
    return (
      <PageShell eyebrow="Espace entreprise" title="Pilotage des recrutements">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement du tableau de bord…" />
        </div>
      </PageShell>
    )
  }

  if (errorMessage) {
    return (
      <PageShell eyebrow="Espace entreprise" title="Pilotage des recrutements">
        <EmptyState title="Erreur" description={errorMessage} />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Espace entreprise"
      title="Pilotage des recrutements"
      description="Suivez vos offres, vos candidatures et l'activité de vos équipes de recrutement."
      actions={
        <Link to={ROUTES.COMPANY_JOB_CREATE}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer une offre
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Offres actives</CardTitle>
            <CardDescription>Postes actuellement visibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats.activeJobsCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Candidatures récentes</CardTitle>
            <CardDescription>Volume sur les 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-secondary">{stats.recentApplicationsCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>À traiter</CardTitle>
            <CardDescription>Candidatures en attente ou en examen</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{stats.pendingApplicationsCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                <CardTitle>Offres en cours</CardTitle>
              </div>
              <Link to={ROUTES.COMPANY_JOBS} className="text-sm text-primary hover:underline">
                Voir toutes
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.activeJobs.length === 0 ? (
              <p className="text-sm text-muted">Aucune offre publiée pour le moment.</p>
            ) : (
              stats.activeJobs.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="font-semibold text-foreground">{offer.title}</p>
                    <p className="text-sm text-muted">{offer.applicants} candidature{offer.applicants > 1 ? 's' : ''}</p>
                  </div>
                  <Badge variant="secondary">{offer.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-secondary" />
              <CardTitle>Recrutement rapide</CardTitle>
            </div>
            <CardDescription>Centralisez les interactions essentielles avec les candidats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Consultez les candidatures reçues, mettez à jour leur statut et préparez vos prochains entretiens.</p>
            {stats.nextAction ? (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">Prochaine action</p>
                <p className="mt-1 text-foreground">
                  Examiner la candidature de {stats.nextAction.candidate.user.prenom} {stats.nextAction.candidate.user.nom}
                </p>
                <p className="mt-1">Pour le poste : {stats.nextAction.offre.titre}</p>
                <Link to={ROUTES.COMPANY_APPLICATIONS} className="mt-3 inline-block text-primary hover:underline">
                  Voir les candidatures
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">Aucune candidature en attente</p>
                <p className="mt-1">Publiez une offre pour commencer à recevoir des candidatures.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default CompanyDashboardPage
