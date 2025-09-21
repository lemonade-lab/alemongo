// 权限工具函数

// 身份标识定义（与后端保持一致）
export const IDENTITY = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DEVOPS: 'devops',
  OPERATOR: 'operator',
  DEVELOPER: 'developer',
  MEMBER: 'member',
  GUEST: 'guest'
} as const

// 权限层级定义（数字越大权限越高）
export const PERMISSION_LEVEL = {
  [IDENTITY.GUEST]: 0,
  [IDENTITY.MEMBER]: 1,
  [IDENTITY.DEVELOPER]: 2,
  [IDENTITY.OPERATOR]: 1, // 运营人员虽然只能查看，但级别较高
  [IDENTITY.DEVOPS]: 3,
  [IDENTITY.ADMIN]: 4,
  [IDENTITY.SUPER_ADMIN]: 5
} as const

// 权限检查函数
export const hasPermission = (userIdentity: string, requiredIdentity: string): boolean => {
  // 如果用户身份为空，返回false
  if (!userIdentity) return false
  
  // 如果要求的是超级管理员，只有超级管理员可以访问
  if (requiredIdentity === IDENTITY.SUPER_ADMIN) {
    return userIdentity === IDENTITY.SUPER_ADMIN
  }
  
  // 如果要求的是管理员，管理员和超级管理员都可以访问
  if (requiredIdentity === IDENTITY.ADMIN) {
    return userIdentity === IDENTITY.ADMIN || userIdentity === IDENTITY.SUPER_ADMIN
  }
  
  // 其他情况按权限层级判断
  const userLevel = PERMISSION_LEVEL[userIdentity as keyof typeof PERMISSION_LEVEL] || 0
  const requiredLevel = PERMISSION_LEVEL[requiredIdentity as keyof typeof PERMISSION_LEVEL] || 0
  
  return userLevel >= requiredLevel
}

// 检查是否为超级管理员
export const isSuperAdmin = (userIdentity: string): boolean => {
  return userIdentity === IDENTITY.SUPER_ADMIN
}

// 检查是否为管理员（包括超级管理员）
export const isAdmin = (userIdentity: string): boolean => {
  return userIdentity === IDENTITY.ADMIN || userIdentity === IDENTITY.SUPER_ADMIN
}

// 检查是否为运维人员（包括管理员和超级管理员）
export const isDevOps = (userIdentity: string): boolean => {
  return [IDENTITY.DEVOPS, IDENTITY.ADMIN, IDENTITY.SUPER_ADMIN].includes(userIdentity)
}

// 检查是否为开发人员（包括运维、管理员和超级管理员）
export const isDeveloper = (userIdentity: string): boolean => {
  return [IDENTITY.DEVELOPER, IDENTITY.DEVOPS, IDENTITY.ADMIN, IDENTITY.SUPER_ADMIN].includes(userIdentity)
}

// 检查是否为运营人员（包括管理员和超级管理员）
export const isOperator = (userIdentity: string): boolean => {
  return [IDENTITY.OPERATOR, IDENTITY.ADMIN, IDENTITY.SUPER_ADMIN].includes(userIdentity)
}

// 获取用户权限描述
export const getUserPermissionDescription = (userIdentity: string): string => {
  const descriptions = {
    [IDENTITY.SUPER_ADMIN]: '超级管理员',
    [IDENTITY.ADMIN]: '管理员',
    [IDENTITY.DEVOPS]: '运维人员',
    [IDENTITY.OPERATOR]: '运营人员',
    [IDENTITY.DEVELOPER]: '开发人员',
    [IDENTITY.MEMBER]: '普通成员',
    [IDENTITY.GUEST]: '访客'
  }
  
  return descriptions[userIdentity as keyof typeof descriptions] || '未知身份'
}

// 获取用户权限级别
export const getUserPermissionLevel = (userIdentity: string): number => {
  return PERMISSION_LEVEL[userIdentity as keyof typeof PERMISSION_LEVEL] || 0
}
