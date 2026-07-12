import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Users, Archive, CheckCircle } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { jobsService, JOB_STATUSES, type Job } from '../../../services/api/jobsService'
import { ROUTES } from '../../../constants/routes'

function getStatusVariant(statut: string): 'secondary' | 'outline' | 'accent' {
  if (statut === JOB_STATUSES.PUBLISHED) return 'secondary'
  if (statut === JOB_STATUSES.DRAFT) return 'accent'
  return 'outline'
}

export function JobManagementPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      const data = await jobsService.getJobs({ ordering: '-date_publication' })
      setJobs(data)
      setErrorMessage(null)
    } catch {
      setErrorMessage('Impossible de charger vos offres.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleArchive = async (id: string) => {
    try {
      await jobsService.archiveJob(id)
      await loadJobs()
    } catch {
      setErrorMessage('Impossible d\'archiver l\'offre.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await jobsService.deleteJob(id)
        await loadJobs()
      } catch {
        setErrorMessage('Impossible de supprimer l\'offre.')
      }
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await jobsService.activateJob(id)
      await loadJobs()
    } catch {
      setErrorMessage('Impossible d\'activer l\'offre.')
    }
  }

  return (
    <PageShell
      eyebrow="Gestion des offres"
      title="Vos offres d'emploi"
      description="Créez, modifiez et gérez vos offres d'emploi."
      actions={
        <Link to={ROUTES.COMPANY_JOB_CREATE}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer une offre
          </Button>
        </Link>
      }
    >
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement des offres…" />
        </div>
      ) : errorMessage ? (
        <EmptyState
          title="Erreur"
          description={errorMessage}
          actionLabel="Réessayer"
          onAction={loadJobs}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="Aucune offre"
          description="Vous n'avez pas encore créé d'offre d'emploi."
          actionLabel="Créer une offre"
          onAction={() => navigate(ROUTES.COMPANY_JOB_CREATE)}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-surface">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{job.titre}</CardTitle>
                    <CardDescription>{job.entreprise_nom}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(job.statut)}>
                    {job.statut_display}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted">
                    <span>{job.localisation}</span>
                    <span>•</span>
                    <span>{job.type_contrat_display}</span>
                    <span>•</span>
                    <span>{job.salaire_min} - {job.salaire_max} {job.devise}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted">
                    <span>Publié le {new Date(job.date_publication).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link to={`${ROUTES.COMPANY_APPLICATIONS}?offre=${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Candidatures
                      </Button>
                    </Link>
                    <Link to={ROUTES.COMPANY_JOB_EDIT.replace(':jobId', job.id)}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </Link>
                    {job.statut === JOB_STATUSES.PUBLISHED ? (
                      <Button variant="outline" size="sm" onClick={() => handleArchive(job.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archiver
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(job.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publier
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

export default JobManagementPage
