import React from 'react'
import Box from '@/commom/layout/Box'
import { useNavigate } from 'react-router-dom'
import { BorderOutlined } from '@ant-design/icons'
import classNames from 'classnames'
// 首页仅作为导航入口，具体检测/安装在各自应用页面实现

/**
 * Chat风格的应用列表页面
 * @returns
 */
const Apps: React.FC = () => {
  const navigate = useNavigate()

  const closeApps = [
    {
      name: 'ALmeonB',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="me.png"
        />
      ),
      onClick: () => navigate('/bots'),
      open: true,
      description: '机器人管理平台',
      color: 'from-purple-500 to-blue-500'
    },
    {
      name: 'QQ MD',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="https://qq-web.cdn-go.cn/im.qq.com_new/863ecfe8/img/qq9logo.2a076d03.png"
        />
      ),
      onClick: () => navigate('/apps/qqbot-button-template'),
      open: true,
      description: 'QQ机器人按钮模板',
      color: 'from-green-500 to-blue-500'
    },
    {
      name: '应用管理',
      icon: (
        <div className="w-20 h-20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-14 h-14 text-purple-600 dark:text-purple-400"
          >
            <path d="M4 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM4 16a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
          </svg>
        </div>
      ),
      onClick: () => navigate('/apps/manage'),
      open: true,
      description: '基本依赖应用',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      name: '任务中心',
      icon: (
        <div className="w-20 h-20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-14 h-14 text-blue-600 dark:text-blue-400"
          >
            <path d="M9 2a1 1 0 00-1 1v1H6.5A2.5 2.5 0 004 6.5V19a3 3 0 003 3h10a3 3 0 003-3V6.5A2.5 2.5 0 0017.5 4H16V3a1 1 0 10-2 0v1h-4V3a1 1 0 00-1-1zM6 8h12v11a1 1 0 01-1 1H7a1 1 0 01-1-1V8zm3.707 4.293a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0l-.586-.586a1 1 0 111.414-1.414l.293.293 1.086-1.086a1 1 0 011.414 0zM13 12h5v2h-5v-2z" />
          </svg>
        </div>
      ),
      onClick: () => navigate('/tasks'),
      open: true,
      description: '查看任务列表与日志',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: '防火墙',
      icon: (
        <div className="flex-1 flex justify-center text-3xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-110">
          <BorderOutlined size={80} className="size-20" />
        </div>
      ),
      onClick: () => navigate('/apps/firewall'),
      open: true,
      description: 'macOS PF',
      color: 'from-red-500 to-orange-500'
    },
    {
      name: '流水线',
      icon: (
        <div className="w-20 h-20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-14 h-14 text-blue-600 dark:text-blue-400"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      ),
      onClick: () => navigate('/pipeline'),
      open: true,
      description: '管理和监控自动化部署流水线',
      color: 'from-blue-500 to-purple-500'
    },
    {
      name: '多进程机器',
      icon: (
        <div className="w-20 h-20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-14 h-14 text-teal-600 dark:text-teal-400"
          >
            <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
          </svg>
        </div>
      ),
      onClick: () => navigate('/multibots'),
      open: true,
      description: '一个文件夹多份配置并行启动',
      color: 'from-teal-500 to-emerald-500'
    }
  ]

  return (
    <Box>
      <div className="">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold  mb-2">应用中心</h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理和访问各种工具和服务
          </p>
        </div>

        {/* 常用应用管理入口：卡片导航到具体 App 页面 */}

        {/* 应用网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {closeApps.map((app, index) => (
            <div
              key={app.name}
              className={classNames(
                'group relative overflow-hidden rounded-xl  duration-300 cursor-pointer',
                'bg-white/10 backdrop-blur-sm border border-white/20',
                'hover:bg-white/20 hover:border-purple-300/30',
                'hover:shadow-lg hover:shadow-purple-500/10',
                'transform hover:scale-105',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={app.onClick}
            >
              {/* 背景渐变 */}
              <div
                className={classNames(
                  'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                  app.color
                )}
              ></div>

              {/* 内容 */}
              <div className="relative z-10 p-6 text-center">
                {/* 图标 */}
                <div className="mb-4 flex justify-center">{app.icon}</div>

                {/* 应用名称 */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {app.name}
                </h3>

                {/* 描述 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {app.description}
                </p>

                {/* 状态指示器 */}
                <div className="flex items-center justify-center">
                  <div
                    className={classNames(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      app.open
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    )}
                  >
                    {app.open ? '可用' : '开发中'}
                  </div>
                </div>
              </div>

              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="my-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-500"
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
            <span className="text-sm text-blue-700 dark:text-blue-300">
              更多应用正在开发中，敬请期待！
            </span>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Apps
