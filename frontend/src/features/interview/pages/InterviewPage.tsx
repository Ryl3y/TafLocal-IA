import { ArrowRight, Mic } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'

const questions = [
  'Présentez votre parcours et expliquez pourquoi cette mission vous correspond.',
  'Quels indicateurs avez-vous utilisés pour mesurer l’impact de vos projets ?',
  'Comment gérez-vous la priorisation des besoins entre plusieurs parties prenantes ?',
]

export function InterviewPage() {
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <PageShell
      eyebrow="Préparation entretien"
      title="Entraînez-vous avec un coach IA"
      description="Simulez un entretien et recevez un feedback prêt à exploiter."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Session de préparation</CardTitle>
            <CardDescription>Profil ciblé : Product Analyst · Poste de niveau confirmé.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4">
              <p className="font-semibold text-foreground">Objectif de la session</p>
              <p className="mt-2 text-sm text-muted">Travailler votre clarté, votre structuration et votre capacité à vulgariser vos résultats.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">3 questions</Badge>
              <Badge variant="outline">Feedback instantané</Badge>
            </div>
            {!started ? (
              <Button onClick={() => setStarted(true)} fullWidth>
                <Mic className="h-4 w-4" />
                Démarrer la simulation
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((prev) => (prev + 1) % questions.length)} variant="outline" fullWidth>
                Question suivante <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>{started ? `Question ${currentIndex + 1} / ${questions.length}` : 'À venir'}</CardTitle>
            <CardDescription>{started ? 'Répondez comme si vous étiez en entretien réel.' : 'Le coach IA vous guidera pas à pas.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {started ? (
              <>
                <div className="rounded-xl border border-border bg-background p-4 text-sm leading-7 text-foreground">
                  {questions[currentIndex]}
                </div>
                <textarea
                  rows={6}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm"
                  placeholder="Enregistrez votre réponse ou rédigez votre réponse structurée."
                />
                <Link to={ROUTES.INTERVIEW_FEEDBACK.replace(':sessionId', 'demo-session')}>
                  <Button fullWidth>Voir le feedback</Button>
                </Link>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
                La session commencera par une question de positionnement, suivie de deux questions plus techniques pour valider votre préparation.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default InterviewPage
