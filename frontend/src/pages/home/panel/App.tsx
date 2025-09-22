import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button, Tooltip } from 'antd'
import Tags from '@/components/Tags'
import useBot from '@/hook/useBot'
import { useCallback, useMemo } from 'react'
import FloatButtons from './FloatButtons'

const Panel = () => {
  const [bot] = useBot()
  const info = bot.info
  const navigate = useNavigate()
  const location = useLocation()

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
  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
        {/* 头部工具栏 */}
        <div className="flex flex-col lg:flex-row  gap-2 sm:gap-4 justify-between px-4 sm:px-6 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20">
          {/* Bot 信息区域 */}
          <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
            {/* 机器人名称 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Name:
                </span>
                <Tags type="purple">{info.name}</Tags>
              </div>
            </div>

            {/* 运行状态 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
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
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Status:
                </span>
                {info.status ? (
                  <Tags type="green">运行中</Tags>
                ) : (
                  <Tags type="yellow">已停止</Tags>
                )}
              </div>
            </div>

            {/* 依赖状态 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Modules:
                </span>
                {info.node_modules ? (
                  <Tags type="green">已安装</Tags>
                ) : (
                  <Tags type="red">未安装</Tags>
                )}
              </div>
            </div>

            {/* 端口信息 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-700/50">
                <svg
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8"
                  />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Port:
                </span>
                <Tags type="indigo">{info.port}</Tags>
              </div>
            </div>
          </div>

          {/* 桌面端操作按钮 */}
          <div className="hidden sm:flex">
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center  justify-end">
              {/* 导航按钮组 */}
              <div className="flex gap-1 sm:gap-2">
                <Button
                  type="text"
                  size="small"
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  onClick={() => navigate(`/bots/${info.name}/config`)}
                >
                  配置
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  onClick={() => navigate(`/bots/${info.name}/package`)}
                >
                  包管理
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                  onClick={() => navigate(`/bots/${info.name}/env`)}
                >
                  环境
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  onClick={() => navigate(`/bots/${info.name}/packages`)}
                >
                  应用
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  onClick={onLog}
                >
                  {isOnlineLog ? '在线日志' : '查询日志'}
                </Button>
              </div>

              {/* 操作按钮组 */}
              <div className="flex gap-2 items-center">
                {info.node_modules && (
                  <Tooltip title="重新加载依赖">
                    <Button
                      size="small"
                      className="chatgpt-button bg-gradient-to-r from-yellow-500 to-orange-500 border-none"
                      onClick={() => {
                        bot.onInstall(info.name)
                      }}
                    >
                      重载
                    </Button>
                  </Tooltip>
                )}

                {info.node_modules && info.status ? (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-gradient-to-r from-red-500 to-pink-500 border-none hover:from-red-600 hover:to-pink-600"
                    onClick={() => bot.onStop(info.name)}
                  >
                    停止
                  </Button>
                ) : null}

                {info.node_modules && !info.status ? (
                  <Button
                    type="primary"
                    size="small"
                    className="chatgpt-button bg-gradient-to-r from-green-500 to-emerald-500 border-none"
                    onClick={() => {
                      bot.onRun(info.name)
                    }}
                  >
                    运行
                  </Button>
                ) : null}

                {!info.node_modules && (
                  <Button
                    type="primary"
                    size="small"
                    className="chatgpt-button bg-gradient-to-r from-amber-500 to-orange-500 border-none"
                    onClick={() => {
                      bot.onInstall(info.name)
                    }}
                  >
                    加载依赖
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
      <FloatButtons />
    </>
  )
}

export default Panel
