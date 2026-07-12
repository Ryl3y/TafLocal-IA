/**
 * Notification services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface Notification {
  id: number
  user: number
  type: string
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
  updated_at: string
}

export async function getNotifications(): Promise<Notification[]> {
  return apiClient.get<Notification[]>('/notifications/')
}

export async function getNotification(id: number): Promise<Notification> {
  return apiClient.get<Notification>(`/notifications/${id}/`)
}

export async function markAsRead(id: number): Promise<Notification> {
  return apiClient.patch<Notification>(`/notifications/${id}/`, { is_read: true })
}

export async function markAllAsRead(): Promise<void> {
  return apiClient.post('/notifications/mark_all_read/')
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return apiClient.get<{ count: number }>('/notifications/unread_count/')
}

export async function deleteNotification(id: number): Promise<void> {
  return apiClient.delete(`/notifications/${id}/`)
}
