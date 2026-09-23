import { BriefcaseBusiness, CheckCircle2, Clock3, MapPin, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useApiData } from '../../../hooks'
import { formatJobSalary, jobsService } from '../../../services/api/jobsService'

const SCORE_FILTERS = [
  { value: 0, label: 'Toutes' },
  { value: 50, label: '≥ 50 %' },
  { value: 65, label: '≥ 65 %' },
  { value: 80, label: '≥ 80 %' },
]

export function RecommendedJobsPage() {
  const [minScore, setMinScore] = useState(0)
  // Incrémenté par « Recalculer » : force le recalcul des scores côté serveur.
  const [refreshCount, setRefreshCount] = useState(0)
  const { data: recommendations = [], isLoading, error: errorText, reload } = useApiData(
    () => jobsService.getRecommendations({ limit: 50, min_score: minScore, refresh: refreshCount > 0 }),
    [minScore, refreshCount],
    'Impossible de charger les offres recommandées pour le moment.',
  )

  return (
    <PageShell
      eyebrow="Offres qualifiées"
      title="Des missions alignées à votre profil"
      description="Le moteur IA de TafLocal classe les offres selon vos compétences, votre expérience, votre formation et votre localisation."
      actions={
        <Button variant="outline" onClick={() => setRefreshCount((count) => count + 1)} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" /> Recalculer
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card className="h-fit bg-surface">
          <CardHeader>
            <CardTitle>Affiner</CardTitle>
            <CardDescription>Filtrez les offres selon leur compatibilité.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SCORE_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={minScore === filter.value ? 'primary' : 'outline'}
                  onClick={() => setMinScore(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
              <p className="font-semibold text-foreground">Améliorer vos résultats</p>
              <p className="mt-1">
                Ajoutez vos compétences, expériences et formations dans votre{' '}
                <Link to={ROUTES.PROFILE} className="text-primary hover:underline">profil</Link> et analysez votre{' '}
                <Link to={ROUTES.CV_ANALYSIS} className="text-primary hover:underline">CV</Link>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Loader label="Calcul des compatibilités…" />
            </div>
          ) : errorText ? (
            <EmptyState title="Offres indisponibles" description={errorText} actionLabel="Réessayer" onAction={reload} />
          ) : recommendations.length === 0 ? (
            <EmptyState
              title="Aucune offre à afficher"
              description="Aucune offre publiée ne correspond à ce filtre pour le moment."
            />
          ) : (
            recommendations.map(({ job, match, already_applied }) => (
              <Card key={job.id} hoverable className="bg-surface">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{job.titre}</CardTitle>
                      <CardDescription>{job.entreprise_nom}</CardDescription>
                    </div>
                    <MatchScoreBadge score={match.score} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="flex items-start gap-2 text-sm leading-6 text-muted">
                    <Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    {match.explanation}
                  </p>
                  {match.matched_skills.length + match.missing_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {match.matched_skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                      {match.missing_skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{job.localisation || 'Non précisée'}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{job.type_contrat_display}</span>
                    <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{formatJobSalary(job)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}>
                      <Button variant="outline">Voir l’offre</Button>
                    </Link>
                    {already_applied ? (
                      <Badge variant="secondary" className="py-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Déjà postulé
                      </Badge>
                    ) : (
                      <Link to={ROUTES.APPLY.replace(':jobId', job.id)}>
                        <Button>Postuler</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default RecommendedJobsPage
