import { ArrowRight, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MatchExplanation } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'

export function JobDetailsPage() {
  return (
    <PageShell
      eyebrow="Offre sélectionnée"
      title="Product Analyst"
      description="Une mission de transition et d’optimisation pour une équipe produit à forte croissance."
      actions={
        <Link to={ROUTES.APPLY.replace(':jobId', 'job-1')}>
          <Button>
            Postuler <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="bg-surface">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Northstar Labs</CardTitle>
                  <CardDescription>Paris, France · CDI · 58k€ – 66k€</CardDescription>
                </div>
                <Badge variant="secondary">92% match</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted">
              <p>Northstar Labs développe des solutions SaaS pour des équipes de croissance. Vous travaillerez à la rencontre entre données, product et stratégie pour transformer les insights en actions concrètes.</p>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary" /> Produit</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Paris</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> CDI</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted">
              <p>Vous serez en charge de structurer les dashboards stratégiques, de mesurer l’impact des initiatives produit et de proposer des recommandations basées sur des données fiables.</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Construire des analyses de performance produit.</li>
                <li>Définir des indicateurs clés et suivre leur évolution.</li>
                <li>Collaborer étroitement avec les équipes produit, data et commercial.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compétences demandées</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="primary">SQL</Badge>
              <Badge variant="primary">Tableau</Badge>
              <Badge variant="primary">Product analytics</Badge>
              <Badge variant="outline">Présentation</Badge>
              <Badge variant="outline">Stakeholder management</Badge>
            </CardContent>
          </Card>

          <MatchExplanation
            overallScore={92}
            summary="Le profil correspond très bien à la cible métier de cette offre."
            criteria={[
              { label: 'Expérience produit', score: 94, description: 'Le parcours est très cohérent avec la cible.' },
              { label: 'Analyse de données', score: 89, description: 'Bon niveau de compréhension analytique.' },
              { label: 'Communication', score: 87, description: 'Capacité de synthèse déjà démontrée.' },
            ]}
          />
        </div>
      </div>
    </PageShell>
  )
}

export default JobDetailsPage
