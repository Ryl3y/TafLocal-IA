/**
 * Services de notifications (champs alignés sur le modèle Django).
 */

import { apiClient, buildQuery, unwrapList, type Paginated } from './apiClient'

export interface Notification {
  id: string
  user: string
  type: 'APPLICATION' | 'INTERVIEW' | 'JOB' | 'SYSTEM' | 'PROFILE'
  type_display: string
  titre: string
  message: string
  lu: boolean
  date_envoi: string
}

export async function getNotifications(filters?: { lu?: boolean }): Promise<Notification[]> {
  return unwrapList(
    await apiClient.get<Notification[] | Paginated<Notification>>(`/notifications/${buildQuery(filters)}`),
  )
}

export function markAsRead(id: string): Promise<Notification> {
  return apiClient.post<Notification>(`/notifications/${id}/mark_read/`)
}

export function markAllAsRead(): Promise<{ message: string; updated: number }> {
  return apiClient.post('/notifications/mark_all_read/')
}

export function getUnreadCount(): Promise<{ unread_count: number }> {
  return apiClient.get<{ unread_count: number }>('/notifications/unread_count/')
}

export function deleteNotification(id: string): Promise<void> {
  return apiClient.delete(`/notifications/${id}/`)
}
