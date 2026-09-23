import { Info, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useApiData } from '../../../hooks'
import { errorMessage } from '../../../services/api/apiClient'
import {
  applicationsService,
  APPLICATION_STATUSES,
  type Application,
} from '../../../services/api/applicationsService'
import { jobsService, MATCH_CRITERIA_LABELS, type MatchResult } from '../../../services/api/jobsService'

interface Row {
  application: Application
  match?: MatchResult
  rang?: number
}

export function CompanyApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedJobId = searchParams.get('offre') ?? ''
  const selectedStatus = searchParams.get('statut') ?? ''
  const ranked = searchParams.get('tri') !== 'date'

  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openLetterId, setOpenLetterId] = useState<string | null>(null)

  const { data, isLoading, error: loadError, reload: loadData, setData } = useApiData(
    async () => {
      const filters = {
        ...(selectedJobId ? { offre: selectedJobId } : {}),
        ...(selectedStatus ? { statut: selectedStatus } : {}),
      }
      const jobsPromise = jobsService.getJobs({ ordering: '-date_publication' })
      if (ranked) {
        const [response, jobs] = await Promise.all([applicationsService.getRankedApplications(filters), jobsPromise])
        const rows: Row[] = response.results.map((item) => ({ application: item.application, match: item.match, rang: item.rang }))
        return { rows, jobs, disclaimer: response.avertissement as string | null }
      }
      const [applications, jobs] = await Promise.all([
        applicationsService.getApplications({ ...filters, ordering: '-date_candidature' }),
        jobsPromise,
      ])
      return { rows: applications.map((application): Row => ({ application })), jobs, disclaimer: null }
    },
    [selectedJobId, selectedStatus, ranked],
    'Impossible de charger les candidatures.',
  )
  const rows = data?.rows ?? []
  const jobs = data?.jobs ?? []
  const disclaimer = data?.disclaimer ?? null
  const errorText = actionError ?? loadError

  const selectedJobTitle = selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.titre ?? null : null

  const handleStatusChange = async (applicationId: string, statut: string) => {
    try {
      setUpdatingId(applicationId)
      const updated = await applicationsService.updateApplication(applicationId, { statut })
      setData((prev) =>
        prev && {
          ...prev,
          rows: prev.rows.map((row) => (row.application.id === applicationId ? { ...row, application: updated } : row)),
        },
      )
    } catch (error) {
      setActionError(errorMessage(error, 'Impossible de mettre à jour le statut.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const updateFilter = (key: 'offre' | 'statut' | 'tri', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <PageShell
      eyebrow="Recrutement"
      title="Candidatures reçues"
      description="Examinez les profils, mettez à jour les statuts et suivez votre pipeline de recrutement."
    >
      <Card className="bg-surface">
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="filter-job" className="mb-2 block text-sm font-medium text-foreground">Offre</label>
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
            <label htmlFor="filter-status" className="mb-2 block text-sm font-medium text-foreground">Statut</label>
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
          <div className="flex gap-2">
            <Button size="sm" variant={ranked ? 'primary' : 'outline'} onClick={() => updateFilter('tri', '')}>
              <Sparkles className="h-4 w-4" /> Trier par compatibilité
            </Button>
            <Button size="sm" variant={!ranked ? 'primary' : 'outline'} onClick={() => updateFilter('tri', 'date')}>
              Trier par date
            </Button>
          </div>
        </CardContent>
      </Card>

      {ranked && disclaimer && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-light/30 p-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {disclaimer} La décision finale appartient toujours au recruteur.
          </span>
        </div>
      )}

      {selectedJobTitle && (
        <p className="text-sm text-muted">
          Filtre actif : <span className="font-medium text-foreground">{selectedJobTitle}</span>
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label={ranked ? 'Calcul des indices de compatibilité…' : 'Chargement des candidatures…'} />
        </div>
      ) : errorText ? (
        <EmptyState title="Erreur" description={errorText} actionLabel="Réessayer" onAction={() => {
          setActionError(null)
          loadData()
        }} />
      ) : rows.length === 0 ? (
        <EmptyState title="Aucune candidature" description="Aucune candidature ne correspond à vos filtres." />
      ) : (
        <div className="space-y-4">
          {rows.map(({ application, match, rang }) => (
            <Card key={application.id} className="bg-surface">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {rang !== undefined && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                        #{rang}
                      </span>
                    )}
                    <div>
                      <CardTitle>
                        {application.candidate.user.prenom} {application.candidate.user.nom}
                      </CardTitle>
                      <CardDescription>
                        {application.candidate.user.email} • {application.offre.titre}
                        {application.candidate.ville ? ` • ${application.candidate.ville}` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {match && <MatchScoreBadge score={match.score} />}
                    <Badge variant="outline">{application.statut_display}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {match && (
                  <div className="space-y-3 rounded-xl border border-border bg-background p-3 text-sm">
                    <p className="text-muted">{match.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(MATCH_CRITERIA_LABELS) as (keyof MatchResult['details'])[])
                        .filter((key) => match.details[key] !== null)
                        .map((key) => (
                          <Badge key={key} variant="default">{MATCH_CRITERIA_LABELS[key]} : {match.details[key]}</Badge>
                        ))}
                    </div>
                    {match.missing_skills.length > 0 && (
                      <p className="text-xs text-muted">Compétences manquantes : {match.missing_skills.join(', ')}</p>
                    )}
                  </div>
                )}
                <div className="text-sm text-muted">
                  Candidature reçue le {new Date(application.date_candidature).toLocaleDateString('fr-FR')}
                </div>
                {application.commentaire && (
                  <p className="rounded-lg border border-border bg-background p-3 text-sm text-foreground">{application.commentaire}</p>
                )}
                {application.lettre_motivation && (
                  <div>
                    <Button size="sm" variant="ghost" onClick={() => setOpenLetterId(openLetterId === application.id ? null : application.id)}>
                      {openLetterId === application.id ? 'Masquer la lettre' : 'Lire la lettre de motivation'}
                    </Button>
                    {openLetterId === application.id && (
                      <p className="mt-2 whitespace-pre-line rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                        {application.lettre_motivation}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor={`status-${application.id}`} className="mb-2 block text-sm font-medium text-foreground">
                    Mettre à jour le statut
                  </label>
                  <select
                    id={`status-${application.id}`}
                    value={application.statut}
                    disabled={updatingId === application.id || application.statut === 'WITHDRAWN'}
                    onChange={(e) => void handleStatusChange(application.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {APPLICATION_STATUSES.filter((s) => s.value !== 'WITHDRAWN' || application.statut === 'WITHDRAWN').map((status) => (
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
