import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import { FloatButton, Drawer, Badge } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '@/hook/useTheme'
import NotificationDrawer from '@/components/NotificationDrawer'
import { fetchUnreadCount } from '@/api'
import { createAuthedWS } from '@/api/ws'

const FloatButtons = () => {
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 初始一次
    fetchUnreadCount()
      .then(r => setUnread(r.unread))
      .catch(() => {})
    let heartbeatId: number | null = null
    const connect = () => {
      const ws = createAuthedWS('/notifications/ws')
      wsRef.current = ws
      ws.onopen = () => {
        const ping = () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }
        heartbeatId = window.setInterval(ping, 25000)
      }
      ws.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data)
          switch (data.type) {
            case 'unread':
              if (typeof data.unread === 'number') setUnread(data.unread)
              break
            case 'new':
              setUnread(u => u + 1)
              setRefreshSignal(s => s + 1)
              break
            case 'read':
            case 'delete':
              setRefreshSignal(s => s + 1)
              break
            case 'read_all':
              setRefreshSignal(s => s + 1)
              break
            default:
              break
          }
        } catch {
          // 忽略 JSON 解析错误
        }
      }
      ws.onclose = () => {
        if (heartbeatId !== null) {
          window.clearInterval(heartbeatId)
          heartbeatId = null
        }
        setTimeout(() => {
          if (wsRef.current === ws) connect()
        }, 3000)
      }
      ws.onerror = () => {
        ws.close()
      }
    }
    connect()
    return () => {
      if (heartbeatId !== null) window.clearInterval(heartbeatId)
      wsRef.current?.close()
    }
  }, [])

  return (
    <>
      {/* 个人中心按钮 */}
      <FloatButton
        icon={<UserOutlined />}
        tooltip="个人中心"
        type="primary"
        style={{ insetInlineEnd: 9, bottom: 9 * 14 }}
        onClick={() => navigate('/profile')}
      />

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
          icon={
            <Badge
              count={unread}
              size="small"
              overflowCount={99}
              offset={[0, 4]}
            >
              <BellOutlined />
            </Badge>
          }
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
            <span className=" font-semibold text-sm">重要通知</span>
          </div>
        }
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => setOpen(false)}
        open={open}
        placement="left"
        className="dark:[&>.ant-drawer-content]:bg-zinc-900/95 dark:[&>.ant-drawer-header]:bg-zinc-900/95 backdrop-blur-xl"
        width="80%"
      >
        <NotificationDrawer
          open={open}
          onClose={() => setOpen(false)}
          refreshSignal={refreshSignal}
        />
      </Drawer>
    </>
  )
}

export default FloatButtons
