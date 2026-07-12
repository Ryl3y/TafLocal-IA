import { Settings2 } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Button } from '../../../components/ui/Button'

export function SettingsPage() {
  return (
    <PageShell
      eyebrow="Préférences"
      title="Personnalisez votre expérience"
      description="Adaptez l’interface et les notifications à vos habitudes."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <CardTitle>Apparence</CardTitle>
            </div>
            <CardDescription>Choisissez le niveau de contraste adapté à votre usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Thème</p>
              <p className="mt-1">Mode clair activé par défaut. Le design est déjà prêt pour l’extension dark mode.</p>
            </div>
            <Button variant="outline">Ajuster l’interface</Button>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recevez des alertes utiles sans saturation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Emails</p>
              <p className="mt-1">Recevoir un résumé des offres recommandées chaque matin.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Applications</p>
              <p className="mt-1">Recevoir un rappel lors de vos prochaines interviews.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default SettingsPage
