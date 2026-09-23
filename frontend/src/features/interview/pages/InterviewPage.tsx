import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Mic, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { FormField } from '../../../components/forms/FormField'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { Textarea } from '../../../components/ui/Textarea'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import {
  CATEGORY_LABELS,
  completeInterviewSession,
  createInterviewSession,
  getInterviewSession,
  getInterviewSessions,
  INTERVIEW_TYPES,
  submitAnswer,
  type AnswerEvaluation,
  type InterviewSession,
  type InterviewType,
} from '../../../services/api/interviewServices'
import { jobsService, type Job } from '../../../services/api/jobsService'
import { formatDate } from '../../../utils/formatDate'

function InterviewSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [history, setHistory] = useState<InterviewSession[]>([])
  const [jobId, setJobId] = useState(searchParams.get('offre') ?? '')
  const [type, setType] = useState<InterviewType>('MIXED')
  const [count, setCount] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([jobsService.getJobs({ ordering: '-date_publication' }), getInterviewSessions()])
      .then(([jobList, sessions]) => {
        setJobs(jobList)
        setHistory(sessions)
      })
      .catch((error) => setErrorText(errorMessage(error)))
      .finally(() => setIsLoading(false))
  }, [])

  const start = async () => {
    setIsCreating(true)
    setErrorText(null)
    try {
      const session = await createInterviewSession({ offre: jobId || null, type_entretien: type, nombre_questions: count })
      navigate(ROUTES.INTERVIEW.replace(':sessionId', session.id))
    } catch (error) {
      setErrorText(errorMessage(error, 'Impossible de créer la session.'))
      setIsCreating(false)
    }
  }

  return (
    <PageShell
      eyebrow="Préparation entretien"
      title="Entraînez-vous avec le coach IA"
      description="Des questions adaptées au poste visé et à votre profil, puis une évaluation détaillée de chaque réponse."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Nouvelle simulation</CardTitle>
            <CardDescription>Les questions ciblent en priorité les compétences exigées que vous maîtrisez le moins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Loader label="Chargement…" />
            ) : (
              <>
                <FormField label="Poste visé" htmlFor="interview-job">
                  <select
                    id="interview-job"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
                  >
                    <option value="">Entretien général (selon mon profil)</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.titre} — {job.entreprise_nom}</option>
                    ))}
                  </select>
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTERVIEW_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`rounded-xl border p-3 text-left text-sm transition ${type === option.value ? 'border-primary bg-primary-light/40' : 'border-border bg-background hover:border-primary/40'}`}
                    >
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="mt-1 text-muted">{option.description}</p>
                    </button>
                  ))}
                </div>
                <FormField label={`Nombre de questions : ${count}`} htmlFor="interview-count">
                  <input
                    id="interview-count"
                    type="range"
                    min={3}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full"
                  />
                </FormField>
                {errorText && <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{errorText}</div>}
                <Button fullWidth onClick={() => void start()} isLoading={isCreating}>
                  <Mic className="h-4 w-4" /> Démarrer la simulation
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Mes simulations</CardTitle>
            <CardDescription>Reprenez une session ou consultez son feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isLoading && history.length === 0 && <p className="text-sm text-muted">Aucune simulation pour le moment.</p>}
            {history.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{session.offre?.titre ?? 'Entretien général'}</p>
                  <p className="text-xs text-muted">
                    {session.type_entretien_display} · {formatDate(session.created_at)} · {session.progression.repondues}/{session.progression.total}
                  </p>
                </div>
                {session.statut === 'COMPLETED' ? (
                  <Link to={ROUTES.INTERVIEW_FEEDBACK.replace(':sessionId', session.id)}>
                    <Button size="sm" variant="outline">{Math.round(Number(session.score_global ?? 0))}/100</Button>
                  </Link>
                ) : (
                  <Link to={ROUTES.INTERVIEW.replace(':sessionId', session.id)}>
                    <Button size="sm">Reprendre</Button>
                  </Link>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

function EvaluationPanel({ evaluation }: { evaluation: AnswerEvaluation }) {
  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary-light/30 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-foreground">{evaluation.commentaire}</p>
        <Badge variant={evaluation.score >= 65 ? 'secondary' : evaluation.score >= 45 ? 'accent' : 'error'}>{evaluation.score}/100</Badge>
      </div>
      {evaluation.points_forts.length > 0 && (
        <ul className="list-inside list-disc text-secondary">
          {evaluation.points_forts.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      {evaluation.axes_amelioration.length > 0 && (
        <ul className="list-inside list-disc text-muted">
          {evaluation.axes_amelioration.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
    </div>
  )
}

function InterviewRunner({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [index, setIndex] = useState(0)
  const [draft, setDraft] = useState('')
  const [draftFor, setDraftFor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getInterviewSession(sessionId)
      .then((data) => {
        if (!active) return
        setSession(data)
        const firstUnanswered = data.questions.findIndex((q) => !q.reponse)
        setIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
      })
      .catch((error) => active && setErrorText(errorMessage(error, 'Session introuvable.')))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [sessionId])

  const question = session?.questions[index]
  // Quand on change de question, le brouillon reprend la réponse enregistrée.
  if (question && question.id !== draftFor) {
    setDraftFor(question.id)
    setDraft(question.reponse ?? '')
  }

  const answered = useMemo(() => session?.questions.filter((q) => q.reponse).length ?? 0, [session])

  if (isLoading) {
    return <PageShell eyebrow="Entretien" title="Chargement…"><Loader label="Chargement de la session…" /></PageShell>
  }
  if (!session || !question) {
    return (
      <PageShell eyebrow="Entretien" title="Session introuvable">
        <EmptyState title="Session introuvable" description={errorText ?? undefined} actionLabel="Nouvelle simulation" onAction={() => navigate(ROUTES.INTERVIEW.replace(':sessionId', 'new'))} />
      </PageShell>
    )
  }
  if (session.statut === 'COMPLETED') {
    return (
      <PageShell eyebrow="Entretien" title="Session terminée">
        <EmptyState icon={CheckCircle2} title="Cette simulation est terminée" actionLabel="Voir le feedback" onAction={() => navigate(ROUTES.INTERVIEW_FEEDBACK.replace(':sessionId', session.id))} />
      </PageShell>
    )
  }

  const evaluation = question.evaluation && 'score' in question.evaluation ? (question.evaluation as AnswerEvaluation) : null
  const isLast = index === session.questions.length - 1

  const send = async () => {
    if (!draft.trim()) return
    setIsSending(true)
    setErrorText(null)
    try {
      const updated = await submitAnswer(session.id, question.id, draft.trim())
      setSession((prev) => prev && {
        ...prev,
        statut: prev.statut === 'SCHEDULED' ? 'IN_PROGRESS' : prev.statut,
        questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
      })
    } catch (error) {
      setErrorText(errorMessage(error, 'Envoi impossible.'))
    } finally {
      setIsSending(false)
    }
  }

  const finish = async () => {
    setIsFinishing(true)
    setErrorText(null)
    try {
      await completeInterviewSession(session.id)
      navigate(ROUTES.INTERVIEW_FEEDBACK.replace(':sessionId', session.id))
    } catch (error) {
      setErrorText(errorMessage(error, 'Impossible de terminer la session.'))
      setIsFinishing(false)
    }
  }

  return (
    <PageShell
      eyebrow="Simulation d’entretien"
      title={session.offre ? `${session.offre.titre} — ${session.offre.entreprise_nom}` : 'Entretien général'}
      description={`${session.type_entretien_display} · ${answered}/${session.questions.length} réponses`}
      actions={
        <Button variant="outline" onClick={() => void finish()} isLoading={isFinishing} disabled={answered === 0}>
          <Flag className="h-4 w-4" /> Terminer et voir le feedback
        </Button>
      }
    >
      <ProgressBar value={answered} max={session.questions.length} label="Progression" showValue />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="h-fit bg-surface">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session.questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ${i === index ? 'border-primary bg-primary-light/40' : 'border-border bg-background'}`}
              >
                <span className="truncate">
                  {i + 1}. {CATEGORY_LABELS[q.categorie ?? 'AUTRE']}{q.competence ? ` · ${q.competence}` : ''}
                </span>
                {q.reponse ? <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" /> : null}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Question {index + 1} / {session.questions.length}</CardTitle>
              <Badge variant="outline">{CATEGORY_LABELS[question.categorie ?? 'AUTRE']}</Badge>
            </div>
            <CardDescription>Répondez comme en entretien réel : structurez, donnez des exemples et des résultats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 text-sm leading-7 text-foreground">{question.question}</div>
            <Textarea
              rows={7}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Rédigez votre réponse…"
            />
            {errorText && <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{errorText}</div>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void send()} isLoading={isSending} disabled={!draft.trim()}>
                <Send className="h-4 w-4" /> {question.reponse ? 'Réévaluer ma réponse' : 'Valider ma réponse'}
              </Button>
              <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                <ArrowLeft className="h-4 w-4" /> Précédente
              </Button>
              {!isLast && (
                <Button variant="ghost" onClick={() => setIndex(index + 1)}>
                  Suivante <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            {evaluation && <EvaluationPanel evaluation={evaluation} />}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export function InterviewPage() {
  const { sessionId = 'new' } = useParams<{ sessionId: string }>()
  return sessionId === 'new' ? <InterviewSetup /> : <InterviewRunner key={sessionId} sessionId={sessionId} />
}

export default InterviewPage
