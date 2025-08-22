import { useDispatch } from 'react-redux'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiLogin } from '@/api'
import { setToken } from '@/redux/me'
import './index.css'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> & {
      target: HTMLFormElement
    }
  ) => {
    e.preventDefault()
    if (!e.target) {
      message.error('请填写密码')
      return
    }
    const password = e.target.password.value
    const username = e.target.username.value
    apiLogin({
      password,
      username
    }).then(data => {
      dispatch(setToken(data))
      navigate('/')
    })
  }

  // 忘记密码
  const handleForgetPassword = () => {
    message.warning('请联系超级管理员或编辑服务配置文件')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden  duration-300">
      {/* 登录卡片 */}
      <div className="relative z-10 animate-fade-in-up">
        <div className="chatgpt-card p-8 w-96 max-w-md mx-4 shadow-2xl animate-float">
          {/* 头部 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">欢迎登录</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              阿柠檬服务端平台
            </p>
          </div>

          {/* 登录表单 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                用户名
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  id="username"
                  autoComplete="username"
                  required
                  className="chatgpt-input pl-8 w-full px-4 py-3 text-base"
                  placeholder="请输入用户名"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                </div>
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  密码
                </label>
                <button
                  type="button"
                  onClick={handleForgetPassword}
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  className="chatgpt-input  pl-8  w-full px-4 py-3 text-base"
                  placeholder="请输入密码"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              className="chatgpt-button w-full py-3 text-lg font-semibold shadow-lg"
            >
              登录
            </button>
          </form>

          {/* 底部版权信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 select-none">
              &copy; {new Date().getFullYear()} Lemonade Robot Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
