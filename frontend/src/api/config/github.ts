import { request } from '../base'

export interface GitHubConfig {
  client_id: string
  client_secret: string
  redirect_url: string
}

export interface GitHubConfigStatus {
  client_id_configured: boolean
  client_secret_configured: boolean
  redirect_url_configured: boolean
  fully_configured: boolean
}

// 获取GitHub配置
export const apiGetConfigGitHub = async (): Promise<GitHubConfig> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/config/github',
      method: 'GET'
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 更新GitHub配置
export const apiUpdateGitHubConfig = async (
  config: GitHubConfig
): Promise<void> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/config/github',
      method: 'PUT',
      data: config
    })
      .then(() => resolve())
      .catch(reject)
  })
}

// 获取GitHub配置状态
export const apiGetGitHubConfigStatus =
  async (): Promise<GitHubConfigStatus> => {
    return new Promise((resolve, reject) => {
      request({
        url: '/config/github/status',
        method: 'GET'
      })
        .then(res => res.data)
        .then(resolve)
        .catch(reject)
    })
  }
