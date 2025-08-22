import { request } from '../base'

export const apiBotLog = async (data: {
  name: string
  timestamp?: number
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/log',
      method: 'POST',
      data
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
