import { apiResetTemplate } from '@/api/settings/template'
import Box from '@/commom/Box'
import { useCommon } from '@/hook/useCommon'
import { SettingOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useState } from 'react'

/**
 * Chat风格的设置页面
 * @returns
 */
const Settings = () => {
  const [common] = useCommon()

  const tools = [
    {
      name: 'IP',
      data: {
        installed: true,
        version: common.info.location || 'N/A'
      },
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'NodeJS',
      data: common.info.node,
      icon: '🟢',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'NVM',
      data: common.info.nvm,
      icon: '📦',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Git',
      data: common.info.git,
      icon: '📝',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Browser',
      data: common.info.browser,
      icon: '🌍',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  const [loading, setLoading] = useState(false)

  const onResetTemplate = () => {
    if (loading) {
      return
    }
    setLoading(true)
    apiResetTemplate()
      .then(() => {
        message.success('模板重置成功')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Box>
      <div className="p-6 flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300 flex-1">
        <div className="flex flex-1 flex-col gap-8 items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl  duration-300 max-w-2xl mx-auto w-full">
          {/* 头部区域 */}
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                <SettingOutlined className="text-4xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                通用设置
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                系统版本: {common.info.base.version}
              </p>
            </div>
          </div>

          {/* 工具状态列表 */}
          <div className="flex flex-col gap-4 items-center w-full">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              系统组件状态
            </h2>
            {tools.map(
              tool =>
                tool.data?.installed && (
                  <div
                    key={tool.name}
                    className="group flex items-center justify-between w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-white/20 dark:border-gray-600/20 hover:shadow-xl  duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        {tool.icon}
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {tool.name}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          已安装
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold gradient-text">
                        {tool.data.version}
                      </span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* 重置模板区域 */}
          <div className="w-full">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl px-6 py-4 shadow-lg border border-red-200/50 dark:border-red-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                      重置模板
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      用于替换旧版本的基础机器人模板
                    </div>
                  </div>
                </div>
                <button
                  onClick={onResetTemplate}
                  disabled={loading}
                  className="chatgpt-button bg-gradient-to-r from-red-500 to-pink-500 border-none hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 text-white font-semibold rounded-lg  duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      重置中...
                    </div>
                  ) : (
                    '重置模板'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Settings
