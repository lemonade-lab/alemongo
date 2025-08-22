import { request } from '../base'

export const apiGetConfigEmail = async (): Promise<{
  provider: string
  host: string
  port: number
  username: string
  password: string
  from_email: string
}> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/config/email',
      method: 'GET'
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiUpdateEmailConfig = async (data: {
  provider: string
  host: string
  port: number
  username: string
  password: string
  from_email: string
}) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/config/email',
      method: 'PUT',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}
