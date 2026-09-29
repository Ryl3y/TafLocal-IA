import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { NotificationType } from '../../types'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
}

interface NotificationContextValue {
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

interface NotificationProviderProps {
  children: ReactNode
}

/**
 * NotificationProvider — In-app toast/notification state.
 * TODO: Connect to UI feedback components and backend notification stream.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const addNotification = useCallback((notification: Omit<AppNotification, 'id'>) => {
    const id = crypto.randomUUID()
    setNotifications((prev) => [...prev, { ...notification, id }])
    // TODO: Auto-dismiss after timeout
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = useMemo(
    () => ({ notifications, addNotification, removeNotification, clearNotifications }),
    [notifications, addNotification, removeNotification, clearNotifications],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useAppNotifications must be used within a NotificationProvider')
  }
  return context
}
