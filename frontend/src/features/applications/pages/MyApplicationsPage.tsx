import { Briefcase, MessageCircleMore } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useApiData } from '../../../hooks'
import { errorMessage } from '../../../services/api/apiClient'
import { applicationsService } from '../../../services/api/applicationsService'
import { formatDate } from '../../../utils/formatDate'

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'secondary' | 'accent' | 'error' | 'outline'> = {
  PENDING: 'default',
  UNDER_REVIEW: 'primary',
  SHORTLISTED: 'accent',
  HIRED: 'secondary',
  REJECTED: 'error',
  WITHDRAWN: 'outline',
}

export function MyApplicationsPage() {
  const { data: applications = [], isLoading, error: loadError, reload } = useApiData(
    () => applicationsService.getApplications({ ordering: '-date_candidature' }),
    [],
    'Impossible de charger vos candidatures.',
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const errorText = actionError ?? loadError

  const withdraw = async (id: string) => {
    if (!window.confirm('Retirer cette candidature ?')) return
    setBusyId(id)
    try {
      await applicationsService.withdrawApplication(id)
      setActionError(null)
      reload()
    } catch (error) {
      setActionError(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageShell
      eyebrow="Suivi"
      title="Mes candidatures"
      description="Suivez l’avancement de vos candidatures et préparez vos entretiens."
      actions={<Link to={ROUTES.RECOMMENDED_JOBS}><Button>Trouver des offres</Button></Link>}
    >
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      ) : errorText ? (
        <EmptyState title="Erreur" description={errorText} actionLabel="Réessayer" onAction={() => {
          setActionError(null)
          reload()
        }} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune candidature"
          description="Consultez les offres recommandées par l’IA et postulez en quelques clics."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="bg-surface">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{application.offre.titre}</CardTitle>
                    <CardDescription>
                      {application.offre.entreprise_nom} · envoyée le {formatDate(application.date_candidature)}
                    </CardDescription>
                  </div>
                  <Badge variant={STATUS_VARIANTS[application.statut] ?? 'default'}>{application.statut_display}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link to={ROUTES.JOB_DETAILS.replace(':jobId', application.offre.id)}>
                  <Button variant="outline" size="sm">Voir l’offre</Button>
                </Link>
                {application.statut !== 'WITHDRAWN' && application.statut !== 'REJECTED' && (
                  <>
                    <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${application.offre.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircleMore className="h-4 w-4" /> Préparer l’entretien
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={busyId === application.id}
                      onClick={() => void withdraw(application.id)}
                    >
                      Retirer
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

export default MyApplicationsPage
