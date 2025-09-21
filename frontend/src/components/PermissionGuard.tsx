import React from 'react'
import { usePermission } from '@/hook/usePermission'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredIdentity: string
  fallback?: React.ReactNode
  showError?: boolean
}

/**
 * 权限守卫组件
 * 用于控制页面或组件的访问权限
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredIdentity,
  fallback,
  showError = true
}) => {
  const { hasPermission,  permissionDescription } = usePermission()
  const navigate = useNavigate()

  // 检查权限
  if (!hasPermission(requiredIdentity)) {
    // 如果提供了自定义fallback，使用它
    if (fallback) {
      return <>{fallback}</>
    }

    // 如果不需要显示错误，返回null
    if (!showError) {
      return null
    }

    // 显示权限不足的错误页面
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Result
          status="403"
          title="权限不足"
          subTitle={
            <div className="text-gray-600 dark:text-gray-400">
              <p>您当前的权限级别：{permissionDescription}</p>
              <p>访问此页面需要更高的权限级别</p>
            </div>
          }
          extra={
            <div className="space-x-4">
              <Button type="primary" onClick={() => navigate('/')}>
                返回首页
              </Button>
              <Button onClick={() => navigate(-1)}>
                返回上页
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}

export default PermissionGuard
