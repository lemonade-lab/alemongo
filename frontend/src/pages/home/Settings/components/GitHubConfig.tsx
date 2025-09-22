import React, { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import {
  apiGetConfigGitHub,
  apiUpdateGitHubConfig,
  apiGetGitHubConfigStatus
} from '@/api/config/github'
import { usePermission } from '@/hook/usePermission'

interface GitHubConfigProps {
  className?: string
}

const GitHubConfig: React.FC<GitHubConfigProps> = ({ className = '' }) => {
  const [githubForm] = Form.useForm()
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [initialGitHubLoading, setInitialGitHubLoading] = useState(true)
  const { isSuperAdmin } = usePermission()

  // 缓存isSuperAdmin的结果，避免useEffect无限循环
  const isSuperAdminValue = isSuperAdmin()

  // 获取GitHub配置
  useEffect(() => {
    if (isSuperAdminValue) {
      Promise.all([apiGetConfigGitHub(), apiGetGitHubConfigStatus()])
        .then(([config]) => {
          githubForm.setFieldsValue({
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_url: config.redirect_url
          })
        })
        .catch(() => {
          message.error('获取GitHub配置失败')
        })
        .finally(() => {
          setInitialGitHubLoading(false)
        })
    } else {
      setInitialGitHubLoading(false)
    }
  }, [githubForm, isSuperAdminValue])

  // 处理GitHub配置
  const handleGitHubConfig = async (values: {
    client_id: string
    client_secret: string
    redirect_url: string
  }) => {
    if (isGitHubLoading) {
      return
    }
    setIsGitHubLoading(true)
    try {
      await apiUpdateGitHubConfig({
        client_id: values.client_id,
        client_secret: values.client_secret,
        redirect_url: values.redirect_url
      })
      message.success('GitHub配置成功')
      // 重新获取配置状态
      await apiGetGitHubConfigStatus()
    } catch {
      message.error('GitHub配置失败')
    } finally {
      setIsGitHubLoading(false)
    }
  }

  if (initialGitHubLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl ${className}`}>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          配置GitHub OAuth应用，用于用户快捷登录和账号绑定
        </p>
      </div>

      <Form
        form={githubForm}
        onFinish={handleGitHubConfig}
        layout="vertical"
        size="large"
      >
        <div className="space-y-4">
          <Form.Item
            name="client_id"
            label="Client ID"
            rules={[
              { required: true, message: '请输入GitHub OAuth Client ID' }
            ]}
          >
            <Input placeholder="从GitHub OAuth应用获取的Client ID" />
          </Form.Item>

          <Form.Item
            name="client_secret"
            label="Client Secret"
            rules={[
              { required: true, message: '请输入GitHub OAuth Client Secret' }
            ]}
          >
            <Input.Password placeholder="从GitHub OAuth应用获取的Client Secret" />
          </Form.Item>

          <Form.Item
            name="redirect_url"
            label="回调URL"
            rules={[
              { required: true, message: '请输入回调URL' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="例如：http://your-domain.com/login" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isGitHubLoading}
            className="w-full"
            size="large"
          >
            {isGitHubLoading ? '配置中...' : '保存配置'}
          </Button>
        </Form.Item>
      </Form>

      {/* 配置说明 */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              GitHub OAuth 配置说明
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>
                • 在GitHub Settings → Developer settings → OAuth Apps 中创建应用
              </li>
              <li>• Application name: 填写应用名称（如：Alemongo）</li>
              <li>• Homepage URL: 填写你的网站地址</li>
              <li>
                • Authorization callback URL: 填写回调URL（通常是 /login）
              </li>
              <li>• 创建后复制 Client ID 和 Client Secret 到上方表单</li>
              <li>• 配置完成后用户即可使用GitHub账号快捷登录</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubConfig
