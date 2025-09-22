import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { Result, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'

interface TerminalGuardProps {
  children: React.ReactNode
}

const TerminalGuard: React.FC<TerminalGuardProps> = ({ children }) => {
  const me = useSelector((state: RootState) => state.me)

  // 检查是否为超级管理员
  const isSuperAdmin = me.info?.identity === 'super_admin'

  if (!me.login) {
    return <Navigate to="/login" replace />
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Result
          icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
          title="权限不足"
          subTitle="仅超级管理员可使用终端功能"
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              返回上一页
            </Button>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}

export default TerminalGuard
