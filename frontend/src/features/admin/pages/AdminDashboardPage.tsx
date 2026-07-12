import { ShieldCheck, Users2 } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Badge } from '../../../components/ui/Badge'

export function AdminDashboardPage() {
  return (
    <PageShell
      eyebrow="Administration"
      title="Pilotage de la plateforme"
      description="Surveillez les usages, la santé du produit et la qualité du contenu publié."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Utilisateurs actifs</CardTitle>
            <CardDescription>Sur les 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">2.4k</p>
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Offres publiées</CardTitle>
            <CardDescription>Montées en ligne récemment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-secondary">183</p>
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Signalements à traiter</CardTitle>
            <CardDescription>Mise en conformité</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">7</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-primary" />
              <CardTitle>Gestion des comptes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <p className="font-semibold text-foreground">Candidats actifs</p>
                <p className="text-sm text-muted">1.7k</p>
              </div>
              <Badge variant="secondary">Stables</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <p className="font-semibold text-foreground">Entreprises partenaires</p>
                <p className="text-sm text-muted">412</p>
              </div>
              <Badge variant="primary">Croissance</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <CardTitle>Modération</CardTitle>
            </div>
            <CardDescription>Contrôle qualité des contenus publiés.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Les nouveaux contenus sont analysés automatiquement pour garantir une expérience de qualité.</p>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">État du système</p>
              <p className="mt-1">Aucun incident majeur sur les services d’analyse et de matching.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default AdminDashboardPage
