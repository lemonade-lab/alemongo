import {
  ControlOutlined,
  SettingOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ReloadOutlined,
  StopOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  BookOutlined
} from '@ant-design/icons'
import { FloatButton } from 'antd'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useBot from '@/hook/useBot'
import classNames from 'classnames'

const FloatButtons = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [bot] = useBot()
  const info = bot.info

  // 判断是否是显示 在线日志
  const isOnlineLog = useMemo(() => {
    // 不是日志页面 或者 当前是日志页面
    return !location.pathname.includes('logs')
  }, [location.pathname])

  const onLog = useCallback(() => {
    if (isOnlineLog) {
      navigate(`/bots/${info.name}/logs`)
    } else {
      navigate(`/bots/${info.name}/xterm-date`)
    }
  }, [info.name, isOnlineLog, navigate])

  const items = useMemo(() => {
    const i: {
      key: string
      icon: React.ReactNode
      onClick: () => void
      tip: string
    }[] = [
      {
        key: '2',
        icon: <SettingOutlined />,
        onClick: () => {
          navigate(`/bots/${info.name}/config`)
        },
        tip: '配置'
      },
      {
        key: '1',
        icon: <BookOutlined />,
        onClick: () => {
          navigate(`/bots/${info.name}/package`)
        },
        tip: '包管理'
      },
      {
        key: '3',
        icon: <AppstoreOutlined />,
        onClick: () => {
          navigate(`/bots/${info.name}/packages`)
        },
        tip: '应用'
      },
      {
        key: '4',
        icon: <EnvironmentOutlined />,
        onClick: () => {
          navigate(`/bots/${info.name}/env`)
        },
        tip: '环境'
      },
      {
        key: '1',
        icon: (
          <div
            className={classNames({
              'text-lime-500': isOnlineLog,
              'text-gray-500': !isOnlineLog
            })}
          >
            <FileTextOutlined />
          </div>
        ),
        onClick: onLog,
        tip: isOnlineLog ? '在线日志' : '查询日志'
      },
      {
        key: '5',
        icon: (
          <div className="text-yellow-500">
            <ReloadOutlined />
          </div>
        ),
        onClick: () => {
          bot.onInstall(info.name)
        },
        tip: '重载'
      }
    ]

    if (info.node_modules && info.status) {
      i.push({
        key: '6',
        icon: (
          <div className="text-red-500">
            <StopOutlined />
          </div>
        ),
        onClick: () => {
          bot.onStop(info.name)
        },
        tip: '停止'
      })
    }

    if (info.node_modules && !info.status) {
      i.push({
        key: '7',
        icon: (
          <div className="text-green-500">
            <PlayCircleOutlined />
          </div>
        ),
        onClick: () => {
          // 运行机器人
          bot.onRun(info.name)
        },
        tip: '运行'
      })
    }

    if (!info.node_modules) {
      i.push({
        key: '8',
        icon: <DownloadOutlined />,
        onClick: () => {
          // 加载依赖
          bot.onInstall(info.name)
        },
        tip: '加载'
      })
    }

    return i
  }, [
    onLog,
    isOnlineLog,
    info.node_modules,
    info.status,
    info.name,
    navigate,
    bot
  ])

  return (
    <div className="sm:hidden">
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<ControlOutlined />}
        style={{ insetInlineEnd: 9, bottom: 9 * 19 }}
      >
        {items.map(item => {
          return (
            <FloatButton
              key={item.key}
              icon={item.icon}
              onClick={item.onClick}
              tooltip={item.tip}
            />
          )
        })}
      </FloatButton.Group>
    </div>
  )
}

export default FloatButtons
