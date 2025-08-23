import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  MailOutlined,
  LockOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import { FloatButton, Drawer } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import useTheme from '@/hook/useTheme'
import { apiLogout } from '@/api'

const FloatButtons = () => {
  const navigate = useNavigate()
  const storeMe = useSelector((state: RootState) => state.me.info)
  const { dark, setDark } = useTheme()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const goLogout = () => {
    apiLogout().then(() => {
      navigate('/login')
    })
  }

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 9, bottom: 9 * 14 }}
        icon={<UserOutlined />}
        open={userMenuOpen}
        onOpenChange={setUserMenuOpen}
      >
        {/* 更改密码 */}
        <FloatButton
          icon={<LockOutlined />}
          tooltip="更改密码"
          onClick={() => {
            navigate('/update-password')
            setUserMenuOpen(false)
          }}
        />

        {/* 更改邮箱 */}
        <FloatButton
          icon={<MailOutlined />}
          tooltip="更改邮箱"
          onClick={() => {
            navigate('/update-email')
            setUserMenuOpen(false)
          }}
        />

        {/* 邮箱服务 - 仅管理员可见 */}
        {storeMe.identity === 'admin' && (
          <FloatButton
            icon={<MailOutlined />}
            tooltip="邮箱服务"
            onClick={() => {
              navigate('/email-service')
              setUserMenuOpen(false)
            }}
          />
        )}

        {/* 退出账户 */}
        <FloatButton
          icon={<LogoutOutlined />}
          tooltip="退出账户"
          onClick={() => {
            goLogout()
            setUserMenuOpen(false)
          }}
        />
      </FloatButton.Group>

      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 9, bottom: 9 * 9 }}
        icon={<AppstoreOutlined />}
        placement="left"
      >
        {/* 主题切换按钮 */}
        <FloatButton
          icon={
            <div className="w-4 h-4 flex items-center justify-center">
              {dark ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          }
          // tooltip="主题切换"
          onClick={() => setDark(!dark)}
        />

        {/* 通知按钮 */}
        <FloatButton
          icon={<BellOutlined />}
          // tooltip="通知"
          onClick={() => setOpen(true)}
        />

        {/* 设置按钮 */}
        <FloatButton
          icon={<SettingOutlined />}
          // tooltip="设置"
          onClick={() => navigate('/settings')}
        />
      </FloatButton.Group>

      {/* 通知抽屉 */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="gradient-text font-semibold text-sm">
              重要通知
            </span>
          </div>
        }
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => setOpen(false)}
        open={open}
        placement="left"
        className="dark:[&>.ant-drawer-content]:bg-zinc-900/95 dark:[&>.ant-drawer-header]:bg-zinc-900/95 backdrop-blur-xl"
        width="80%"
      >
        <div className="mb-4">
          <div
            className="flex items-center bg-gradient-to-r from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/30 dark:to-orange-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg backdrop-blur-sm"
            role="alert"
          >
            <svg
              className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01"
              ></path>
            </svg>
            <span className="font-medium text-sm">系统通知：</span>
            <span className="ml-2 text-sm">待更新</span>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default FloatButtons
