import { request } from '../base'

export const apiBotLog = async (data: {
  name: string
  timestamp?: number
  page?: string
  pageSize?: string
}): Promise<{
  log: string
  count: number
}> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/log',
      method: 'POST',
      data: {
        ...data,
        page: data.page || '1',
        pageSize: data.pageSize || '100'
      }
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotLogOnLine = async (data: {
  name: string
  timestamp?: number
  size?: string
}): Promise<{
  log: string
  count: number
}> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/log-online',
      method: 'POST',
      data: {
        ...data,
        size: data.size || '100'
      }
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}


export const apiBotLogDelete = async (data: {
  name: string
  timestamp: number
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/log',
      method: 'DELETE',
      data
    })
      .then(() => resolve())
      .catch(reject)
  })
}
