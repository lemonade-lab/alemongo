import {
  Button,
  Spin,
  Tag,
  message,
  Modal,
  Tooltip,
  MenuProps,
  Dropdown,
  Space
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useCommon } from '@/hook/useCommon'
import { useEffect, useState } from 'react'
import {
  apiBotList,
  apiBotYarnInstall,
  apiBotInfo,
  apiBotDelete,
  apiBotCopy,
  BotInfo
} from '@/api'
import Pagination from '@/components/Pagination'
import ProcessPortModal from '@/components/ProcessPortModal'
import Headings from './Headings'
import './index.scss'
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Box } from '@/commom'

/**
 * Chat风格的机器人管理页面
 * @returns
 */
const Home = () => {
  const navigate = useNavigate()
  const goNodejs = () => {
    navigate('/apps/nodejs')
  }
  const [common] = useCommon()

  // 卡片数据
  const [bots, setBots] = useState<BotInfo[]>([])
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 8,
    total: 0
  })
  const [curData, setCurData] = useState<BotInfo[]>([])

  // 依赖加载loading状态
  const [loadingNames, setLoadingNames] = useState<string[]>([])

  // 端口信息弹窗状态
  const [portModalVisible, setPortModalVisible] = useState(false)
  const [selectedBot, setSelectedBot] = useState<{
    name: string
    pid: number
  } | null>(null)

  // Dropdown 打开状态
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)

  useEffect(() => {
    if (!common.info.start_at) return
    apiBotList().then(res => {
      setBots(res)
      setPageInfo(prev => ({ ...prev, total: res.length }))
    })
  }, [common.info])

  // 加载依赖
  const onInstall = (name: string) => {
    if (loadingNames.includes(name)) return
    setLoadingNames(prev => [...prev, name])
    apiBotYarnInstall({ name }).then(() => {
      // 轮询依赖安装完成
      const poll = () => {
        apiBotInfo({ name }).then(res => {
          if (!res.node_modules) {
            setTimeout(poll, 1000)
            return
          }
          setLoadingNames(prev => prev.filter(item => item !== name))
          // 刷新数据
          apiBotList().then(res => {
            setBots(res)
            setPageInfo(prev => ({ ...prev, total: res.length }))
          })
        })
      }
      poll()
    })
  }

  // 处理PID点击
  const handlePidClick = (bot: BotInfo) => {
    if (bot.pid && bot.pid > 0) {
      setSelectedBot({ name: bot.name, pid: bot.pid })
      setPortModalVisible(true)
    } else {
      message.warning('该机器人未运行，无法查看端口信息')
    }
  }

  useEffect(() => {
    const start = (pageInfo.page - 1) * pageInfo.pageSize
    const end = pageInfo.page * pageInfo.pageSize
    setCurData(bots.slice(start, end))
  }, [bots, pageInfo.page, pageInfo.pageSize])

  // 删除机器人
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
        apiBotDelete({ name }).then(() => {
          // 刷新机器人列表
          apiBotList().then(res => {
            setBots(res)
            setPageInfo(prev => ({ ...prev, total: res.length }))
          })
        })
      }
    })
  }

  // 复制机器人
  const onCopy = (name: string) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">复制机器人</span>
        </div>
      ),
      content: `确定复制机器人 "${name}" 吗？将创建一个名为 "${name}-copy" 的新机器人。`,
      icon: <ExclamationCircleOutlined className="text-blue-500" />,
      okText: '确认复制',
      cancelText: '取消',
      okButtonProps: {
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 border-none'
      },
      onOk: () => {
        apiBotCopy({ bot_name: name }).then(() => {
          message.success('复制成功')
          // 刷新机器人列表
          apiBotList().then(res => {
            setBots(res)
            setPageInfo(prev => ({ ...prev, total: res.length }))
          })
        })
      }
    })
  }

  const createMenu = (bot: BotInfo) => {
    return [
      {
        key: '1',
        label: '加载依赖',
        disabled: !!bot.node_modules || loadingNames.includes(bot.name),
        onClick: () => {
          onInstall(bot.name)
        }
      },
      {
        key: '2',
        label: '复制',
        onClick: () => {
          onCopy(bot.name)
        }
      },
      {
        key: '3',
        danger: true,
        label: '删除',
        onClick: () => {
          onDelete(bot.name)
        }
      }
    ] as MenuProps['items']
  }

  return (
    <Box>
      <Spin
        spinning={common.loading}
        tip="加载中..."
        className="w-full h-full flex-1 flex"
      >
        {common.loading || common.info.node.installed ? (
          <div className="w-full h-full flex gap-4 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
            {/* 头部区域 */}
            <div className="w-full flex-shrink-0">
              <Headings
                onUpdate={() => {
                  apiBotList().then(res => {
                    setBots(res)
                    setPageInfo(prev => ({ ...prev, total: res.length }))
                  })
                }}
              />
            </div>

            {/* 机器人列表区域 */}
            <div className="flex-1 w-full overflow-auto ">
              <div className="min-w-full overflow-x-auto">
                {curData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
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
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      暂无机器人
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      点击右上角"新建"按钮创建您的第一个机器人
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {curData.map((bot, index) => (
                      <div
                        key={bot.name}
                        className="group relative overflow-hidden rounded-xl duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={e => {
                          e.stopPropagation()
                          navigate(`/bots/${bot.name}`)
                        }}
                      >
                        {/* 背景卡片 */}
                        <div
                          className={`flex flex-col gap-2 justify-between chatgpt-card p-6 h-full transition-transform duration-300 ${
                            openDropdownKey === bot.name
                              ? ''
                              : 'hover:scale-105'
                          }`}
                        >
                          {/* 头部信息 */}
                          <div className="flex items-center justify-between mb-4">
                            <Tooltip
                              title={bot?.name.length > 12 ? bot.name : ''}
                            >
                              <h3 className="text-lg font-bold  truncate">
                                {bot.name}
                              </h3>
                            </Tooltip>
                          </div>

                          {/* 详细信息 */}
                          <div className="space-y-3 mb-6">
                            <div
                              className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                              onClick={e => e.stopPropagation()}
                            >
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
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              PID:
                              {bot.pid && bot.pid > 0 ? (
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handlePidClick(bot)
                                  }}
                                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer transition-colors"
                                  title="点击查看端口信息"
                                >
                                  {bot.pid}
                                </button>
                              ) : (
                                <span className="ml-1">-</span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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
                                  d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8"
                                />
                              </svg>
                              PORT: {bot.port || '-'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              创建时间: {bot.create_at}
                            </div>
                          </div>

                          <div
                            className="flex justify-between"
                            onClick={e => e.stopPropagation()}
                          >
                            <Tag
                              color={bot.status === 1 ? 'green' : 'red'}
                              className="rounded-full px-3 py-1 text-xs font-medium"
                            >
                              {loadingNames.includes(bot.name)
                                ? '加载依赖中...'
                                : bot.status === 1
                                  ? '运行中'
                                  : '已停止'}
                            </Tag>

                            <Dropdown
                              menu={{ items: createMenu(bot) }}
                              trigger={['click']}
                              open={openDropdownKey === bot.name}
                              onOpenChange={open => {
                                setOpenDropdownKey(open ? bot.name : null)
                              }}
                              getPopupContainer={trigger =>
                                trigger.parentElement || document.body
                              }
                            >
                              <a
                                onClick={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                              >
                                <Space>
                                  操作
                                  <DownOutlined />
                                </Space>
                              </a>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* 分页区域 */}

            {pageInfo.total ? (
              <div className="flex justify-center w-full">
                <div className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 dark:border-gray-700/20">
                  <Pagination
                    total={pageInfo.total}
                    pageSize={pageInfo.pageSize}
                    page={pageInfo.page}
                    onPageChange={page => {
                      setPageInfo({
                        ...pageInfo,
                        page
                      })
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <section className="flex-1 w-full h-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
            <div className="chatgpt-card p-12 text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                NodeJS 未安装
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                无法管理机器人，请先安装 NodeJS 环境
              </p>
              <Button
                onClick={() => goNodejs()}
                className="chatgpt-button px-8 py-3 text-base font-semibold"
              >
                了解如何安装
              </Button>
            </div>
          </section>
        )}
      </Spin>

      {/* 端口信息弹窗 */}
      {selectedBot && (
        <ProcessPortModal
          visible={portModalVisible}
          pid={selectedBot.pid}
          botName={selectedBot.name}
          onClose={() => {
            setPortModalVisible(false)
            setSelectedBot(null)
          }}
        />
      )}
    </Box>
  )
}

export default Home
