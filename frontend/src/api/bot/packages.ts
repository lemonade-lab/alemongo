import { request } from '../base'

/**
 * packages 是 机器人的 插件包
 */

export type BotPackages = {
  name: string
  git: {
    repo: string
    branch: string
    commit: string
    author: string
    email: string
    date: string
    msg: string
  }
  pkg: string
  md: string
  status: number // 0:未安装 1:已安装
}

export const apiBotPackageClone = async (data: {
  name: string
  repo_url: string
  branch_name: string
  force?: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/clone',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotPackagesList = async (data: {
  name: string
}): Promise<BotPackages[]> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/list',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 更新
export const apiBotPackagesPull = async (data: {
  name: string
  repo_name: string
  branch_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/pull',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 强制更新
export const apiBotPackagesPullForce = async (data: {
  name: string
  repo_name: string
  branch_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/pull/force',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 删除
export const apiBotPackagesDelete = async (data: {
  name: string
  app_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages',
      method: 'DELETE',
      data: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 获取包信息
export const apiBotPackagesInfo = async (data: {
  name: string
  app_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 更新包信息
export const apiBotPackagesGitPackageUpdate = async (data: {
  name: string
  app_name: string
  content: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/pkg',
      method: 'PUT',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// Git 分支相关类型定义
export type BotPackagesGitBranchCommitsInfo = {
  hash: string
  message: string
  author: string
  date: string
}

export type BotPackagesGitCommits = {
  commits: BotPackagesGitBranchCommitsInfo[]
  total: number
  page: number
  page_size: number
  total_page: number
}

export type BotPackagesGitStatus = {
  current_branch: string
  is_clean: boolean
  modified_files: number
  files: Array<{
    file: string
    status: string
  }>
}

export type BotPackagesGitBranches = {
  branches: string[]
  total: number
  page: number
  page_size: number
  total_page: number
}

// 获取Git分支列表
export const apiBotPackagesGitBranches = async (data: {
  name: string
  app_name: string
  page?: number
  page_size?: number
}): Promise<BotPackagesGitBranches> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/branches',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 获取Git提交记录
export const apiBotPackagesGitCommits = async (data: {
  name: string
  app_name: string
  branch_name: string
  page?: number
  page_size?: number
}): Promise<BotPackagesGitCommits> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/commits',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 切换Git分支/提交
export const apiBotPackagesGitSwitch = async (data: {
  name: string
  app_name: string
  branch_name: string
  commit_hash: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/switch',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 从远程获取最新分支信息
export type GitRemoteAnalysis = {
  message: string
  branches: string[]
  remote_branches: string[]
  added_branches: string[]
  deleted_branches: string[]
  current_branch: string
  is_shallow: boolean
  ahead: number
  behind: number
}

export const apiBotPackagesGitFetch = async (data: {
  name: string
  app_name: string
}): Promise<GitRemoteAnalysis> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/fetch',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 获取本地分支列表（快速版本）
export const apiBotPackagesGitBranchesLocal = async (data: {
  name: string
  app_name: string
  page?: number
  page_size?: number
}): Promise<BotPackagesGitBranches> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/branches/local',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 获取本地提交记录（快速版本）
export const apiBotPackagesGitCommitsLocal = async (data: {
  name: string
  app_name: string
  branch_name: string
  page?: number
  page_size?: number
}): Promise<BotPackagesGitCommits> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/commits/local',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 获取Git状态
export const apiBotPackagesGitStatus = async (data: {
  name: string
  app_name: string
}): Promise<BotPackagesGitStatus> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/status',
      method: 'GET',
      params: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 本地分支切换
export const apiBotPackagesGitCheckout = async (data: {
  name: string
  app_name: string
  branch_name: string
  force?: boolean
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/checkout',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 放弃工作区修改
export const apiBotPackagesGitDiscard = async (data: {
  name: string
  app_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/discard',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// Git仓库清理
export const apiBotPackagesGitCleanup = async (data: {
  name: string
  app_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/cleanup',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

// 取消浅克隆限制
export const apiBotPackagesGitUnshallow = async (data: {
  name: string
  app_name: string
}): Promise<null> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/packages/git/unshallow',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}
