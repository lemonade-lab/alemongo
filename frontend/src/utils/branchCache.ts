/**
 * 分支缓存工具
 * 统一管理 Git 管理页面和流水线页面的分支缓存
 */

/**
 * 根据 bot_name 和 app_name 生成缓存键
 * @param botName 机器人名称
 * @param appName 应用名称
 */
export const getBranchCacheKey = (botName: string, appName: string): string => {
  return `${botName}:${appName}:branches`
}

/**
 * 从 localStorage 获取缓存的分支列表
 * @param cacheKey 缓存键
 * @returns 分支列表数组
 */
export const getCachedBranches = (cacheKey: string): string[] => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return []

    const parsed = JSON.parse(cached)
    // 兼容两种格式：数组或对象
    if (Array.isArray(parsed)) {
      return parsed
    }
    if (parsed && Array.isArray(parsed.branches)) {
      return parsed.branches
    }
    return []
  } catch (error) {
    console.error('Failed to parse cached branches:', error)
    return []
  }
}

/**
 * 保存分支列表到 localStorage
 * @param cacheKey 缓存键
 * @param branches 分支列表
 */
export const setCachedBranches = (
  cacheKey: string,
  branches: string[]
): void => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ branches }))
  } catch (error) {
    console.error('Failed to cache branches:', error)
  }
}

/**
 * 从 localStorage 中查找所有分支缓存键
 * @returns 所有分支缓存键列表
 */
export const guessBranchCacheKeys = (): string[] => {
  // 从 localStorage 中查找所有可能的缓存键
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.endsWith(':branches')) {
        keys.push(key)
      }
    }
  } catch (error) {
    console.error('Failed to search cache keys:', error)
  }
  return keys
}

/**
 * 尝试从所有缓存中获取分支列表并去重
 * 用于流水线页面，当不知道具体 bot_name 时使用
 * @param repository 仓库地址（保留参数以备将来扩展）
 * @returns 去重后的分支列表
 */
export const getAllCachedBranchesForRepository = (
  repository: string
): string[] => {
  const allBranches = new Set<string>()
  const hasRepository = Boolean(repository?.trim())

  // 查找所有分支缓存
  const cacheKeys = guessBranchCacheKeys()

  cacheKeys.forEach(key => {
    const branches = getCachedBranches(key)
    branches.forEach(branch => allBranches.add(branch))
  })

  // 预留：后续可按 repository 精准过滤缓存来源。
  if (hasRepository) {
    return Array.from(allBranches).sort()
  }

  return Array.from(allBranches).sort()
}
