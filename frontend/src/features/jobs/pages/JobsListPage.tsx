import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { JobCard } from '../../../components/cards/JobCard'
import { FilterChips } from '../../../components/forms/FilterChips'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import { useApiData } from '../../../hooks'
import {
  CONTRACT_TYPES,
  formatExperienceBadge,
  formatInternshipDuration,
  formatJobPay,
  jobsService,
  type JobFilters,
} from '../../../services/api/jobsService'
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
  const {
    data: jobs = [],
    isLoading,
    error: errorText,
    reload: loadJobs,
  } = useApiData(
    () => jobsService.getJobs({ ...filters, search: appliedSearch || undefined }),
    [JSON.stringify(filters), appliedSearch],
    'Impossible de charger les offres.',
  )

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchQuery.trim())
  }

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({
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
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Filtres en pastilles, façon « Job Preferences » */}
        <Card className="h-fit space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" /> Filtres
            </h2>
            {(filters.categorie || filters.type_contrat || filters.experience_max_mois !== undefined || appliedSearch) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                  setAppliedSearch('')
                }}
                className="text-xs text-muted hover:text-primary"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <FilterChips
            label="Type d’offre"
            value={filters.categorie ?? ''}
            onChange={(value) => handleFilterChange('categorie', value)}
            options={[
              { value: '', label: 'Toutes' },
              { value: 'EMPLOI', label: 'Emploi' },
              { value: 'STAGE', label: 'Stage' },
            ]}
          />

          <FilterChips
            label="Type de contrat"
            value={filters.type_contrat ?? ''}
            onChange={(value) => handleFilterChange('type_contrat', value)}
            options={[{ value: '', label: 'Tous' }, ...CONTRACT_TYPES]}
          />

          <FilterChips
            label="Expérience demandée"
            value={filters.experience_max_mois !== undefined ? String(filters.experience_max_mois) : ''}
            onChange={(value) => handleFilterChange('experience_max_mois', value)}
            options={[
              { value: '', label: 'Toutes' },
              { value: '0', label: 'Débutant' },
              { value: '3', label: '≤ 3 mois' },
              { value: '6', label: '≤ 6 mois' },
              { value: '12', label: '≤ 1 an' },
              { value: '24', label: '≤ 2 ans' },
              { value: '60', label: '≤ 5 ans' },
            ]}
          />

          <div className="space-y-3">
            <label htmlFor="jobs-ordering" className="block text-sm font-semibold text-foreground">Trier par</label>
            <select
              id="jobs-ordering"
              value={filters.ordering || '-date_publication'}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="h-11 w-full rounded-lg bg-field px-4 text-sm text-foreground focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:outline-none"
            >
              <option value="-date_publication">Plus récent</option>
              <option value="date_publication">Plus ancien</option>
              <option value="-salaire_min">Salaire décroissant</option>
              <option value="salaire_min">Salaire croissant</option>
              <option value="titre">Titre A-Z</option>
              <option value="-titre">Titre Z-A</option>
            </select>
          </div>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un poste, un lieu…"
                className="h-12 w-full rounded-lg bg-field pr-4 pl-12 text-sm text-foreground placeholder:text-muted focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:outline-none"
              />
            </div>
            <Button type="submit" className="h-12">Rechercher</Button>
          </form>

          {!isLoading && !errorText && (
            <p className="text-sm text-muted">
              <span className="font-semibold text-primary">{jobs.length}</span> offre(s) disponible(s)
            </p>
          )}

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
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.titre}
                  company={job.entreprise_nom}
                  location={job.localisation || 'Non précisée'}
                  contractType={job.type_contrat_display}
                  tags={[
                    ...(job.categorie === 'STAGE' ? [formatInternshipDuration(job.duree_stage_mois)] : []),
                    ...(formatExperienceBadge(job.experience_requise_mois)
                      ? [formatExperienceBadge(job.experience_requise_mois) as string]
                      : []),
                    ...job.competences_requises.slice(0, 2),
                  ]}
                  salary={formatJobPay(job)}
                  footer={
                    <>
                      <Link to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}>
                        <Button variant="outline" size="sm">
                          Voir l'offre
                        </Button>
                      </Link>
                      <Link to={ROUTES.APPLY.replace(':jobId', job.id)} className="ml-auto">
                        <Button size="sm">Postuler</Button>
                      </Link>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default JobsListPage
