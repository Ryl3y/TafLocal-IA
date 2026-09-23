import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, BriefcaseBusiness, Clock3, Filter } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useApiData } from '../../../hooks'
import { CONTRACT_TYPES, formatJobSalary, jobsService, type JobFilters } from '../../../services/api/jobsService'
import { ROUTES } from '../../../constants/routes'

export function JobsListPage() {
  const [filters, setFilters] = useState<JobFilters>({})
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedSearch = searchParams.get('search') ?? ''
  const [searchQuery, setSearchQuery] = useState(appliedSearch)
  // Recherche lancée depuis la barre de navigation alors que la page est déjà ouverte.
  const [syncedSearch, setSyncedSearch] = useState(appliedSearch)
  if (syncedSearch !== appliedSearch) {
    setSyncedSearch(appliedSearch)
    setSearchQuery(appliedSearch)
  }
  const setAppliedSearch = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('search', value)
    else next.delete('search')
    setSearchParams(next)
  }

  // Le backend ne renvoie aux candidats que les offres publiées et non expirées.
  const { data: jobs = [], isLoading, error: errorText, reload: loadJobs } = useApiData(
    () => jobsService.getJobs({ ...filters, search: appliedSearch || undefined }),
    [JSON.stringify(filters), appliedSearch],
    'Impossible de charger les offres.',
  )

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchQuery.trim())
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
                {CONTRACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expérience demandée
              </label>
              <select
                value={filters.experience_max ?? ''}
                onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Toutes</option>
                <option value="0">Débutant accepté</option>
                <option value="2">2 ans maximum</option>
                <option value="5">5 ans maximum</option>
                <option value="10">10 ans maximum</option>
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

            {(filters.type_contrat || filters.experience_max !== undefined) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                  setAppliedSearch('')
                }}
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
          ) : errorText ? (
            <EmptyState
              title="Erreur"
              description={errorText}
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
                        {job.localisation || 'Non précisée'}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {job.type_contrat_display}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {formatJobSalary(job)}
                      </span>
                    </div>

                    {job.competences_requises.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.competences_requises.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    )}
                    {job.experience_requise !== null && job.experience_requise !== undefined && (
                      <p className="text-xs text-muted">
                        Expérience demandée : {job.experience_requise} an(s)
                      </p>
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
