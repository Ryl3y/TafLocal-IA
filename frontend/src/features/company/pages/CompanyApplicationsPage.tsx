import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import {
  applicationsService,
  APPLICATION_STATUSES,
  type Application,
} from '../../../services/api/applicationsService'
import { jobsService, type Job } from '../../../services/api/jobsService'

export function CompanyApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedJobId = searchParams.get('offre') ?? ''
  const selectedStatus = searchParams.get('statut') ?? ''

  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const filters = {
        ...(selectedJobId ? { offre: selectedJobId } : {}),
        ...(selectedStatus ? { statut: selectedStatus } : {}),
        ordering: '-date_candidature',
      }
      const [applicationsData, jobsData] = await Promise.all([
        applicationsService.getApplications(filters),
        jobsService.getJobs({ ordering: '-date_publication' }),
      ])
      setApplications(applicationsData)
      setJobs(jobsData)
      setErrorMessage(null)
    } catch {
      setErrorMessage('Impossible de charger les candidatures.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedJobId, selectedStatus])

  const selectedJobTitle = useMemo(() => {
    if (!selectedJobId) return null
    return jobs.find((job) => job.id === selectedJobId)?.titre ?? null
  }, [jobs, selectedJobId])

  const handleStatusChange = async (applicationId: string, statut: string) => {
    try {
      setUpdatingId(applicationId)
      await applicationsService.updateApplication(applicationId, { statut })
      await loadData()
    } catch {
      setErrorMessage('Impossible de mettre à jour le statut.')
    } finally {
      setUpdatingId(null)
    }
  }

  const updateFilter = (key: 'offre' | 'statut', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  return (
    <PageShell
      eyebrow="Recrutement"
      title="Candidatures reçues"
      description="Examinez les profils, mettez à jour les statuts et suivez votre pipeline de recrutement."
    >
      <Card className="mb-6 bg-surface">
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div>
            <label htmlFor="filter-job" className="mb-2 block text-sm font-medium text-foreground">
              Offre
            </label>
            <select
              id="filter-job"
              value={selectedJobId}
              onChange={(e) => updateFilter('offre', e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Toutes les offres</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-2 block text-sm font-medium text-foreground">
              Statut
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => updateFilter('statut', e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedJobTitle && (
        <p className="mb-4 text-sm text-muted">
          Filtre actif : <span className="font-medium text-foreground">{selectedJobTitle}</span>
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement des candidatures…" />
        </div>
      ) : errorMessage ? (
        <EmptyState title="Erreur" description={errorMessage} actionLabel="Réessayer" onAction={loadData} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature"
          description="Aucune candidature ne correspond à vos filtres."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="bg-surface">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      {application.candidate.user.prenom} {application.candidate.user.nom}
                    </CardTitle>
                    <CardDescription>
                      {application.candidate.user.email} • {application.offre.titre}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{application.statut_display}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted">
                  Candidature reçue le {new Date(application.date_candidature).toLocaleDateString('fr-FR')}
                </div>
                {application.commentaire && (
                  <p className="rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                    {application.commentaire}
                  </p>
                )}
                <div>
                  <label htmlFor={`status-${application.id}`} className="mb-2 block text-sm font-medium text-foreground">
                    Mettre à jour le statut
                  </label>
                  <select
                    id={`status-${application.id}`}
                    value={application.statut}
                    disabled={updatingId === application.id}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

export default CompanyApplicationsPage
