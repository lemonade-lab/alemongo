import { request } from '../base'

export const apiIdentityList = async () => {
  return request({
    url: '/user/identity/list',
    method: 'GET'
  }).then(res => res.data)
}

export const apiIdentityUpdate = async (data: {
  username: string
  identity: string
}) => {
  return request({
    url: '/user/identity',
    method: 'PUT',
    data: data
  }).then(res => res.data)
}
