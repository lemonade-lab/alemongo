import { ExclamationCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiBotConfigsDelete, apiBotConfigsList } from '@/api'
import Box from '@/commom/Box'

/**
 * Chat风格的配置管理页面
 * @returns
 */
const Configs = () => {
  const navigate = useNavigate()
  const [configNames, setConfigNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiBotConfigsList()
      .then(res => {
        setConfigNames(res)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const onDelete = (name: string) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">删除配置</span>
        </div>
      ),
      content: `确定删除配置 "${name}" 吗？此操作不可撤销。`,
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      okType: 'danger',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: {
        className: 'bg-gradient-to-r from-red-500 to-pink-500 border-none'
      },
      onOk: () => {
        apiBotConfigsDelete({ name }).then(() => {
          setConfigNames(prev => prev.filter(item => item !== name))
        })
      }
    })
  }

  return (
    <Box>
      <div className="flex gap-6 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300 flex-1">
        {/* 头部区域 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">配置管理</h1>
              <p className="text-gray-600 dark:text-gray-400">
                管理机器人配置文件
              </p>
            </div>
          </div>

          <Button
            type="primary"
            onClick={() => navigate('/configs/alemon.config/create')}
            className="chatgpt-button px-6 py-2 text-base font-semibold"
            icon={
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            新增配置
          </Button>
        </div>

        {/* 配置列表 */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg
                    className="w-8 h-8 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  正在加载配置...
                </p>
              </div>
            </div>
          ) : configNames.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  暂无配置
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  点击右上角"新增配置"按钮创建您的第一个配置文件
                </p>
                <Button
                  type="primary"
                  onClick={() => navigate('/configs/alemon.config/create')}
                  className="chatgpt-button"
                >
                  创建配置
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {configNames.map((name, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl  duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={e => {
                    e.stopPropagation()
                    console.log('编辑按钮被点击，配置名称:', name)
                    navigate(`/configs/${name}`)
                  }}
                >
                  <div className="chatgpt-card p-6 h-full hover:scale-105 transition-transform duration-300">
                    {/* 配置图标 */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* 配置名称 */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-4 truncate">
                      {name}
                    </h3>

                    {/* 操作按钮 */}
                    <Button
                      type="primary"
                      danger
                      className="w-full"
                      icon={<SettingOutlined />}
                      onClick={e => {
                        e.stopPropagation()
                        onDelete(name)
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Box>
  )
}

export default Configs
