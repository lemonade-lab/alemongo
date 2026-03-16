import { request } from '../base'

/** 多配置机器人实例信息 */
export type MultiBotInstance = {
  config_name: string
  process_name: string
  status: number // 0=停止, 1=运行中
  pid: number
}

/** 多配置机器人信息 */
export type MultiBotInfo = {
  name: string
  configs: string[]
  node_modules: boolean
  create_at: string
  instances: MultiBotInstance[]
}

/**
 * 获取多配置机器人列表
 */
export const apiMultiBotList = async (): Promise<MultiBotInfo[]> => {
  return request({
    url: '/multibot/list',
    method: 'GET'
  }).then(res => res.data || [])
}

/**
 * 创建多配置机器人
 */
export const apiMultiBotCreate = async (data: { name: string }) => {
  return request({
    url: '/multibot/multibot',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 删除多配置机器人
 */
export const apiMultiBotDelete = async (data: { name: string }) => {
  return request({
    url: '/multibot/bot',
    method: 'DELETE',
    data
  }).then(res => res.data)
}

/**
 * 获取多配置机器人详情
 */
export const apiMultiBotInfo = async (data: { name: string }) => {
  return request({
    url: '/multibot/info',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 添加多配置机器人的配置文件
 */
export const apiMultiBotAddConfig = async (data: {
  bot_name: string
  name: string
  content: string
}) => {
  return request({
    url: '/multibot/addconfig',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 启动多配置机器人（所有配置实例）
 */
export const apiMultiBotStart = async (data: { name: string }) => {
  return request({
    url: '/multibot/start',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 停止多配置机器人（所有配置实例）
 */
export const apiMultiBotStop = async (data: { name: string }) => {
  return request({
    url: '/multibot/stop',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 重启多配置机器人（所有配置实例）
 */
export const apiMultiBotRestart = async (data: { name: string }) => {
  return request({
    url: '/multibot/restart',
    method: 'POST',
    data
  }).then(res => res.data)
}

// ========= 单实例控制 =========

/**
 * 启动单个实例
 */
export const apiMultiBotInstanceStart = async (data: {
  name: string
  config_name: string
}) => {
  return request({
    url: '/multibot/instance/start',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 停止单个实例
 */
export const apiMultiBotInstanceStop = async (data: {
  name: string
  config_name: string
}) => {
  return request({
    url: '/multibot/instance/stop',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 重启单个实例
 */
export const apiMultiBotInstanceRestart = async (data: {
  name: string
  config_name: string
}) => {
  return request({
    url: '/multibot/instance/restart',
    method: 'POST',
    data
  }).then(res => res.data)
}

// ========= Yarn 依赖管理 =========

/**
 * 安装依赖
 */
export const apiMultiBotYarnInstall = async (data: { name: string }) => {
  return request({
    url: '/multibot/yarn/install',
    method: 'POST',
    data
  }).then(res => res.data)
}

// ========= 配置文件 CRUD =========

/**
 * 获取配置文件列表
 */
export const apiMultiBotConfigsList = async (name: string): Promise<string[]> => {
  return request({
    url: '/multibot/configs',
    method: 'GET',
    params: { name }
  }).then(res => res.data || [])
}

/**
 * 读取配置文件内容
 */
export const apiMultiBotConfigRead = async (data: {
  bot_name: string
  name: string
}) => {
  return request({
    url: '/multibot/configs/read',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 更新配置文件内容
 */
export const apiMultiBotConfigUpdate = async (data: {
  bot_name: string
  name: string
  content: string
}) => {
  return request({
    url: '/multibot/configs',
    method: 'PUT',
    data
  }).then(res => res.data)
}

/**
 * 删除配置文件
 */
export const apiMultiBotConfigDelete = async (data: {
  bot_name: string
  name: string
}) => {
  return request({
    url: '/multibot/configs',
    method: 'DELETE',
    data
  }).then(res => res.data)
}

// ========= 环境变量 =========

/**
 * 读取环境变量
 */
export const apiMultiBotEnvRead = async (data: { name: string }) => {
  return request({
    url: '/multibot/env',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 更新环境变量
 */
export const apiMultiBotEnvUpdate = async (data: {
  name: string
  content: string
}) => {
  return request({
    url: '/multibot/env',
    method: 'PUT',
    data
  }).then(res => res.data)
}

// ========= package.json =========

/**
 * 读取 package.json
 */
export const apiMultiBotPackageRead = async (data: { name: string }) => {
  return request({
    url: '/multibot/package',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 更新 package.json
 */
export const apiMultiBotPackageUpdate = async (data: {
  name: string
  content: string
}) => {
  return request({
    url: '/multibot/package',
    method: 'PUT',
    data
  }).then(res => res.data)
}

// ========= 日志管理 =========

/**
 * 获取日志（分页）
 */
export const apiMultiBotLog = async (data: {
  name: string
  process_name: string
  timestamp?: number
  page?: string
  pageSize?: string
}): Promise<{ log: string; count: number }> => {
  return request({
    url: '/multibot/log',
    method: 'POST',
    data: {
      ...data,
      page: data.page || '1',
      pageSize: data.pageSize || '100'
    }
  }).then(res => res.data)
}

/**
 * 获取在线日志（最后 N 行）
 */
export const apiMultiBotLogOnline = async (data: {
  name: string
  process_name: string
  timestamp?: number
  size?: string
}): Promise<{ log: string }> => {
  return request({
    url: '/multibot/log-online',
    method: 'POST',
    data: {
      ...data,
      size: data.size || '200'
    }
  }).then(res => res.data)
}

/**
 * 删除日志
 */
export const apiMultiBotLogDelete = async (data: {
  name: string
  process_name: string
  timestamp?: number
}) => {
  return request({
    url: '/multibot/log/delete',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 下载日志（返回下载 URL）
 */
export const getMultiBotLogDownloadUrl = (
  name: string,
  processName: string,
  date?: string
) => {
  const params = new URLSearchParams({ name, process_name: processName })
  if (date) params.set('date', date)
  return `/api/v1/multibot/log/download?${params.toString()}`
}

// ========= 应用（packages）管理 =========

export type MultiBotPackage = {
  name: string
  git: {
    repo: string
    branch: string
    commit: string
    author: string
    email: string
    date: string
  }
  pkg: string
  md: string
  status: number // 0:未安装 1:已安装
}

/**
 * 应用列表
 */
export const apiMultiBotPackagesList = async (data: {
  name: string
}): Promise<MultiBotPackage[]> => {
  return request({
    url: '/multibot/packages/list',
    method: 'POST',
    data
  }).then(res => res.data || [])
}

/**
 * 应用详情
 */
export const apiMultiBotPackagesInfo = async (data: {
  name: string
  app_name: string
}) => {
  return request({
    url: '/multibot/packages',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 克隆应用
 */
export const apiMultiBotPackagesClone = async (data: {
  name: string
  repo_url: string
  branch_name: string
  force?: string
}) => {
  return request({
    url: '/multibot/packages/clone',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 删除应用
 */
export const apiMultiBotPackagesDelete = async (data: {
  name: string
  app_name: string
}) => {
  return request({
    url: '/multibot/packages',
    method: 'DELETE',
    data
  }).then(res => res.data)
}

/**
 * 更新应用包的 package.json
 */
export const apiMultiBotPackagesUpdate = async (data: {
  name: string
  app_name: string
  content: string
}) => {
  return request({
    url: '/multibot/packages/pkg',
    method: 'PUT',
    data
  }).then(res => res.data)
}

/**
 * 拉取更新
 */
export const apiMultiBotPackagesPull = async (data: {
  name: string
  repo_name: string
  branch_name: string
}) => {
  return request({
    url: '/multibot/packages/pull',
    method: 'POST',
    data
  }).then(res => res.data)
}

/**
 * 强制拉取更新
 */
export const apiMultiBotPackagesPullForce = async (data: {
  name: string
  repo_name: string
  branch_name: string
}) => {
  return request({
    url: '/multibot/packages/pull/force',
    method: 'POST',
    data
  }).then(res => res.data)
}
