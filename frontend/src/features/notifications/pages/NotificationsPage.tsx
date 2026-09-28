import { Bell, BriefcaseBusiness, CheckCheck, FileText, MessageCircleMore, Trash2, UserRound, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
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
import { cn } from '../../../utils/cn'
import { formatDateTime } from '../../../utils/formatDate'

const TYPE_STYLES: Record<Notification['type'], { icon: LucideIcon; tone: string }> = {
  APPLICATION: { icon: FileText, tone: 'bg-pastel-blue text-primary' },
  INTERVIEW: { icon: MessageCircleMore, tone: 'bg-pastel-mint text-secondary' },
  JOB: { icon: BriefcaseBusiness, tone: 'bg-pastel-sand text-accent-foreground' },
  PROFILE: { icon: UserRound, tone: 'bg-pastel-pink text-error' },
  SYSTEM: { icon: Bell, tone: 'bg-field text-foreground' },
}

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

  const unreadItems = notifications.filter((n) => !n.lu)
  const readItems = notifications.filter((n) => n.lu)

  const renderItem = (item: Notification) => {
    const { icon: Icon, tone } = TYPE_STYLES[item.type] ?? TYPE_STYLES.SYSTEM
    return (
      <li key={item.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => void read(item)}
          onKeyDown={(e) => e.key === 'Enter' && void read(item)}
          className={cn(
            'group flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-field/60',
            !item.lu && 'bg-primary-light/40',
          )}
        >
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', tone)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{item.titre}</span>
              {item.message && <span className="text-muted"> — {item.message}</span>}
            </p>
            <p className="mt-1 text-xs text-muted">{item.type_display} · {formatDateTime(item.date_envoi)}</p>
          </div>
          {!item.lu && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Non lue" />}
          <Button
            size="icon"
            variant="ghost"
            aria-label="Supprimer"
            className="h-9 w-9 shrink-0 opacity-60 group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation()
              void remove(item.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </li>
    )
  }

  return (
    <PageShell
      eyebrow="Centre de notifications"
      title="Activité"
      description="Candidatures, analyses de CV et entretiens : restez informé de chaque étape."
      className="mx-auto max-w-3xl"
      actions={
        unreadItems.length > 0 ? (
          <Button variant="outline" onClick={() => void readAll()}>
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <Card><Loader label="Chargement des notifications…" /></Card>
      ) : errorText ? (
        <EmptyState title="Notifications indisponibles" description={errorText} actionLabel="Réessayer" onAction={() => {
          setActionError(null)
          reload()
        }} />
      ) : notifications.length === 0 ? (
        <EmptyState title="Aucune notification" description="Vous êtes à jour pour le moment." />
      ) : (
        [
          { title: `Nouvelles (${unreadItems.length})`, items: unreadItems },
          { title: 'Déjà lues', items: readItems },
        ]
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <section key={group.title} className="space-y-3">
              <h2 className="px-1 text-sm font-semibold text-foreground">{group.title}</h2>
              <Card padding="none" className="overflow-hidden">
                <ul className="divide-y divide-border">{group.items.map(renderItem)}</ul>
              </Card>
            </section>
          ))
      )}
    </PageShell>
  )
}

export default NotificationsPage
