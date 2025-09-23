import React from 'react'
import { Tabs } from 'antd'
import {
  SettingOutlined,
  MailOutlined,
  GithubOutlined
} from '@ant-design/icons'
import { usePermission } from '@/hook/usePermission'
import SystemInfo from './SystemInfo'
import EmailConfig from './EmailConfig'
import GitHubConfig from './GitHubConfig'

const { TabPane } = Tabs

interface SettingsTabsProps {
  className?: string
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ className = '' }) => {
  const { isSuperAdmin } = usePermission()
  const isSuperAdminValue = isSuperAdmin()

  return (
    <div className={`w-full ${className}`}>
      <Tabs defaultActiveKey="system" size="large">
        <TabPane
          tab={
            <div className="flex items-center gap-2">
              <SettingOutlined />
              通用设置
            </div>
          }
          key="system"
        >
          <SystemInfo />
        </TabPane>

        {/* 邮箱服务配置 */}
        {isSuperAdminValue && (
          <TabPane
            tab={
              <div className="flex items-center gap-2">
                <MailOutlined />
                邮箱服务
              </div>
            }
            key="email"
          >
            <EmailConfig />
          </TabPane>
        )}

        {/* GitHub OAuth配置 */}
        {isSuperAdminValue && (
          <TabPane
            tab={
              <div className="flex items-center gap-2">
                <GithubOutlined />
                GitHub OAuth
              </div>
            }
            key="github"
          >
            <GitHubConfig />
          </TabPane>
        )}
      </Tabs>
    </div>
  )
}

export default SettingsTabs
