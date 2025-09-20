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
      url: '/bot/packages/gitbranches',
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
      url: '/bot/packages/gitcommits',
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
