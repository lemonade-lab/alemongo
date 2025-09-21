import server, { request } from '../base'
import { Info } from '../types'

// 一般配置接口类型定义
export interface GeneralConfig {
  github: {
    login_enabled: boolean
  }
  app: {
    name: string
    version: string
    build_time: string
    service_name: string
  }
  ui: {
    show_github_login: boolean
  }
}

export const apiGetGeneralConfig = async (): Promise<GeneralConfig> => {
  return server({
    url: '/common/config',
    method: 'GET'
  }).then(res => res.data)
}

export const apiCommonInfo = async (): Promise<{
  data: Info
}> => {
  return request({
    url: '/common/info',
    method: 'GET'
  }).then(res => res.data)
}
