import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiLogin, apiGetGitHubAuthURL, apiGitHubLogin } from '@/api'
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

  // GitHub 登录
  const handleGitHubLogin = async () => {
    try {
      const authURL = await apiGetGitHubAuthURL('login')
      window.location.href = authURL
    } catch {
      message.error('获取 GitHub 授权链接失败')
    }
  }

  // 处理 GitHub 回调
  const handleGitHubCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state === 'login') {
      try {
        const token = await apiGitHubLogin({ code, state })
        dispatch(setToken(token))
        navigate('/')
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'GitHub 登录失败'
        message.error(errorMessage)
      }
    } else if (code && state === 'bind') {
      // 绑定状态，通过postMessage通知父页面
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GITHUB_AUTH_SUCCESS',
            code,
            state
          },
          window.location.origin
        )
        window.close()
      } else {
        // 如果不是弹窗，显示错误信息
        message.error('绑定操作需要在弹窗中完成')
      }
    }
  }, [dispatch, navigate])

  // 组件挂载时检查是否有 GitHub 回调
  React.useEffect(() => {
    handleGitHubCallback()
  }, [handleGitHubCallback])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-zinc-900 dark:via-gray-800 dark:to-black">
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      {/* 登录卡片 */}
      <div className="relative z-10 animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-96 max-w-md mx-4 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                className="h-12 w-auto mr-3"
                src="https://alemonjs.com/img/alemon.png"
                alt="Alemongo"
              />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">欢迎登录</h2>
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              阿柠檬服务端平台
            </p>
          </div>

          {/* 登录表单 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-200 dark:text-gray-300"
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
                  className="w-full px-4 py-3 pl-10 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
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
                  className="block text-sm font-medium text-gray-200 dark:text-gray-300"
                >
                  密码
                </label>
                <button
                  type="button"
                  onClick={handleForgetPassword}
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
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
                  className="w-full px-4 py-3 pl-10 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
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
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
            >
              登录
            </button>
          </form>

          {/* 分割线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">或</span>
            </div>
          </div>

          {/* GitHub 登录按钮 */}
          <button
            type="button"
            onClick={handleGitHubLogin}
            className="w-full py-3 px-4 text-lg font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg hover:shadow-gray-500/25 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>使用 GitHub 登录</span>
          </button>

          {/* 底部版权信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 select-none">
              &copy; {new Date().getFullYear()} Lemonade Robot Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
