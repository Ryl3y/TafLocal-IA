import { MessageSquareText, TrendingUp } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'
import { AIScoreRing } from '../../../components/ai'

const feedbackPoints = [
  {
    title: 'Clarté du message',
    score: 88,
    description: 'Votre pitch reste cohérent et structuré. Vous pouvez gagner en précision sur les résultats obtenus.',
  },
  {
    title: 'Réactivité',
    score: 79,
    description: 'Vous répondez rapidement, mais un peu plus de cadrage aiderait à clarifier vos décisions.',
  },
  {
    title: 'Impact',
    score: 84,
    description: 'Le niveau d’impact est compris. Ajoutez quelques chiffres concrets pour renforcer votre récit.',
  },
]

export function InterviewFeedbackPage() {
  return (
    <PageShell
      eyebrow="Retour IA"
      title="Votre performance a été analysée"
      description="Le coach IA vous livre un rapport clair, utile et prêt à être amélioré."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Score global</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">82/100</h2>
            </div>
            <Badge variant="secondary">Très bon niveau</Badge>
          </div>
          <div className="mt-6 flex justify-center">
            <AIScoreRing score={82} label="Performance" size={140} />
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">
            Votre entretien a démontré un bon niveau d’assurance et une logique de réponse cohérente. Quelques ajustements sur l’impact quantifié renforceraient encore votre profil.
          </p>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <CardTitle>Feedback détaillé</CardTitle>
            </div>
            <CardDescription>Votre capacité à structurer vos réponses a été appréciée.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackPoints.map((point) => (
              <div key={point.title} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{point.title}</p>
                  <span className="text-sm font-semibold text-primary">{point.score}/100</span>
                </div>
                <p className="mt-2 text-sm text-muted">{point.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <CardTitle>Axes d’amélioration</CardTitle>
          </div>
          <CardDescription>Des recommandations simples pour progresser rapidement.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Quantifier vos résultats</p>
            <p className="mt-2">Ajoutez 1 ou 2 indicateurs concrets pour rendre votre récit plus crédible.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Structurer les réponses</p>
            <p className="mt-2">Utilisez un format situation – action – résultat pour être plus percutant.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Renforcer la posture</p>
            <p className="mt-2">Adoptez une ouverture plus fluide et plus confiante sur les questions de leadership.</p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default InterviewFeedbackPage
