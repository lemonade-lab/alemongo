import React from 'react'
import Box from '@/commom/Box'
import { useNavigate } from 'react-router-dom'
import { BorderOutlined } from '@ant-design/icons'
import { message } from 'antd'
import classNames from 'classnames'

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
          src="https://alemonjs.com/img/alemon.png"
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
      name: 'Kook MD',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="https://developer.kookapp.cn/img/kooklogo.png"
        />
      ),
      onClick: () => {
        window.open(
          'https://www.kookapp.cn/tools/message-builder.html#/card',
          '_blank'
        )
      },
      open: true,
      description: 'Kook消息构建器',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'NodeJS',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEhklEQVR4AbWXNbDkRhCG/x49NB4z5snlkZk5MjMzM23k7CA2MzPzhs58eXLM9PjpSZr+XaWZamtqZTjq2qnWLEx/9f89q5HgCOPaT859QD1fnMk5Ukz5ztd3/fYGjiAOG+DGz887rSJfoMdp6gnvielJBYjNvnKXf3fPzxuPC8Cd35+3qqi4zntcph5QBVQJ9URZEEVOiANc5t4Ql3W+uOmHzccE4MHPL5s1MVQ8QPJB9Zyl3goHiDjPJzUsKKhBJJMXv7jpl85RAdz20wU3CvECiVVWNAWw7EuimGEN4JxAXK3IZoHrfHbTz28cFsC9v190WlnxBZCnKQEweE0raDmMilANVmhFiJNgx995Y79ml3/QYoskcv9+2awC5TpV3ggKyFhUQ/ZqEClIzL5CDSFCuBQiKJPJG1mWdT64ykDgEOOiV057oEC1CcCNAgFBhFeQFSBCarAzzaEIQAZoyxreo+LGqqr+vOLts17oARgfK9dPTpSzEMIKCQSAtDqWEtFgSQANiKBksAmUWeP7/IunvXjarASAAuzcOgUQIGi1SIYMsaJtrUMabC27aoCgxsEwpic9yhkCg0gBxAFFqTiwfwYCgdWRaANCtpVSoSDBJ4MmAEYINqyamlBQlD0WUFiPfXtzeE9bSGA4EUrAf9tGAcYKKwllaNJ8WusMiPQAwJHISK+KgwfzdHkSFoT93JpQwiRim20aty5jL+RTPumb1AKJLwccODADVaI92NA9wrCJKzbRRiPO5BosARO7EgvgCELhqdi7L09XtpBEGBooTAFTCoCvghJF6Rm9B9sUQEZSNLwjwMGRHFWZLJle2/++9HwqzWYk6r9oKoPCQLsCcARcABEXZN61qeipKjahFUm2TGJDzApQyGBZqkAKkCkgFDpCJvsxNe7rkYakOUAklITNLUSdEIycZBuAQAhkBAoH0fDR/l0FBP8Syb8lkUpMgAEHKkE/K94DoKG4Ai7vN5mmJxQTo20qMNmGBAOIKSIQhLuQhbcWkB4AurALJB8AK0l82rejQG9Isi1tRTZ7hDZP3hIAQykAxDHINNFnsoYIt9iDe8pklWQ7SUMVkbRdxVYyFeiUbdsQMjrY9DCJkf0V1MeFicb3JPLQVDEEg7I1gy3eoRdgYmAEU/3JPaAZ6omRA2Wyu8AWSwgw0Tsm0j53PhMAIwmA23tiB4KRdCulMXbAoyw1qdl2LkjPEOklHEbg8VD3oW5dK0OMzb9u/mP1mas/JDhbIGvQE3aqwfCJGUjEQbtWElQJcxtivxPIBuS4vPtct9vGZnHaS6etguBzkq0gC5YPYGDQxYOqHc/juZDw4fTczF1W6HSfssL4F4AE5EaCLwBYhUYMDjvMXzoAOymrFTKICLS5KvnQr592vzjCBxMDeZHCB0DMigdWzFvaX6ugPlUgQoxoiQ0Dla7/Inp9pACpLcCLBG8AgKETMsxZ1Jc+qITrL6T0D31xV/dYPJq1g1D4OYg1s+b31SA1gLLrPTpf3PRL9zg+Haf9kQ3IC3MX9s1SsPPJtb+sxxHEX3WUaVLftBigAAAAAElFTkSuQmCC"
        />
      ),
      onClick: () => {
        message.warning('功能正在开发中，敬请期待！')
      },
      open: false,
      description: 'Node.js环境管理',
      color: 'from-green-600 to-green-400'
    },
    {
      name: '防火墙',
      icon: (
        <div className="flex-1 flex justify-center text-3xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-110">
          <BorderOutlined />
        </div>
      ),
      onClick: () => {
        message.warning('防火墙功能正在开发中，敬请期待！')
      },
      description: '系统防火墙管理',
      color: 'from-red-500 to-orange-500'
    },
    {
      name: 'NVM',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="https://avatars.githubusercontent.com/u/49963700?s=200&v=4"
        />
      ),
      onClick: () => {
        message.warning('NVM 功能正在开发中，敬请期待！')
      },
      description: 'Node版本管理器',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Git',
      icon: (
        <img
          className="w-20 h-20 object-contain transition-transform duration-200 group-hover:scale-110"
          src="https://git-scm.com/images/logo@2x.png"
        />
      ),
      onClick: () => {
        message.warning('Git 功能正在开发中，敬请期待！')
      },
      description: 'Git版本控制',
      color: 'from-orange-600 to-red-600'
    }
  ]

  return (
    <Box>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">应用中心</h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理和访问各种工具和服务
          </p>
        </div>

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
        <div className="mt-12 text-center">
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
