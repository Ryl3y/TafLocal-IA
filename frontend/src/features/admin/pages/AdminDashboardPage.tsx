import { Cpu, ShieldCheck, Users2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { getEngineStatus, type EngineStatus } from '../../../services/api/aiServices'
import { API_BASE_URL, errorMessage } from '../../../services/api/apiClient'
import { getPlatformStats, type PlatformStats } from '../../../services/api/profileServices'
import { CompanyVerificationPanel } from '../components/CompanyVerificationPanel'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [engine, setEngine] = useState<EngineStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPlatformStats(), getEngineStatus()])
      .then(([statsData, engineData]) => {
        setStats(statsData)
        setEngine(engineData)
      })
      .catch((error) => setErrorText(errorMessage(error, 'Statistiques indisponibles.')))
      .finally(() => setIsLoading(false))
  }, [])

  const adminUrl = API_BASE_URL.replace(/\/api\/?$/, '/admin/')

  return (
    <PageShell
      eyebrow="Administration"
      title="Pilotage de la plateforme"
      description="Vérifiez les entreprises, suivez l’activité de la plateforme et l’état du moteur IA."
    >
      <CompanyVerificationPanel />

      {isLoading ? (
        <Loader label="Chargement des statistiques…" />
      ) : errorText || !stats ? (
        <EmptyState title="Statistiques indisponibles" description={errorText ?? undefined} />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Utilisateurs', value: stats.utilisateurs, color: 'text-primary' },
              { label: 'Offres publiées', value: stats.offres_publiees, color: 'text-secondary' },
              { label: 'Candidatures', value: stats.candidatures, color: 'text-foreground' },
              { label: 'CV analysés', value: stats.analyses_cv, color: 'text-foreground' },
            ].map((item) => (
              <Card key={item.label} className="bg-surface">
                <CardHeader>
                  <CardTitle>{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-semibold ${item.color}`}>{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-primary" />
                  <CardTitle>Comptes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <p className="font-semibold text-foreground">Candidats</p>
                  <Badge variant="secondary">{stats.candidats}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <p className="font-semibold text-foreground">Entreprises</p>
                  <Badge variant="primary">{stats.entreprises}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <p className="font-semibold text-foreground">Simulations d’entretien</p>
                  <Badge variant="outline">{stats.entretiens}</Badge>
                </div>
                <a href={adminUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-primary hover:underline">
                  Ouvrir l’administration Django (modération, comptes, journaux d’audit)
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-secondary" />
                  <CardTitle>Moteur IA interne</CardTitle>
                </div>
                <CardDescription>Aucune donnée n’est envoyée à un service externe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted">
                {engine && (
                  <>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{engine.engine} — v{engine.version}</span>
                      <Badge variant="secondary">{engine.status === 'healthy' ? 'Opérationnel' : engine.status}</Badge>
                    </div>
                    <p>{engine.skills_in_catalog} compétences dans le référentiel.</p>
                    <div className="flex flex-wrap gap-2">
                      {engine.features.map((feature) => (
                        <Badge key={feature} variant="outline">{feature.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  )
}

export default AdminDashboardPage
