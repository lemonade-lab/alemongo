import React from 'react'
import { Badge, Tooltip } from 'antd'
import { 
  CrownOutlined, 
  SafetyCertificateOutlined, 
  SettingOutlined, 
  UserOutlined,
  TeamOutlined,
  CodeOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { usePermission } from '@/hook/usePermission'

interface UserIdentityBadgeProps {
  showIcon?: boolean
  showText?: boolean
  size?: 'small' | 'default' | 'large'
  className?: string
}

/**
 * 用户身份标识组件
 * 显示当前用户的身份和权限级别
 */
const UserIdentityBadge: React.FC<UserIdentityBadgeProps> = ({
  showIcon = true,
  showText = true,
  size = 'default',
  className = ''
}) => {
  const { userIdentity, permissionDescription, permissionLevel } = usePermission()

  // 根据身份获取对应的图标和颜色
  const getIdentityConfig = () => {
    switch (userIdentity) {
      case 'super_admin':
        return {
          icon: <CrownOutlined />,
          color: '#ff4d4f',
          bgColor: '#fff2f0',
          borderColor: '#ffccc7'
        }
      case 'admin':
        return {
          icon: <SafetyCertificateOutlined />,
          color: '#1890ff',
          bgColor: '#f0f5ff',
          borderColor: '#adc6ff'
        }
      case 'devops':
        return {
          icon: <SettingOutlined />,
          color: '#52c41a',
          bgColor: '#f6ffed',
          borderColor: '#b7eb8f'
        }
      case 'operator':
        return {
          icon: <EyeOutlined />,
          color: '#722ed1',
          bgColor: '#f9f0ff',
          borderColor: '#d3adf7'
        }
      case 'developer':
        return {
          icon: <CodeOutlined />,
          color: '#fa8c16',
          bgColor: '#fff7e6',
          borderColor: '#ffd591'
        }
      case 'member':
        return {
          icon: <UserOutlined />,
          color: '#13c2c2',
          bgColor: '#e6fffb',
          borderColor: '#87e8de'
        }
      case 'guest':
        return {
          icon: <TeamOutlined />,
          color: '#8c8c8c',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9'
        }
      default:
        return {
          icon: <UserOutlined />,
          color: '#8c8c8c',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9'
        }
    }
  }

  const config = getIdentityConfig()
  const sizeClass = size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'

  return (
    <Tooltip title={`权限级别: ${permissionLevel} | ${permissionDescription}`}>
      <Badge
        count={permissionLevel}
        size="small"
        style={{
          backgroundColor: config.color,
          color: 'white',
          fontSize: '10px',
          minWidth: '16px',
          height: '16px',
          lineHeight: '16px'
        }}
      >
        <div
          className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-md border
            ${sizeClass}
            ${className}
          `}
          style={{
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            color: config.color
          }}
        >
          {showIcon && (
            <span className="flex items-center">
              {config.icon}
            </span>
          )}
          {showText && (
            <span className="font-medium">
              {permissionDescription}
            </span>
          )}
        </div>
      </Badge>
    </Tooltip>
  )
}

export default UserIdentityBadge
