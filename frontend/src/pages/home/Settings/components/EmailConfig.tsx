import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Button, message } from 'antd'
import { apiGetConfigEmail, apiUpdateEmailConfig } from '@/api/config/email'
import { usePermission } from '@/hook/usePermission'

interface EmailConfigProps {
  className?: string
}

const EmailConfig: React.FC<EmailConfigProps> = ({ className = '' }) => {
  const [emailForm] = Form.useForm()
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [initialEmailLoading, setInitialEmailLoading] = useState(true)
  const { isSuperAdmin } = usePermission()

  // 缓存isSuperAdmin的结果，避免useEffect无限循环
  const isSuperAdminValue = isSuperAdmin()

  // 获取邮箱配置
  useEffect(() => {
    if (isSuperAdminValue) {
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
    } else {
      setInitialEmailLoading(false)
    }
  }, [emailForm, isSuperAdminValue])

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
      <div className="flex items-center justify-center py-8">
        <div className="rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl ${className}`}>
      <div className="mb-6">
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
            rules={[{ required: true, message: '请选择邮箱类别' }]}
          >
            <Input placeholder="例如：qq、gmail、163" />
          </Form.Item>

          <Form.Item
            name="host"
            label="SMTP服务器"
            rules={[{ required: true, message: '请输入 SMTP 服务器' }]}
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
              <li>• QQ邮箱：smtp.qq.com，端口587，需要开启SMTP服务</li>
              <li>• Gmail：smtp.gmail.com，端口587，需要开启两步验证</li>
              <li>• 163邮箱：smtp.163.com，端口25或465</li>
              <li>• 授权码不是登录密码，需要在邮箱设置中获取</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailConfig
