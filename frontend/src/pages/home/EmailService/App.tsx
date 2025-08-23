import { Form, Input, InputNumber, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiGetConfigEmail, apiUpdateEmailConfig } from '@/api/config/email'
import Box from '@/commom/layout/Box'

/**
 * Chat风格的邮箱服务配置页面
 * @returns
 */
const EmailService = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // 获取邮箱配置
  useEffect(() => {
    apiGetConfigEmail()
      .then(res => {
        form.setFieldsValue({
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
        setInitialLoading(false)
      })
  }, [form])

  const handleSubmit = (values: {
    provider: string
    host: string
    port: number
    username: string
    password: string
    from_email: string
  }) => {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    apiUpdateEmailConfig({
      provider: values.provider,
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
      from_email: values.from_email
    })
      .then(() => {
        message.success('邮箱服务配置成功')
        navigate('/bots')
      })
      .catch(() => {
        message.error('邮箱服务配置失败')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  if (initialLoading) {
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
      <div className="p-6 flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 duration-300 flex-1 min-h-screen">
        <div className="flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl duration-300 max-w-2xl mx-auto w-full">
          {/* 头部区域 */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">邮箱服务配置</h1>
            <p className="text-gray-600 dark:text-gray-400">
              配置邮件发送服务，用于系统通知和用户邮件
            </p>
          </div>

          {/* 表单区域 */}
          <Form
            form={form}
            onFinish={handleSubmit}
            className="w-full space-y-6"
            layout="vertical"
            size="large"
          >
            {/* 邮箱类别 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱类别
              </label>
              <Form.Item
                name="provider"
                rules={[{ required: true, message: '请选择邮箱类别' }]}
                className="mb-0"
              >
                <Input
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="例如：qq、gmail、163"
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* SMTP服务器 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP服务器
              </label>
              <Form.Item
                name="host"
                rules={[{ required: true, message: '请输入 SMTP 服务器' }]}
                className="mb-0"
              >
                <Input
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="例如：smtp.qq.com"
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* 端口 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                端口号
              </label>
              <Form.Item
                name="port"
                rules={[{ required: true, message: '请输入端口号' }]}
                className="mb-0"
              >
                <InputNumber
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="例如：587"
                  min={1}
                  max={65535}
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* 邮箱账号 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱账号
              </label>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入邮箱账号' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                className="mb-0"
              >
                <Input
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="例如：example@qq.com"
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* 授权码 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                授权码
              </label>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入授权码' }]}
                className="mb-0"
              >
                <Input.Password
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="请输入邮箱授权码"
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* 来源邮箱 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                来源邮箱
              </label>
              <Form.Item
                name="from_email"
                rules={[
                  { required: true, message: '请输入来源邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                className="mb-0"
              >
                <Input
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="例如：example@qq.com"
                  prefix={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
              </Form.Item>
            </div>

            {/* 提交按钮 */}
            <Form.Item className="mb-0">
              <button
                type="submit"
                disabled={isLoading}
                className="chatgpt-button w-full py-3 text-base font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '配置中...' : '保存配置'}
              </button>
            </Form.Item>
          </Form>

          {/* 配置说明 */}
          <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
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
                  <li>• QQ邮箱：smtp.qq.com，端口587，需要开启SMTP服务</li>
                  <li>• Gmail：smtp.gmail.com，端口587，需要开启两步验证</li>
                  <li>• 163邮箱：smtp.163.com，端口25或465</li>
                  <li>• 授权码不是登录密码，需要在邮箱设置中获取</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default EmailService
