import { Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiPassword } from '../../../api'
import Box from '@/commom/layout/Box'

/**
 * Chat风格的密码修改页面
 * @returns
 */
const UpdatePassWord = () => {
  const navigate = useNavigate()

  const handleSubmit = (values: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次密码不一致')
      return
    }
    apiPassword({
      old_password: values.oldPassword,
      password: values.newPassword
    }).then(() => {
      navigate('/bots')
    })
  }

  return (
    <Box>
      <div className="p-6 flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300 flex-1 min-h-screen">
        <div className="flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl  duration-300 max-w-md mx-auto w-full">
          {/* 头部区域 */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg mx-auto">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">修改密码</h1>
            <p className="text-gray-600 dark:text-gray-400">
              为了账户安全，请设置强密码
            </p>
          </div>

          {/* 表单区域 */}
          <Form
            onFinish={handleSubmit}
            className="w-full space-y-6"
            layout="vertical"
            size="large"
          >
            {/* 旧密码 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                当前密码
              </label>
              <Form.Item
                name="oldPassword"
                rules={[{ required: true, message: '请输入当前密码' }]}
                className="mb-0"
              >
                <Input.Password
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="请输入当前密码"
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

            {/* 新密码 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                新密码
              </label>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
                className="mb-0"
              >
                <Input.Password
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="请输入新密码"
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

            {/* 确认密码 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                确认新密码
              </label>
              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
                className="mb-0"
              >
                <Input.Password
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="请再次输入新密码"
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

            {/* 提交按钮 */}
            <Form.Item className="mb-0">
              <button
                type="submit"
                className="chatgpt-button w-full py-3 text-base font-semibold shadow-lg"
              >
                确认修改
              </button>
            </Form.Item>
          </Form>

          {/* 密码强度提示 */}
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
                  密码安全提示
                </h4>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• 密码长度至少6位</li>
                  <li>• 建议包含字母、数字和特殊字符</li>
                  <li>• 避免使用常见密码</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default UpdatePassWord
