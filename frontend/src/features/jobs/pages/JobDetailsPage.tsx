import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  GraduationCap,
  FileText,
  MapPin,
  Mic,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MatchDetails } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { CompanyLogo } from '../../../components/ui/CompanyLogo'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import { applicationsService } from '../../../services/api/applicationsService'
import {
  formatExperienceBadge,
  formatInternshipDuration,
  formatJobPay,
  jobsService,
  type Job,
  type MatchResult,
} from '../../../services/api/jobsService'
import { formatDate } from '../../../utils/formatDate'

export function JobDetailsPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [tab, setTab] = useState<string>('description')
  // La simulation d'entretien n'est proposée qu'après avoir postulé.
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setIsLoading(true)
        const jobData = await jobsService.getJob(jobId)
        if (!active) return
        setJob(jobData)
        setErrorText(null)
        applicationsService
          .getApplications({ offre: jobId })
          .then((list) => active && setHasApplied(list.some((a) => a.offre.id === jobId && a.statut !== 'WITHDRAWN')))
          .catch(() => undefined)
        // Le score est secondaire : son échec n'empêche pas l'affichage de l'offre.
        jobsService
          .getMatch(jobId)
          .then((m) => active && setMatch(m))
          .catch(() => undefined)
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
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement…" />
        </div>
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

  const tabs = [
    { id: 'description', label: 'Description' },
    ...(job.exigences ? [{ id: 'profil', label: 'Profil' }] : []),
    { id: 'competences', label: 'Compétences' },
    { id: 'match', label: 'Compatibilité' },
  ] as const
  const currentTab = tabs.some((t) => t.id === tab) ? tab : 'description'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      {/* En-tête bleu façon kit */}
      <header className="job-hero-pattern relative overflow-hidden rounded-3xl px-5 pt-5 pb-8 text-white shadow-lg sm:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {match && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {match.score}% compatible
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-col items-center text-center">
          <CompanyLogo
            name={job.entreprise_nom}
            src={job.entreprise_logo}
            size="lg"
            className="shadow-md"
          />
          <h1 className="mt-4 text-xl font-semibold sm:text-2xl">{job.titre}</h1>
          <p className="text-sm text-white/75">{job.entreprise_nom}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="glass">{job.type_contrat_display}</Badge>
            {job.categorie === 'STAGE' && (
              <Badge variant="glass">{formatInternshipDuration(job.duree_stage_mois)}</Badge>
            )}
            {formatExperienceBadge(job.experience_requise_mois) && (
              <Badge variant="glass">{formatExperienceBadge(job.experience_requise_mois)}</Badge>
            )}
            {job.niveau_etude && <Badge variant="glass">{job.niveau_etude}</Badge>}
          </div>

          <div className="mt-6 flex w-full max-w-md flex-wrap items-center justify-between gap-2 text-sm font-semibold sm:text-base">
            <span>{formatJobPay(job)}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.localisation || 'Non précisée'}
            </span>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <div
        role="tablist"
        aria-label="Sections de l’offre"
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={currentTab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 px-4 py-3 text-sm transition-colors ${
              currentTab === t.id
                ? 'font-semibold text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-40">
        {currentTab === 'description' && (
          <Card>
            {/* Pièces à fournir pour postuler */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-field px-4 py-3 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Pièces demandées :</span>
              <Badge variant="primary">CV obligatoire</Badge>
              {job.lettre_motivation !== 'NON_DEMANDEE' && (
                <Badge variant={job.lettre_motivation === 'OBLIGATOIRE' ? 'primary' : 'default'}>
                  Lettre de motivation {job.lettre_motivation === 'OBLIGATOIRE' ? 'obligatoire' : 'facultative'}
                </Badge>
              )}
            </div>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-primary" /> Publiée le{' '}
                {formatDate(job.date_publication)}
              </span>
              {job.date_expiration && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-primary" /> Jusqu’au{' '}
                  {formatDate(job.date_expiration)}
                </span>
              )}
              {job.experience_requise_mois !== null && job.experience_requise_mois !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" /> Expérience : {job.experience_requise_display}
                </span>
              )}
              {job.niveau_etude && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" /> {job.niveau_etude}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-muted">{job.description}</p>
          </Card>
        )}

        {currentTab === 'profil' && job.exigences && (
          <Card className="whitespace-pre-line text-sm leading-7 text-muted">{job.exigences}</Card>
        )}

        {currentTab === 'competences' && (
          <Card className="flex flex-wrap gap-2">
            {job.competences_requises.length === 0 ? (
              <p className="text-sm text-muted">Aucune compétence précisée.</p>
            ) : (
              job.competences_requises.map((skill) => (
                <Badge
                  key={skill}
                  variant={match?.matched_skills.includes(skill) ? 'secondary' : 'primary'}
                >
                  {skill}
                </Badge>
              ))
            )}
          </Card>
        )}

        {currentTab === 'match' &&
          (match ? (
            <MatchDetails match={match} />
          ) : (
            <Card className="text-sm text-muted">Calcul de votre compatibilité…</Card>
          ))}
      </div>

      {/* Actions — barre collante au-dessus des onglets mobiles */}
      <div className="sticky bottom-20 z-20 flex gap-3 rounded-2xl bg-surface/95 p-3 shadow-md backdrop-blur lg:bottom-4">
        {hasApplied && (
          <Link
            to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${job.id}`}
            className="shrink-0"
          >
            <Button variant="outline" size="lg" className="px-5">
              <Mic className="h-5 w-5" />
              <span className="hidden sm:inline">S’entraîner à l’entretien</span>
            </Button>
          </Link>
        )}
        <Link to={hasApplied ? ROUTES.MY_APPLICATIONS : ROUTES.APPLY.replace(':jobId', job.id)} className="flex-1">
          <Button size="lg" fullWidth variant={hasApplied ? 'outline' : 'primary'}>
            {hasApplied ? 'Voir ma candidature' : 'Postuler maintenant'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default JobDetailsPage
