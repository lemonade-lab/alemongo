import { apiBotLog } from '@/api'
import {
  Button,
  DatePicker,
  DatePickerProps,
  Popconfirm,
  Spin,
  Empty
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { getBotName } from '../core'
import Box from '@/commom/layout/Box'
import { apiBotLogDelete } from '@/api/bot/logs'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons'

const XtermDate = () => {
  const [timestamp, setTimestamp] = useState<number>(Date.now())
  const [data, setData] = useState<string[]>([])
  const [isLoading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const name = getBotName()
    setIsRefreshing(true)
    apiBotLog({ name, timestamp: timestamp })
      .then(res => {
        // 根据换行符分割
        const lines = res.split('\n')
        // 过滤掉空行
        const filteredLines = lines.filter(line => line.trim() !== '')
        setData(filteredLines)
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }, [timestamp])

  const onChange: DatePickerProps['onChange'] = date => {
    if (!date) {
      return
    }
    // 获取时间戳
    const timestamp = date.valueOf()
    setTimestamp(timestamp)
  }

  const onDelete = () => {
    if (isLoading) {
      return
    }
    setLoading(true)
    const curtimestamp = timestamp
    apiBotLogDelete({ name: getBotName(), timestamp: curtimestamp })
      .then(() => {
        if (curtimestamp === timestamp) {
          setData([])
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleRefresh = () => {
    const name = getBotName()
    setIsRefreshing(true)
    apiBotLog({ name, timestamp: timestamp })
      .then(res => {
        const lines = res.split('\n')
        const filteredLines = lines.filter(line => line.trim() !== '')
        setData(filteredLines)
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }

  return (
    <Box>
      {/* 主容器 - Chat风格卡片 */}
      <div className="chatgpt-card p-6 h-full">
        {/* 头部区域 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DatePicker
                defaultValue={dayjs()}
                onChange={onChange}
                className="chatgpt-input w-full"
                size="large"
                showTime={false}
                format="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isRefreshing}
              className="chatgpt-button"
              size="middle"
            >
              刷新
            </Button>
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
          </div>
        </div>

        {/* 日志内容区域 */}
        <div className="relative">
          {/* 日志头部 */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-t-xl backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full "></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                日志内容
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {data.length} 条记录
            </div>
          </div>

          {/* 日志列表容器 */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-b-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {isRefreshing ? (
              <div className="flex items-center justify-center py-12">
                <Spin size="large" />
                <span className="ml-3 text-gray-500 dark:text-gray-400">
                  正在加载日志...
                </span>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Empty
                  description="暂无日志数据"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div className="h-[calc(100vh-27rem)] xl:h-[calc(100vh-17rem)] overflow-y-auto">
                {data.map((item, index) => (
                  <div
                    key={index}
                    className="group relative px-4 py-3 border-b border-gray-100/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* 行号 */}
                    <div className="absolute left-2 top-3 text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {index + 1}
                    </div>

                    {/* 日志内容 */}
                    <div className="ml-6">
                      <pre className="select-text text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {item}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  )
}

export default XtermDate
