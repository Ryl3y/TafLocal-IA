import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarClock, Clock3, GraduationCap, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MatchDetails, MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import { formatJobSalary, jobsService, type Job, type MatchResult } from '../../../services/api/jobsService'
import { formatDate } from '../../../utils/formatDate'

export function JobDetailsPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setIsLoading(true)
        const jobData = await jobsService.getJob(jobId)
        if (!active) return
        setJob(jobData)
        setErrorText(null)
        // Le score est secondaire : son échec n'empêche pas l'affichage de l'offre.
        jobsService.getMatch(jobId).then((m) => active && setMatch(m)).catch(() => undefined)
      } catch (error) {
        if (active) setErrorText(errorMessage(error, 'Offre introuvable.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [jobId])

  if (isLoading) {
    return (
      <PageShell eyebrow="Offre" title="Chargement de l’offre">
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      </PageShell>
    )
  }

  if (errorText || !job) {
    return (
      <PageShell eyebrow="Offre" title="Offre indisponible">
        <EmptyState
          title="Offre introuvable"
          description={errorText ?? 'Cette offre n’existe plus ou n’est plus publiée.'}
          actionLabel="Retour aux offres"
          onAction={() => navigate(ROUTES.JOBS_LIST)}
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow={job.entreprise_nom}
      title={job.titre}
      description={`${job.localisation || 'Localisation non précisée'} · ${job.type_contrat_display}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${job.id}`}>
            <Button variant="outline">S’entraîner à l’entretien</Button>
          </Link>
          <Link to={ROUTES.APPLY.replace(':jobId', job.id)}>
            <Button>
              Postuler <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="bg-surface">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{job.entreprise_nom}</CardTitle>
                  <CardDescription>{formatJobSalary(job)}</CardDescription>
                </div>
                {match && <MatchScoreBadge score={match.score} />}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted">
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {job.localisation || 'Non précisée'}</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {job.type_contrat_display}</span>
                {job.experience_requise !== null && job.experience_requise !== undefined && (
                  <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary" /> {job.experience_requise} an(s) d’expérience</span>
                )}
                {job.niveau_etude && (
                  <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> {job.niveau_etude}</span>
                )}
                {job.date_expiration && (
                  <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Jusqu’au {formatDate(job.date_expiration)}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
              <CardDescription>Publiée le {formatDate(job.date_publication)}</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-line text-sm leading-7 text-muted">{job.description}</CardContent>
          </Card>

          {job.exigences && (
            <Card>
              <CardHeader>
                <CardTitle>Profil recherché</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-7 text-muted">{job.exigences}</CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compétences demandées</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {job.competences_requises.length === 0 ? (
                <p className="text-sm text-muted">Aucune compétence précisée.</p>
              ) : (
                job.competences_requises.map((skill) => (
                  <Badge key={skill} variant={match?.matched_skills.includes(skill) ? 'secondary' : 'primary'}>
                    {skill}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          {match ? (
            <MatchDetails match={match} />
          ) : (
            <Card className="text-sm text-muted">Calcul de votre compatibilité…</Card>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default JobDetailsPage
