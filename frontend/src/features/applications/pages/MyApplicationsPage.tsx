import { Briefcase, Check, ChevronDown, MessageCircleMore, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { JobSummaryRow } from '../../../components/cards/JobSummaryRow'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useApiData } from '../../../hooks'
import { errorMessage } from '../../../services/api/apiClient'
import { applicationsService, type Application } from '../../../services/api/applicationsService'
import { formatJobPay } from '../../../services/api/jobsService'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/formatDate'

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'secondary' | 'accent' | 'error' | 'outline'> = {
  PENDING: 'default',
  UNDER_REVIEW: 'primary',
  SHORTLISTED: 'accent',
  HIRED: 'secondary',
  REJECTED: 'error',
  WITHDRAWN: 'outline',
}

/** Étapes du parcours, dans l'ordre d'avancement. */
const TRACK_STEPS = [
  { status: 'PENDING', label: 'Candidature envoyée' },
  { status: 'UNDER_REVIEW', label: 'En cours d’examen' },
  { status: 'SHORTLISTED', label: 'Présélectionnée' },
  { status: 'HIRED', label: 'Candidature retenue' },
] as const

function TrackTimeline({ application }: { application: Application }) {
  const closed = application.statut === 'REJECTED' || application.statut === 'WITHDRAWN'
  const reached = TRACK_STEPS.findIndex((step) => step.status === application.statut)
  // Pour une candidature clôturée, on ne connaît pas l'étape atteinte : on marque seulement l'envoi.
  const currentIndex = closed ? 0 : Math.max(reached, 0)

  const steps = closed
    ? [TRACK_STEPS[0], { status: application.statut, label: application.statut_display }]
    : [...TRACK_STEPS]

  return (
    <ol className="relative mt-2 space-y-5 pl-1">
      {[...steps].reverse().map((step, reversedIndex) => {
        const index = steps.length - 1 - reversedIndex
        const done = closed ? true : index <= currentIndex
        const isCurrent = !closed && index === currentIndex
        const isClosedStep = closed && index === 1
        const date =
          index === 0
            ? application.date_candidature
            : isCurrent || isClosedStep
              ? application.updated_at
              : null

        return (
          <li key={step.status} className="relative flex gap-4">
            {reversedIndex < steps.length - 1 && (
              <span
                className={cn(
                  'absolute top-7 left-[11px] h-[calc(100%+0.25rem)] w-0.5',
                  done && index > 0 ? 'bg-primary' : 'border-l-2 border-dashed border-border bg-transparent',
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                isClosedStep
                  ? 'bg-error text-white'
                  : isCurrent
                    ? 'border-2 border-primary bg-surface'
                    : done
                      ? 'bg-primary text-white'
                      : 'border-2 border-border bg-surface',
              )}
            >
              {isClosedStep ? (
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              ) : isCurrent ? (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              ) : done ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : null}
            </span>
            <div className="-mt-0.5">
              <p className={cn('text-sm', done ? 'font-medium text-foreground' : 'text-muted')}>{step.label}</p>
              <p className="text-xs text-muted">{date ? formatDate(date) : 'Pas encore'}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function MyApplicationsPage() {
  const { data: applications = [], isLoading, error: loadError, reload } = useApiData(
    () => applicationsService.getApplications({ ordering: '-date_candidature' }),
    [],
    'Impossible de charger vos candidatures.',
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const errorText = actionError ?? loadError
  // La première candidature est dépliée tant que l'utilisateur n'en a pas choisi une autre.
  const expandedId = openId ?? applications[0]?.id ?? null

  const withdraw = async (id: string) => {
    if (!window.confirm('Retirer cette candidature ?')) return
    setBusyId(id)
    try {
      await applicationsService.withdrawApplication(id)
      setActionError(null)
      reload()
    } catch (error) {
      setActionError(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageShell
      eyebrow="Suivi"
      title="Mes candidatures"
      description="Suivez l’avancement de vos candidatures et préparez vos entretiens."
      actions={<Link to={ROUTES.RECOMMENDED_JOBS}><Button>Trouver des offres</Button></Link>}
      className="mx-auto max-w-3xl"
    >
      {isLoading ? (
        <div className="rounded-2xl bg-surface p-6"><Loader label="Chargement…" /></div>
      ) : errorText ? (
        <EmptyState title="Erreur" description={errorText} actionLabel="Réessayer" onAction={() => {
          setActionError(null)
          reload()
        }} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune candidature"
          description="Consultez les offres recommandées par l’IA et postulez en quelques clics."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const isOpen = expandedId === application.id
            const isActive = application.statut !== 'WITHDRAWN' && application.statut !== 'REJECTED'
            return (
              <Card key={application.id} padding="none" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : application.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 text-left transition-colors hover:bg-field/50 sm:p-5"
                >
                  <JobSummaryRow
                    title={application.offre.titre}
                    company={application.offre.entreprise_nom}
                    logo={application.offre.entreprise_logo}
                    aside={
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={STATUS_VARIANTS[application.statut] ?? 'default'}>{application.statut_display}</Badge>
                        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', isOpen && 'rotate-180')} />
                      </div>
                    }
                  />
                  <p className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted">
                    <span>{formatJobPay(application.offre)}</span>
                    <span>Envoyée le {formatDate(application.date_candidature)}</span>
                  </p>
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-background/60 p-4 sm:p-5">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Suivi de la candidature</h3>
                    <TrackTimeline application={application} />
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link to={ROUTES.JOB_DETAILS.replace(':jobId', application.offre.id)}>
                        <Button variant="outline" size="sm">Voir l’offre</Button>
                      </Link>
                      {isActive && (
                        <>
                          <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${application.offre.id}`}>
                            <Button size="sm">
                              <MessageCircleMore className="h-4 w-4" /> Préparer l’entretien
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error hover:bg-error/10"
                            isLoading={busyId === application.id}
                            onClick={() => void withdraw(application.id)}
                          >
                            Retirer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

export default MyApplicationsPage
