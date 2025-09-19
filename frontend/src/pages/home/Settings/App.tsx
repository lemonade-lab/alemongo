import { apiResetTemplate } from '@/api/settings/template'
import { apiGetConfigEmail, apiUpdateEmailConfig } from '@/api/config/email'
import Box from '@/commom/layout/Box'
import { useCommon } from '@/hook/useCommon'
import { SettingOutlined, MailOutlined } from '@ant-design/icons'
import { message, Form, Input, InputNumber, Button, Tabs } from 'antd'
import { useState, useEffect } from 'react'
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'

const { TabPane } = Tabs

/**
 * Chat风格的设置页面
 * @returns
 */
const Settings = () => {
  const [common] = useCommon()
  const [emailForm] = Form.useForm()
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [initialEmailLoading, setInitialEmailLoading] = useState(true)

  const userInfo = useSelector((state: RootState) => state.me.info)

  const tools = [
    {
      name: 'IP',
      data: {
        installed: true,
        version: common.info.location || 'N/A'
      },
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'NodeJS',
      data: common.info.node,
      icon: '🟢',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'NVM',
      data: common.info.nvm,
      icon: '📦',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Git',
      data: common.info.git,
      icon: '📝',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Browser',
      data: common.info.browser,
      icon: '🌍',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  const [loading, setLoading] = useState(false)

  // 获取邮箱配置
  useEffect(() => {
    if (userInfo.username === 'lemonade') {
      apiGetConfigEmail()
      .then(res => {
        emailForm.setFieldsValue({
          provider: res.provider,
          host: res.host,
          port: res.port,
          username: res.username,
          password: res.password,
          from_email: res.from_email
        })
      })
      .catch(() => {
        message.error('获取邮箱配置失败')
      })
      .finally(() => {
        setInitialEmailLoading(false)
      })
    }
    else {
      setInitialEmailLoading(false)
    }
  }, [emailForm, userInfo.username])

  const onResetTemplate = () => {
    if (loading) {
      return
    }
    setLoading(true)
    apiResetTemplate()
      .then(() => {
        message.success('模板重置成功')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // 处理邮箱服务配置
  const handleEmailConfig = async (values: {
    provider: string
    host: string
    port: number
    username: string
    password: string
    from_email: string
  }) => {
    if (isEmailLoading) {
      return
    }
    setIsEmailLoading(true)
    try {
      await apiUpdateEmailConfig({
        provider: values.provider,
        host: values.host,
        port: values.port,
        username: values.username,
        password: values.password,
        from_email: values.from_email
      })
      message.success('邮箱服务配置成功')
    } catch {
      message.error('邮箱服务配置失败')
    } finally {
      setIsEmailLoading(false)
    }
  }

  if (initialEmailLoading) {
    return (
      <Box>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </Box>
    )
  }

  return (
    <Box>
      <div className="p-6 flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 duration-300 flex-1">
        <div className="flex flex-1 flex-col gap-8 items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl duration-300 max-w-4xl mx-auto w-full">
          {/* 头部区域 */}
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                <SettingOutlined className="text-4xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                通用设置
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                系统版本: {common.info.base.version}
              </p>
            </div>
          </div>

          {/* 设置选项卡 */}
          <div className="w-full">
            <Tabs defaultActiveKey="system" size="large">
              {/* 系统信息 */}
              <TabPane
                tab={
                  <div className="flex items-center gap-2">
                    <SettingOutlined />
                    系统信息
                  </div>
                }
                key="system"
              >
                <div className="space-y-6">
                  {/* 工具状态列表 */}
                  <div className="flex flex-col gap-4">
                    {tools.map(
                      tool =>
                        tool.data?.installed && (
                          <div
                            key={tool.name}
                            className="group flex items-center justify-between w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-white/20 dark:border-gray-600/20 hover:shadow-xl duration-300 hover:scale-105"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                              >
                                {tool.icon}
                              </div>
                              <div>
                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                  {tool.name}
                                </span>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  已安装
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold gradient-text">
                                {tool.data.version}
                              </span>
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        )
                    )}
                  </div>

                  {/* 重置模板区域 */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl px-6 py-4 shadow-lg border border-red-200/50 dark:border-red-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                          ⚠️
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                            重置模板
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-400">
                            用于替换旧版本的基础机器人模板
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onResetTemplate}
                        disabled={loading}
                        className="chatgpt-button bg-gradient-to-r from-red-500 to-pink-500 border-none hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 text-white font-semibold rounded-lg duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            重置中...
                          </div>
                        ) : (
                          '重置模板'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </TabPane>

              {/* 邮箱服务配置 */}
              {userInfo.username === 'lemonade' && (
                <TabPane
                  tab={
                    <div className="flex items-center gap-2">
                      <MailOutlined />
                      邮箱服务
                    </div>
                  }
                  key="email"
                >
                  <div className="max-w-2xl">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        邮箱服务配置
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        配置邮件发送服务，用于系统通知和用户邮件
                      </p>
                    </div>

                    <Form
                      form={emailForm}
                      onFinish={handleEmailConfig}
                      layout="vertical"
                      size="large"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                          name="provider"
                          label="邮箱类别"
                          rules={[
                            { required: true, message: '请选择邮箱类别' }
                          ]}
                        >
                          <Input placeholder="例如：qq、gmail、163" />
                        </Form.Item>

                        <Form.Item
                          name="host"
                          label="SMTP服务器"
                          rules={[
                            { required: true, message: '请输入 SMTP 服务器' }
                          ]}
                        >
                          <Input placeholder="例如：smtp.qq.com" />
                        </Form.Item>

                        <Form.Item
                          name="port"
                          label="端口号"
                          rules={[{ required: true, message: '请输入端口号' }]}
                        >
                          <InputNumber
                            placeholder="例如：587"
                            min={1}
                            max={65535}
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          name="username"
                          label="邮箱账号"
                          rules={[
                            { required: true, message: '请输入邮箱账号' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                          ]}
                        >
                          <Input placeholder="例如：example@qq.com" />
                        </Form.Item>

                        <Form.Item
                          name="password"
                          label="授权码"
                          rules={[{ required: true, message: '请输入授权码' }]}
                        >
                          <Input.Password placeholder="请输入邮箱授权码" />
                        </Form.Item>

                        <Form.Item
                          name="from_email"
                          label="来源邮箱"
                          rules={[
                            { required: true, message: '请输入来源邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                          ]}
                        >
                          <Input placeholder="例如：example@qq.com" />
                        </Form.Item>
                      </div>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={isEmailLoading}
                          className="w-full"
                          size="large"
                        >
                          {isEmailLoading ? '配置中...' : '保存配置'}
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
                            配置说明
                          </h4>
                          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            <li>
                              • QQ邮箱：smtp.qq.com，端口587，需要开启SMTP服务
                            </li>
                            <li>
                              • Gmail：smtp.gmail.com，端口587，需要开启两步验证
                            </li>
                            <li>• 163邮箱：smtp.163.com，端口25或465</li>
                            <li>• 授权码不是登录密码，需要在邮箱设置中获取</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPane>
              )}
            </Tabs>
          </div>

          {/* 底部装饰 */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Settings
