import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, BriefcaseBusiness, Clock3, Filter } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { jobsService, type Job, type JobFilters } from '../../../services/api/jobsService'
import { ROUTES } from '../../../constants/routes'

export function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      const data = await jobsService.getJobs({
        ...filters,
        search: searchQuery || undefined,
        statut: 'ACTIVE',
      })
      setJobs(data)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage('Impossible de charger les offres.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadJobs()
  }

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  return (
    <PageShell
      eyebrow="Offres d'emploi"
      title="Découvrez les opportunités"
      description="Parcourez les offres d'emploi disponibles et trouvez celle qui correspond à votre profil."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Filters Sidebar */}
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <CardDescription>Affinez votre recherche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type de contrat
              </label>
              <select
                value={filters.type_contrat || ''}
                onChange={(e) => handleFilterChange('type_contrat', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Niveau d'expérience
              </label>
              <select
                value={filters.experience_requise || ''}
                onChange={(e) => handleFilterChange('experience_requise', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="Junior">Junior</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tri par
              </label>
              <select
                value={filters.ordering || '-date_publication'}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="-date_publication">Plus récent</option>
                <option value="date_publication">Plus ancien</option>
                <option value="-salaire_min">Salaire décroissant</option>
                <option value="salaire_min">Salaire croissant</option>
                <option value="titre">Titre A-Z</option>
                <option value="-titre">Titre Z-A</option>
              </select>
            </div>

            {(filters.type_contrat || filters.experience_requise) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, description, localisation..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>

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
              title="Aucune offre trouvée"
              description="Essayez de modifier vos critères de recherche."
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} hoverable className="bg-surface">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{job.titre}</CardTitle>
                        <CardDescription>{job.entreprise_nom}</CardDescription>
                      </div>
                      <Badge variant="secondary">{job.type_contrat_display}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.localisation}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {job.type_contrat_display}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {job.salaire_min} - {job.salaire_max} {job.devise}
                      </span>
                    </div>

                    {job.experience_requise && (
                      <Badge variant="outline" className="w-fit">
                        {job.experience_requise}
                      </Badge>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Link to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}>
                        <Button variant="outline">Voir l'offre</Button>
                      </Link>
                      <Link to={ROUTES.APPLY.replace(':jobId', job.id)}>
                        <Button>Postuler</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default JobsListPage
