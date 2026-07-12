import { BrainCircuit, CheckCircle2, TrendingUp } from 'lucide-react'
import { AIInsightCard, AIScoreRing, MatchExplanation } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'

const strengths = ['Leadership sur projets cross-functional', 'Capacité à synthétiser des données complexes', 'Bonne compréhension des enjeux business']
const improvements = ['Renforcer les preuves d’impact avec des métriques', 'Ajouter un projet plus orienté produit', 'Adapter l’anglais à un niveau plus commercial']

export function AnalysisResultPage() {
  return (
    <PageShell
      eyebrow="Résultats IA"
      title="Votre profil est bien positionné"
      description="L’analyse montre un fort niveau d’adéquation pour les postes stratégiques et orientés produit."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Score d’employabilité</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">84/100</h2>
            </div>
            <Badge variant="secondary">Excellent</Badge>
          </div>
          <div className="mt-6 flex justify-center">
            <AIScoreRing score={84} label="Adéquation profil" size={140} />
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">
            Votre profil répond très bien aux attentes attendues sur les missions orientées data, product et transformation.
          </p>
        </Card>

        <div className="space-y-6">
          <AIInsightCard
            title="Recommandation prioritaire"
            category="Positionnement de carrière"
            priority="high"
            insight="Votre profil gagnerait à mettre en avant ses réussites de transformation et ses capacités de leadership dans les candidatures ciblées."
            actionItems={['Ajouter un résumé de carrière orienté impact', 'Préparer un pitch court et convaincant', 'Créer une version du CV dédiée aux postes data-product']}
          />
          <MatchExplanation
            overallScore={84}
            summary="Les trois critères les plus déterminants sont l’adéquation métier, la clarté du récit de carrière et la maturité du profil." 
            criteria={[
              { label: 'Expérience métier', score: 90, description: 'Profil cohérent et crédible sur les missions de transition.' },
              { label: 'Présence du récit de carrière', score: 82, description: 'Le parcours est compréhensible, mais il peut être davantage valorisé.' },
              { label: 'Adéquation aux postes cibles', score: 78, description: 'Le matching est solide, avec quelques optimisations possibles.' },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <CardTitle>Points forts</CardTitle>
            </div>
            <CardDescription>Ce que l’IA met en avant dans votre profil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                {strength}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Axes d’amélioration</CardTitle>
            </div>
            <CardDescription>Les éléments à travailler pour maximiser vos opportunités.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvements.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm text-muted">
                <BrainCircuit className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default AnalysisResultPage
