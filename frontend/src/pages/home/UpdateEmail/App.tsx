import { Button, Input, message } from 'antd'
import Box from '@/commom/Box'
import { apiBindEmail, apiVerifyEmail } from '@/api'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

/**
 * Chat风格的邮箱绑定页面
 * @returns
 */
const UpdateEmail = () => {
  const storeMe = useSelector((state: RootState) => state.me)
  const [values, setValues] = useState({ email: '', code: '' })

  // 验证码 30s禁止点击
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            return 0
          }
          return prevCount - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [count])

  const handleSubmit = (values: { email: string; code: string }) => {
    if (!values.email) {
      message.error('请输入邮箱地址')
      return
    }
    if (!values.code) {
      message.error('请输入验证码')
      return
    }
    apiVerifyEmail(values)
  }

  const onSendCode = () => {
    if (!values.email) {
      message.error('请输入邮箱地址')
      return
    }
    if (count > 0) {
      message.error(`请等待 ${count} 秒后再发送`)
      return
    }
    // 开始倒计时
    setCount(30)
    apiBindEmail({
      email: values.email
    }).then(() => {
      message.success('验证码已发送，请注意查收')
    })
  }

  return (
    <Box>
      <div className="p-6 flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300 flex-1 min-h-screen">
        <div className="flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl  duration-300 max-w-md mx-auto w-full">
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
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">绑定邮箱</h1>
            <p className="text-gray-600 dark:text-gray-400">
              绑定邮箱以接收重要通知
            </p>
          </div>

          {/* 当前邮箱状态 */}
          {storeMe.info.email && (
            <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-blue-500"
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
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  当前邮箱
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">
                  {storeMe.info.email}
                </span>
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

          {/* 表单区域 */}
          <form
            className="w-full space-y-6"
            onSubmit={e => {
              e.preventDefault()
              handleSubmit({
                email: (e.target as HTMLFormElement).email.value,
                code: (e.target as HTMLFormElement).newPassword.value
              })
            }}
          >
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱地址
              </label>
              <div className="relative">
                <Input
                  name="email"
                  value={values.email}
                  onChange={e =>
                    setValues({ ...values, email: e.target.value })
                  }
                  className="chatgpt-input w-full px-4 py-3"
                  placeholder="请输入邮箱地址"
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
              </div>
            </div>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input.Password
                    name="newPassword"
                    value={values.code}
                    onChange={e =>
                      setValues({ ...values, code: e.target.value })
                    }
                    className="chatgpt-input w-full px-4 py-3"
                    placeholder="请输入验证码"
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
                </div>
                <Button
                  onClick={onSendCode}
                  disabled={count > 0}
                  className="chatgpt-button bg-gradient-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
                >
                  {count > 0 ? `${count}s` : '发送验证码'}
                </Button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="chatgpt-button w-full py-3 text-base font-semibold shadow-lg"
            >
              确认绑定
            </button>
          </form>

          {/* 底部提示 */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              验证码将发送到您提供的邮箱地址
            </p>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default UpdateEmail
