import server, { request, TOKEN_KEY } from '../base'

export const apiLogin = async (data: {
  password: string
  username: string
}) => {
  return server({
    url: '/user/login',
    method: 'POST',
    data: data
  }).then(res => res.data)
}

/**
 *
 * @returns
 */
export const apiLogout = async () => {
  return request({
    url: '/user/logout',
    method: 'GET'
  }).then(res => {
    localStorage.removeItem(TOKEN_KEY)
    return res
  })
}

/**
 *
 * @param data
 * @returns
 */
export const apiPassword = async (data: {
  password: string
  old_password: string
}) => {
  return request({
    url: '/user/password',
    method: 'PUT',
    data: data
  }).then(res => res.data)
}

export const apiInfo = async () => {
  return request({
    url: '/user/info',
    method: 'GET'
  }).then(res => res.data)
}

// GitHub 相关 API
export const apiGetGitHubAuthURL = async (state?: string) => {
  return server({
    url: '/user/github/auth-url',
    method: 'GET',
    params: state ? { state } : {}
  }).then(res => res.data)
}

export const apiGitHubLogin = async (data: {
  code: string
  state?: string
}) => {
  return server({
    url: '/user/github/login',
    method: 'POST',
    timeout: 1000 * 6,
    data: data
  }).then(res => res.data)
}

export const apiBindGitHubAccount = async (data: {
  code: string
}) => {
  return request({
    url: '/user/github/bind',
    method: 'POST',
    data: data
  }).then(res => res.data)
}

export const apiUnbindGitHubAccount = async () => {
  return request({
    url: '/user/github/unbind',
    method: 'POST'
  }).then(res => res.data)
}
