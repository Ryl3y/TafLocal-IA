import { BellRing, CheckCheck, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useApiData } from '../../../hooks'
import { errorMessage } from '../../../services/api/apiClient'
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '../../../services/api/notificationServices'
import { formatDateTime } from '../../../utils/formatDate'

export function NotificationsPage() {
  const { data: notifications = [], isLoading, error: loadError, reload, setData } = useApiData(
    getNotifications,
    [],
    'Les notifications sont temporairement indisponibles.',
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const errorText = actionError ?? loadError
  const setNotifications = (updater: (previous: Notification[]) => Notification[]) =>
    setData((previous) => updater(previous ?? []))
  const setErrorText = setActionError

  const read = async (item: Notification) => {
    if (item.lu) return
    try {
      const updated = await markAsRead(item.id)
      setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    } catch (error) {
      setErrorText(errorMessage(error))
    }
  }

  const readAll = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
    } catch (error) {
      setErrorText(errorMessage(error))
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      setErrorText(errorMessage(error))
    }
  }

  const unread = notifications.filter((n) => !n.lu).length

  return (
    <PageShell
      eyebrow="Centre de notifications"
      title="Vos alertes et mises à jour"
      description="Candidatures, analyses de CV et entretiens : restez informé de chaque étape."
      actions={
        unread > 0 ? (
          <Button variant="outline" onClick={() => void readAll()}>
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        ) : undefined
      }
    >
      <Card className="bg-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <CardTitle>Actualités récentes</CardTitle>
            {unread > 0 && <Badge variant="accent">{unread} non lue(s)</Badge>}
          </div>
          <CardDescription>Cliquez sur une notification pour la marquer comme lue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Loader label="Chargement des notifications…" />
          ) : errorText ? (
            <EmptyState title="Notifications indisponibles" description={errorText} actionLabel="Réessayer" onAction={() => {
              setActionError(null)
              reload()
            }} />
          ) : notifications.length === 0 ? (
            <EmptyState title="Aucune notification" description="Vous êtes à jour pour le moment." />
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => void read(item)}
                onKeyDown={(e) => e.key === 'Enter' && void read(item)}
                className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${item.lu ? 'border-border bg-background' : 'border-primary/30 bg-primary-light/20'}`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.titre}</p>
                    <p className="mt-1 text-sm text-muted">{item.message}</p>
                    <p className="mt-1 text-xs text-muted">{item.type_display} · {formatDateTime(item.date_envoi)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!item.lu && <Badge variant="accent">Nouvelle</Badge>}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Supprimer"
                    onClick={(event) => {
                      event.stopPropagation()
                      void remove(item.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default NotificationsPage
