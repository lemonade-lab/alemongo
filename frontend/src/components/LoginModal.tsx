import React, { useCallback, useEffect, useState } from 'react'
import { Modal, message } from 'antd'
import { useDispatch } from 'react-redux'
import { apiLogin, apiGetGitHubAuthURL, apiGitHubLogin, apiGetGeneralConfig, apiInfo } from '@/api'
import { setLoggedIn, setUserInfo } from '@/redux/me'
import {
  onSessionExpired,
  resetSessionExpired
} from '@/utils/authEvent'

const LoginModal: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const dispatch = useDispatch()

  // 监听会话过期事件
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setOpen(true)
    })
    return unsubscribe
  }, [])

  // 打开弹窗时加载 GitHub 登录配置
  useEffect(() => {
    if (!open) return
    apiGetGeneralConfig()
      .then(res => setShowGitHub(res.github?.login_enabled ?? false))
      .catch(() => setShowGitHub(false))
  }, [open])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement> & { target: HTMLFormElement }) => {
      e.preventDefault()
      const username = e.target.username.value
      const password = e.target.password.value
      if (!username || !password) {
        message.error('请填写用户名和密码')
        return
      }
      setLoading(true)
      apiLogin({ username, password })
        .then(async () => {
          dispatch(setLoggedIn())
          resetSessionExpired()
          try {
            const info = await apiInfo()
            dispatch(setUserInfo(info))
          } catch {
            // 忽略获取用户信息失败
          }
          setOpen(false)
          message.success('登录成功')
        })
        .catch(() => {
          // apiLogin 内部已有错误提示
        })
        .finally(() => setLoading(false))
    },
    [dispatch]
  )

  const handleGitHubLogin = async () => {
    try {
      const authURL = await apiGetGitHubAuthURL('login')
      window.location.href = authURL
    } catch {
      message.error('获取 GitHub 授权链接失败')
    }
  }

  // 监听 GitHub 回调（同页面 postMessage）
  useEffect(() => {
    if (!open) return
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const { code, state } = event.data
        if (code && state === 'login') {
          try {
            await apiGitHubLogin({ code, state })
            dispatch(setLoggedIn())
            resetSessionExpired()
            try {
              const info = await apiInfo()
              dispatch(setUserInfo(info))
            } catch {
              // 忽略获取用户信息失败
            }
            setOpen(false)
            message.success('登录成功')
          } catch {
            message.error('GitHub 登录失败')
          }
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [open, dispatch])

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={420}
      styles={{
        body: {
          padding: 0
        },
        root: {
          background:
            'linear-gradient(135deg, rgb(17 24 39) 0%, rgb(31 41 55) 50%, rgb(0 0 0) 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.15)',
          padding: 32
        },
        mask: {
          backdropFilter: 'blur(6px)'
        }
      }}
    >
      {/* 头部 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <img className="h-32 w-auto mr-2" src="/me.png" alt="Alemongo" />
        </div>
        <p className="text-gray-400 text-sm">请重新登录以继续操作</p>
      </div>

      {/* 登录表单 */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* 用户名 */}
        <div className="space-y-1.5">
          <label
            htmlFor="modal-username"
            className="block text-sm font-medium text-gray-300"
          >
            用户名
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              id="modal-username"
              autoComplete="username"
              required
              className="w-full px-4 py-2.5 pl-10 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              placeholder="请输入用户名"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
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

        {/* 密码 */}
        <div className="space-y-1.5">
          <label
            htmlFor="modal-password"
            className="block text-sm font-medium text-gray-300"
          >
            密码
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              id="modal-password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 pl-10 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              placeholder="请输入密码"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
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
          disabled={loading}
          className="w-full py-2.5 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-200"
        >
          {loading ? '登录中...' : '重新登录'}
        </button>
      </form>

      {/* GitHub 登录 */}
      {showGitHub && (
        <>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400" style={{ background: 'rgb(24 32 47)' }}>或</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGitHubLogin}
            className="w-full py-2.5 px-4 text-base font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg hover:shadow-gray-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>使用 GitHub 登录</span>
          </button>
        </>
      )}
    </Modal>
  )
}

export default LoginModal
