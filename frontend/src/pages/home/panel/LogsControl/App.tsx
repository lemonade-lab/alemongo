import { apiBotLog } from '@/api'
import { Button, DatePicker, DatePickerProps, Popconfirm, Tabs } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { getBotName } from '../core'
import Box from '@/commom/layout/Box'
import { apiBotLogDelete } from '@/api/bot/logs'
import { message } from 'antd'
import {
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { Pagination } from '@/commom'

const LogsControl = () => {
  const [timestamp, setTimestamp] = useState<number>(Date.now())
  const [data, setData] = useState<string[]>([])
  const [isLoading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 100
  })

  const [total, setTotal] = useState(0)
  const name = getBotName()
  const selectedDateStr = dayjs(timestamp).format('YYYY-MM-DD')

  useEffect(() => {
    setIsRefreshing(true)
    const params = {
      name,
      timestamp,
      page: String(pageInfo.page),
      pageSize: String(pageInfo.pageSize)
    }
    apiBotLog(params)
      .then(res => {
        const { log, count } = res || {}
        setTotal(count || 0)
        const lines = (log || '').split('\n')
        const filteredLines = lines.filter(line => line.trim() !== '')
        setData(filteredLines)
      })
      .finally(() => setIsRefreshing(false))
  }, [name, timestamp, pageInfo])

  const onChange: DatePickerProps['onChange'] = date => {
    if (!date) return
    setTimestamp(Number(date.valueOf()))
  }

  const onDelete = () => {
    if (isLoading) return
    setLoading(true)
    const cur = timestamp
    apiBotLogDelete({ name, timestamp: cur })
      .then(() => {
        if (cur === timestamp) setData([])
      })
      .finally(() => setLoading(false))
  }

  const onCopyPage = async () => {
    try {
      await navigator.clipboard.writeText(data.join('\n'))
      message.success('已复制当前页日志')
    } catch {
      message.error('复制失败')
    }
  }

  const onDownloadSelectedDay = async () => {
    try {
      const date = selectedDateStr
      const url = `/api/v1/bot/log/download?name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}-${date}.log`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      message.error('下载失败')
    }
  }

  const onDownloadPage = async () => {
    try {
      const blob = new Blob([data.join('\n')], {
        type: 'text/plain;charset=utf-8'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}-${selectedDateStr}-page-${pageInfo.page}.log`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      message.error('下载失败')
    }
  }

  return (
    <Box>
      <div className="h-full flex flex-col gap-2 justify-between">
        {/* 头部区域 + Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="w-full">
            <Tabs
              activeKey="query"
              items={[
                { key: 'online', label: '在线日志' },
                { key: 'query', label: '查询日志' }
              ]}
              onChange={key => {
                if (key === 'online') {
                  const name = getBotName()
                  window.location.href = `/bots/${name}/logs`
                }
              }}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0 bg-white rounded-md dark:bg-slate-500">
              <DatePicker
                value={dayjs(timestamp)}
                onChange={onChange}
                className="chatgpt-input w-full"
                size="large"
                showTime={false}
                format="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-3 flex-wrap">
            <Popconfirm
              placement="leftTop"
              title={
                <div className="flex items-center gap-2">
                  <DeleteOutlined className="text-red-500" />
                  <span className="font-medium">确认删除日志？</span>
                </div>
              }
              description="此操作将永久删除所选日期的所有日志记录，无法恢复。"
              disabled={isLoading || data.length === 0}
              okText="确认删除"
              cancelText="取消"
              onConfirm={onDelete}
              okButtonProps={{ danger: true }}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                loading={isLoading}
                disabled={data.length === 0}
                className="shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                删除日志
              </Button>
            </Popconfirm>
            <Button
              icon={<CopyOutlined />}
              onClick={onCopyPage}
              disabled={data.length === 0}
            >
              复制本页
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={onDownloadPage}
              disabled={data.length === 0}
            >
              下载本页
            </Button>
            <Button icon={<DownloadOutlined />} onClick={onDownloadSelectedDay}>
              下载所选日
            </Button>
          </div>
        </div>

        {/* 日志内容区域（与在线日志页风格统一） */}
        <div className="flex-1 min-w-0 w-full max-w-full">
          <div className="flex-1 min-w-0 w-full max-w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden shadow-lg">
            {isRefreshing && data.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
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
                    正在加载日志...
                  </p>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <p className="text-gray-600 dark:text-gray-400">
                    暂无日志数据
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto overflow-x-auto p-4 space-y-1  max-h-[calc(100vh-25rem)] sm:max-h-[calc(100vh-19rem)] md:max-h-[calc(100vh-16rem)] lg:max-h-[calc(100vh-17rem)] xl:max-h-[calc(100vh-14rem)] min-w-0 w-full max-w-full">
                {data.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-700/80  duration-200"
                  >
                    {/* 行号 */}
                    <div className="flex-shrink-0 w-10 text-xs text-gray-400 dark:text-gray-500 font-mono text-right pt-1">
                      {index + 1}
                    </div>
                    {/* 日志内容 */}
                    <div className="flex-1 min-w-0 w-full max-w-full">
                      <pre className="select-text text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words break-all md:break-words leading-relaxed">
                        {item}
                      </pre>
                    </div>
                    {/* 单行复制按钮 */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        size="small"
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(item)
                            message.success('已复制该行')
                          } catch {
                            message.error('复制失败')
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 分页器 */}
        <div className="flex justify-center w-full">
          <div className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 dark:border-gray-700/20">
            <Pagination
              total={total}
              pageSize={pageInfo.pageSize}
              page={pageInfo.page}
              onPageChange={page => setPageInfo({ ...pageInfo, page })}
            />
          </div>
        </div>
      </div>
    </Box>
  )
}

export default LogsControl
