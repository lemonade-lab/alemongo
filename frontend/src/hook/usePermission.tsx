import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import {
  hasPermission,
  isSuperAdmin,
  isAdmin,
  isDevOps,
  isDeveloper,
  isOperator,
  getUserPermissionDescription,
  getUserPermissionLevel,
  IDENTITY
} from '@/utils/permission'

/**
 * 权限检查Hook
 * 提供各种权限检查功能
 */
export const usePermission = () => {
  const userInfo = useSelector((state: RootState) => state.me.info)
  const userIdentity: string = userInfo.identity

  return {
    // 基础权限检查
    hasPermission: (requiredIdentity: string) =>
      hasPermission(userIdentity, requiredIdentity),

    // 身份检查
    isSuperAdmin: () => isSuperAdmin(userIdentity),
    isAdmin: () => isAdmin(userIdentity),
    isDevOps: () => isDevOps(userIdentity),
    isDeveloper: () => isDeveloper(userIdentity),
    isOperator: () => isOperator(userIdentity),

    // 用户信息
    userIdentity,
    userInfo,
    permissionDescription: getUserPermissionDescription(userIdentity),
    permissionLevel: getUserPermissionLevel(userIdentity),

    // 常量
    IDENTITY
  }
}

/**
 * 权限守卫Hook
 * 用于组件级别的权限控制
 */
export const usePermissionGuard = (requiredIdentity: string) => {
  const { hasPermission, userIdentity } = usePermission()

  return {
    hasAccess: hasPermission(requiredIdentity),
    userIdentity,
    requiredIdentity
  }
}

export default usePermission
