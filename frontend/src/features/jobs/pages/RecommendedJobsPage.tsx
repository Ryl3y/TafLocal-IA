import { BriefcaseBusiness, Clock3, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { getRecommendedJobs, type JobSummary } from '../../../services/api/demoServices'

export function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadJobs = async () => {
      try {
        setIsLoading(true)
        const data = await getRecommendedJobs()
        if (isMounted) {
          setJobs(data)
          setErrorMessage(null)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Impossible de charger les offres recommandées pour le moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <PageShell
      eyebrow="Offres qualifiées"
      title="Des missions alignées à votre profil"
      description="L’IA classe les opportunités selon leur adéquation avec votre expérience, vos compétences et vos aspirations."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Filtres recommandés</CardTitle>
            <CardDescription>Affinez les opportunités autour de votre trajectoire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Profil ciblé</p>
              <p className="mt-1 text-sm text-muted">Product & Data, niveau confirmé</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Localisation</p>
              <p className="mt-1 text-sm text-muted">Paris, Lyon, hybride</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Cadre</p>
              <p className="mt-1 text-sm text-muted">CDI, CDD, freelance</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Loader label="Chargement des offres recommandées…" />
            </div>
          ) : errorMessage ? (
            <EmptyState
              title="Aucune offre disponible"
              description={errorMessage}
              actionLabel="Réessayer"
              onAction={() => window.location.reload()}
            />
          ) : jobs.length === 0 ? (
            <EmptyState title="Aucune offre à afficher" description="Les recommandations seront mises à jour dès que de nouveaux postes seront disponibles." />
          ) : (
            jobs.map((job) => (
              <Card key={job.id} hoverable className="bg-surface">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </div>
                    <Badge variant="secondary">{job.match}% match</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-7 text-muted">{job.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{job.type}</span>
                    <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{job.salary}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={ROUTES.JOB_DETAILS.replace(':jobId', job.id)}>
                      <Button variant="outline">Voir l’offre</Button>
                    </Link>
                    <Link to={ROUTES.APPLY.replace(':jobId', job.id)}>
                      <Button>Postuler</Button>
                    </Link>
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
