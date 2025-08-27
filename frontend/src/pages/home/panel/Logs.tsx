import { useEffect, useRef, useState } from 'react'
import { apiBotLog } from '@/api'
import { getBotName } from './core'
import Box from '@/commom/layout/Box'

/**
 * Chat风格的日志查看页面
 * @returns
 */
const Logs = () => {
  const [data, setData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const length = useRef(0)
  const logRef = useRef(null)

  // 开始轮训
  const startPolling = (name: string) => {
    clearTimeout(pollingRef.current!)
    pollingRef.current = setTimeout(() => {
      apiBotLog({ name })
        .then(res => {
          setIsLoading(false)
          // 根据换行符分割
          const lines = res.split('\n')
          // 过滤掉空行
          const filteredLines = lines.filter(line => line.trim() !== '')
          setData(filteredLines)
        })
        .catch(() => {
          setIsLoading(false)
        })
        .finally(() => {
          startPolling(name)
        })
    }, 1000)
  }

  useEffect(() => {
    const botName = getBotName()
    startPolling(botName)
    return () => {
      clearTimeout(pollingRef.current!)
    }
  }, [])

  useEffect(() => {
    // 长度增加时，滚动到底部
    if (length.current < data.length) {
      // 滚动到底部
      if (logRef.current) {
        const element = logRef.current as HTMLDivElement
        element.scrollTop = element.scrollHeight
      }
    }
    length.current = data.length
  }, [data])

  // 只是渲染最新的100条数据
  const renderData = data.slice(-100)

  return (
    <Box boxRef={logRef}>
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              实时日志
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              机器人运行状态监控
            </p>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            实时更新中
          </span>
        </div>
      </div>

      {/* 日志内容区域 */}
      <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden shadow-lg">
        {isLoading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
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
        ) : renderData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
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
              <p className="text-gray-600 dark:text-gray-400">暂无日志数据</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-1 max-h-[calc(100vh-10rem)]">
            {renderData.map((item, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-700/80  duration-200"
              >
                {/* 日志内容 */}
                <div className="flex-1">
                  <div className="select-text text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                    {item}
                  </div>
                </div>

                {/* 日志类型指示器 */}
                <div className="flex-shrink-0">
                  {item.toLowerCase().includes('error') ? (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  ) : item.toLowerCase().includes('warn') ? (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  ) : item.toLowerCase().includes('info') ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>共 {renderData.length} 条日志记录</span>
        <span>自动滚动到底部</span>
      </div>
    </Box>
  )
}

export default Logs
