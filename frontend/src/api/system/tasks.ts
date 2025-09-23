import { request } from '../base'

export type Task = {
  id: string
  type: string
  commands: string[]
  status: 'pending' | 'running' | 'success' | 'error' | 'canceled'
  createdAt: string
  startedAt?: string
  endedAt?: string
  logs: string[]
  error?: string
}

export const apiTasks = async (): Promise<Task[]> => {
  const res = await request({ url: '/system/tasks', method: 'GET' })
  const { data } = res as { code: number; msg: string; data: Task[] }
  return data
}

export const apiTask = async (id: string): Promise<Task> => {
  const res = await request({ url: `/system/tasks/${id}`, method: 'GET' })
  const { data } = res as { code: number; msg: string; data: Task }
  return data
}

export const apiTaskCancel = async (id: string): Promise<boolean> => {
  const res = await request({
    url: `/system/tasks/${id}/cancel`,
    method: 'POST'
  })
  const { code } = res as {
    code: number
    msg: string
    data: { id: string; canceled: boolean }
  }
  return code === 200
}
