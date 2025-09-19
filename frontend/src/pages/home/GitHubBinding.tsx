import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  message,
  Modal,
  Form,
  Input,
  Avatar,
  Typography
} from 'antd'
import {
  GithubOutlined,
  LinkOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import {
  apiGetGitHubAuthURL,
  apiBindGitHubAccount,
  apiUnbindGitHubAccount,
  apiInfo
} from '@/api'

const { Title, Text } = Typography

interface UserInfo {
  username: string
  github_id?: number
  github_username?: string
  github_avatar?: string
  is_github_bound?: boolean
}

const GitHubBinding: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [bindModalVisible, setBindModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const info = await apiInfo()
      setUserInfo(info)
    } catch {
      message.error('获取用户信息失败')
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [])

  // 处理 GitHub 绑定
  const handleBindGitHub = async () => {
    try {
      const authURL = await apiGetGitHubAuthURL('bind')

      // 打开弹窗进行 GitHub 授权
      const popup = window.open(
        authURL,
        'github-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        message.error('无法打开授权窗口，请检查浏览器弹窗设置')
        return
      }

      // 监听弹窗消息
      const messageHandler = (event: MessageEvent) => {
        // 验证消息来源
        if (event.origin !== window.location.origin) {
          return
        }

        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          const { code } = event.data
          popup.close()
          window.removeEventListener('message', messageHandler)
          handleBindWithCode(code)
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          const { error } = event.data
          popup.close()
          window.removeEventListener('message', messageHandler)
          message.error(error || 'GitHub 授权失败')
        }
      }

      window.addEventListener('message', messageHandler)

      // 监听弹窗关闭
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
        }
      }, 1000)
    } catch {
      message.error('获取 GitHub 授权链接失败')
    }
  }

  // 使用授权码绑定
  const handleBindWithCode = async (code: string) => {
    await apiBindGitHubAccount({ code })
    message.success('GitHub 账号绑定成功')
    setBindModalVisible(false)
    form.resetFields()
    fetchUserInfo()
  }

  // 解绑 GitHub
  const handleUnbindGitHub = () => {
    Modal.confirm({
      title: '确认解绑',
      content: '确定要解绑 GitHub 账号吗？解绑后无法使用 GitHub 快捷登录。',
      onOk: async () => {
        try {
          await apiUnbindGitHubAccount()
          message.success('GitHub 账号解绑成功')
          fetchUserInfo()
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '解绑失败'
          message.error(errorMessage)
        }
      }
    })
  }

  // 显示绑定模态框
  const showBindModal = () => {
    setBindModalVisible(true)
  }

  return (
    <Card title="GitHub 账号绑定" className="mb-6">
      <div className="space-y-4">
        {userInfo?.is_github_bound ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <Avatar
                src={userInfo.github_avatar}
                icon={<GithubOutlined />}
                size={48}
              />
              <div>
                <Title level={5} className="mb-1">
                  {userInfo.github_username}
                </Title>
                <Text type="secondary">GitHub ID: {userInfo.github_id}</Text>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<DisconnectOutlined />}
              onClick={handleUnbindGitHub}
            >
              解绑
            </Button>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <GithubOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={4} className="mb-2">
              未绑定 GitHub 账号
            </Title>
            <Text type="secondary" className="mb-4 block">
              绑定 GitHub 账号后，您可以使用 GitHub 快捷登录
            </Text>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={showBindModal}
              size="large"
            >
              绑定 GitHub 账号
            </Button>
          </div>
        )}
      </div>

      {/* 绑定模态框 */}
      <Modal
        title="绑定 GitHub 账号"
        open={bindModalVisible}
        onCancel={() => {
          setBindModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async values => {
            // 如果有授权码，直接绑定；否则跳转到GitHub授权
            if (values.code) {
              await handleBindWithCode(values.code)
            } else {
              handleBindGitHub()
            }
          }}
        >
          <Form.Item name="code" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <div className="text-center space-y-3">
            <Text type="secondary" className="text-sm">
              {form.getFieldValue('code')
                ? '检测到GitHub授权码，请确认绑定'
                : '点击确认后将跳转到 GitHub 进行授权'}
            </Text>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setBindModalVisible(false)
                  form.resetFields()
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" className="flex-1">
                {form.getFieldValue('code') ? '确认绑定' : '跳转授权'}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </Card>
  )
}

export default GitHubBinding
