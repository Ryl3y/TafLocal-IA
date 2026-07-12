export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'job' | 'interview'

/**
 * In-app notification for users.
 */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: string
}
