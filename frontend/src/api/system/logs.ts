import { request } from '@/api/base'

export const apiSystemLog = async (data: {
  timestamp?: number
  page: string
  pageSize: string
}) => {
  const res = await request({ url: '/system/log', method: 'POST', data })
  return res?.data || { log: '', count: 0 }
}

export const apiSystemLogOnline = async (data: {
  timestamp?: number
  size: string
}) => {
  const res = await request({ url: '/system/log-online', method: 'POST', data })
  return res?.data || { log: '' }
}

export const apiSystemLogDownloadUrl = (date: string) =>
  `/api/v1/system/log/download?date=${encodeURIComponent(date)}`
