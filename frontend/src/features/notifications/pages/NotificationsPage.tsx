import { BellRing, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { getNotifications, type NotificationItem } from '../../../services/api/demoServices'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadNotifications = async () => {
      try {
        setIsLoading(true)
        const data = await getNotifications()
        if (isMounted) {
          setNotifications(data)
          setErrorMessage(null)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Les notifications sont temporairement indisponibles.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <PageShell
      eyebrow="Centre de notifications"
      title="Vos alertes et mises à jour"
      description="Restez informé des changements importants autour de votre parcours."
    >
      <Card className="bg-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <CardTitle>Actualités récentes</CardTitle>
          </div>
          <CardDescription>Les messages les plus utiles à votre progression.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Loader label="Chargement des notifications…" />
          ) : errorMessage ? (
            <EmptyState title="Notifications indisponibles" description={errorMessage} />
          ) : notifications.length === 0 ? (
            <EmptyState title="Aucune notification" description="Vous êtes à jour pour le moment." />
          ) : (
            notifications.map((item) => (
              <div key={item.title} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                    <p className="mt-1 text-xs text-muted">{item.time}</p>
                  </div>
                </div>
                {item.unread && <Badge variant="accent">Nouvelle</Badge>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default NotificationsPage
