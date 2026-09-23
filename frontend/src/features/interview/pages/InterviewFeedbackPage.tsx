import { CheckCircle2, Lightbulb, MessageSquareText, RotateCcw, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AIScoreRing, MatchExplanation } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import {
  CATEGORY_LABELS,
  getInterviewSession,
  type AnswerEvaluation,
  type InterviewSession,
} from '../../../services/api/interviewServices'

function level(score: number) {
  if (score >= 75) return { text: 'Très bon niveau', variant: 'secondary' as const }
  if (score >= 55) return { text: 'Bon niveau', variant: 'primary' as const }
  if (score >= 35) return { text: 'À consolider', variant: 'accent' as const }
  return { text: 'À travailler', variant: 'error' as const }
}

export function InterviewFeedbackPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    getInterviewSession(sessionId)
      .then(setSession)
      .catch((error) => setErrorText(errorMessage(error, 'Session introuvable.')))
      .finally(() => setIsLoading(false))
  }, [sessionId])

  if (isLoading) {
    return <PageShell eyebrow="Retour IA" title="Chargement…"><Loader label="Chargement du feedback…" /></PageShell>
  }

  if (!session || !session.feedback) {
    return (
      <PageShell eyebrow="Retour IA" title="Feedback indisponible">
        <EmptyState
          title="Feedback non disponible"
          description={errorText ?? 'Terminez la simulation pour obtenir votre feedback.'}
          actionLabel="Revenir à la simulation"
          onAction={() => navigate(ROUTES.INTERVIEW.replace(':sessionId', session?.id ?? 'new'))}
        />
      </PageShell>
    )
  }

  const feedback = session.feedback
  const score = Math.round(Number(feedback.score_global ?? 0))
  const badge = level(score)
  const categories = Object.entries(feedback.scores_par_categorie).map(([key, value]) => ({
    label: CATEGORY_LABELS[key] ?? key,
    score: value,
  }))

  return (
    <PageShell
      eyebrow="Retour IA"
      title="Votre performance a été analysée"
      description={session.offre ? `${session.offre.titre} — ${session.offre.entreprise_nom}` : 'Entretien général'}
      actions={
        <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + (session.offre ? `?offre=${session.offre.id}` : '')}>
          <Button><RotateCcw className="h-4 w-4" /> Nouvelle simulation</Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Score global</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{score}/100</h2>
            </div>
            <Badge variant={badge.variant}>{badge.text}</Badge>
          </div>
          <div className="mt-6 flex justify-center">
            <AIScoreRing score={score} label="Performance" size={140} />
          </div>
          {session.duree && <p className="mt-4 text-center text-sm text-muted">Durée : {session.duree} min</p>}
        </Card>

        <div className="space-y-6">
          {categories.length > 0 && (
            <MatchExplanation overallScore={score} summary="Score moyen par type de question." criteria={categories} />
          )}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent-foreground" />
                <CardTitle>Conseils du coach</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              {feedback.conseils.map((tip) => <p key={tip}>• {tip}</p>)}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <CardTitle>Points forts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            {feedback.points_forts.length === 0 ? <p className="text-muted">—</p> : feedback.points_forts.map((p) => <p key={p}>• {p}</p>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Points à améliorer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            {feedback.points_faibles.length === 0 ? <p>—</p> : feedback.points_faibles.map((p) => <p key={p}>• {p}</p>)}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <CardTitle>Détail question par question</CardTitle>
          </div>
          <CardDescription>Relisez vos réponses et l’évaluation de chacune.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.questions.map((question, index) => {
            const evaluation = question.evaluation && 'score' in question.evaluation ? (question.evaluation as AnswerEvaluation) : null
            return (
              <div key={question.id} className="space-y-2 rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-foreground">{index + 1}. {question.question}</p>
                  <Badge variant={evaluation ? (evaluation.score >= 65 ? 'secondary' : evaluation.score >= 45 ? 'accent' : 'error') : 'outline'}>
                    {evaluation ? `${evaluation.score}/100` : 'Sans réponse'}
                  </Badge>
                </div>
                {question.reponse && <p className="whitespace-pre-line text-sm text-muted">{question.reponse}</p>}
                {evaluation && evaluation.axes_amelioration.length > 0 && (
                  <p className="text-xs text-muted">À améliorer : {evaluation.axes_amelioration.join(' ')}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default InterviewFeedbackPage
