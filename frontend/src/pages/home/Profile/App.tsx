import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  message,
  Modal,
  Form,
  Input,
  Avatar,
  Typography,
  Tabs
} from 'antd'
import {
  GithubOutlined,
  LinkOutlined,
  DisconnectOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  apiGetGitHubAuthURL,
  apiBindGitHubAccount,
  apiUnbindGitHubAccount,
  apiPassword,
  apiBindEmail,
  apiVerifyEmail,
  apiLogout
} from '@/api'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux'
import { clearUserState } from '@/redux/me'
import { useNavigate } from 'react-router-dom'
import { useUserInfoControl } from '@/hook/useUserInfoControl'
import { usePermission } from '@/hook/usePermission'
import UserIdentityBadge from '@/components/UserIdentityBadge'
import { Box } from '@/commom'

const { Title, Text } = Typography
const { TabPane } = Tabs

const Profile: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.me.info)
  const [updateUserInfo] = useUserInfoControl()
  const [passwordForm] = Form.useForm()
  const [emailForm] = Form.useForm()
  const [emailCount, setEmailCount] = useState(0)
  const storeMe = useSelector((state: RootState) => state.me)
  const { isSuperAdmin } = usePermission()
  const dispatch = useDispatch()

  // 邮箱验证码倒计时
  useEffect(() => {
    if (emailCount > 0) {
      const timer = setTimeout(() => {
        setEmailCount(prevCount => {
          if (prevCount <= 1) {
            return 0
          }
          return prevCount - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [emailCount])

  useEffect(() => {
    // 每次进来，确保获得的是最新的用户信息
    updateUserInfo.updateUserInfo()
  }, [])

  // 处理密码修改
  const handlePasswordChange = async (values: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次密码不一致')
      return
    }
    try {
      await apiPassword({
        old_password: values.oldPassword,
        password: values.newPassword
      })
      message.success('密码修改成功')
      passwordForm.resetFields()
      // 修改密码后，更新一次用户信息
      updateUserInfo.updateUserInfo()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '密码修改失败'
      message.error(errorMessage)
    }
  }

  // 处理邮箱绑定
  const handleEmailBind = async (values: { email: string; code: string }) => {
    try {
      await apiVerifyEmail(values)
      message.success('邮箱绑定成功')
      emailForm.resetFields()
      updateUserInfo.updateUserInfo()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '邮箱绑定失败'
      message.error(errorMessage)
    }
  }

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    const email = emailForm.getFieldValue('email')
    if (!email) {
      message.error('请输入邮箱地址')
      return
    }
    if (emailCount > 0) {
      message.error(`请等待 ${emailCount} 秒后再发送`)
      return
    }
    try {
      setEmailCount(30)
      await apiBindEmail({ email })
      message.success('验证码已发送，请注意查收')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '发送验证码失败'
      message.error(errorMessage)
    }
  }

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
    updateUserInfo.updateUserInfo()
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
          updateUserInfo.updateUserInfo()
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '解绑失败'
          message.error(errorMessage)
        }
      }
    })
  }

  const navigate = useNavigate()

  const goLogout = () => {
    apiLogout().then(() => {
      // 清除Redux状态
      dispatch(clearUserState())
      navigate('/login')
    })
  }

  return (
    <Box className="gap-6">
      {/* 头部信息 */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              size={64}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
              icon={<UserOutlined />}
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Title level={3} className="mb-0">
                  {userInfo?.username || '用户'}
                </Title>
                <UserIdentityBadge size="small" />
              </div>
              <Text type="secondary">管理您的个人设置和安全选项</Text>
            </div>
          </div>
          <div className="flex items-end">
            <Button type="primary" danger onClick={goLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </Card>

      {/* 设置选项卡 */}

      <Box rootClassName="p-[0!important]">
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <Tabs defaultActiveKey="password" size="large">
            {/* 密码设置 */}
            <TabPane
              tab={
                <div className="flex items-center gap-2">
                  <LockOutlined />
                  密码设置
                </div>
              }
              key="password"
            >
              <div className="max-w-md">
                <Title level={4} className="mb-4">
                  修改密码
                </Title>
                <Form
                  form={passwordForm}
                  onFinish={handlePasswordChange}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="oldPassword"
                    label="当前密码"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password placeholder="请输入当前密码" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码长度至少6位' }
                    ]}
                  >
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    rules={[
                      { required: true, message: '请再次输入新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue('newPassword') === value
                          ) {
                            return Promise.resolve()
                          }
                          return Promise.reject(
                            new Error('两次输入的密码不一致')
                          )
                        }
                      })
                    ]}
                  >
                    <Input.Password placeholder="请再次输入新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full">
                      确认修改
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </TabPane>

            {/* 邮箱设置 */}
            <TabPane
              tab={
                <div className="flex items-center gap-2">
                  <MailOutlined />
                  邮箱设置
                </div>
              }
              key="email"
            >
              <div className="max-w-md">
                <Title level={4} className="mb-4">
                  绑定邮箱
                </Title>

                {/* 当前邮箱状态 */}
                {storeMe.info.email && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text strong>当前邮箱：</Text>
                        <Text>{storeMe.info.email}</Text>
                      </div>
                      {storeMe.info.is_email_verified ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                          已验证
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                          未验证
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Form
                  form={emailForm}
                  onFinish={handleEmailBind}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    label="邮箱地址"
                    rules={[
                      { required: true, message: '请输入邮箱地址' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input placeholder="请输入邮箱地址" />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    label="验证码"
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <div className="flex gap-2">
                      <Input placeholder="请输入验证码" className="flex-1" />
                      <Button
                        onClick={handleSendEmailCode}
                        disabled={emailCount > 0}
                      >
                        {emailCount > 0 ? `${emailCount}s` : '发送验证码'}
                      </Button>
                    </div>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full">
                      确认绑定
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </TabPane>

            {/* GitHub 设置 */}
            {!(
              isSuperAdmin() && userInfo?.extra_info?.is_temporary_super_admin
            ) && (
              <TabPane
                tab={
                  <div className="flex items-center gap-2">
                    <GithubOutlined />
                    GitHub 设置
                  </div>
                }
                key="github"
              >
                <div className="max-w-md">
                  <Title level={4} className="mb-4">
                    GitHub 账号绑定
                  </Title>

                  {userInfo?.is_github_bound ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
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
                            <Text type="secondary">
                              GitHub ID: {userInfo.github_id}
                            </Text>
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
                        onClick={handleBindGitHub}
                        size="large"
                      >
                        绑定 GitHub 账号
                      </Button>
                    </div>
                  )}
                </div>
              </TabPane>
            )}
          </Tabs>
        </Card>
      </Box>
    </Box>
  )
}

export default Profile
