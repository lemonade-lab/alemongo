import { request } from '../base'

export interface NotificationItem {
  id: number
  userName: string
  type: string
  title: string
  content: string
  status: 'unread' | 'read'
  extra?: string
  readAt?: string
  createdAt: string
}

export interface NotificationListResp {
  list: NotificationItem[]
  total: number
  page: number
  page_size: number
}

export function fetchNotifications(params: {
  status?: string
  page?: number
  page_size?: number
}): Promise<NotificationListResp> {
  return request({
    url: '/notifications',
    method: 'GET',
    params
  })
}

export function fetchUnreadCount(): Promise<{ unread: number }> {
  return request({
    url: '/notifications/unread-count',
    method: 'GET'
  })
}

export function markNotificationRead(id: number) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'PATCH'
  })
}

export function markAllNotificationsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'PATCH'
  })
}

export function deleteNotification(id: number) {
  return request({
    url: `/notifications/${id}`,
    method: 'DELETE'
  })
}

export function createNotification(data: {
  userName?: string
  type: string
  title: string
  content: string
  extra?: string
}) {
  return request({
    url: '/notifications/create',
    method: 'POST',
    data
  })
}
