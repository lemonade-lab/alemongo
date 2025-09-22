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

// 系统监控信息类型
export interface SystemStats {
  cpu: {
    usage: number
    count: number
    model: string
    load_avg: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    available: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  uptime: string
}

// 获取系统监控信息
export const apiGetSystemStats = async (): Promise<SystemStats> => {
  return request({
    url: '/common/monitor',
    method: 'GET'
  }).then(res => res.data)
}
