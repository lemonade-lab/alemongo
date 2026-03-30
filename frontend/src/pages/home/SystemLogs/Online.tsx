import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Button, Switch } from 'antd'
import { createAuthedWS } from '@/api/ws'

const Online = () => {
  const [data, setData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [paused, setPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const pausedRef = useRef(false)
  const autoScrollRef = useRef(true)
  const wsRef = useRef<WebSocket | null>(null)
  const mountedRef = useRef(true)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const userScrolledRef = useRef(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    autoScrollRef.current = autoScroll
    if (autoScroll) {
      userScrolledRef.current = false
      scrollToBottom()
    }
  }, [autoScroll])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // flex-col-reverse 下 scrollTop=0 即底部
    el.scrollTop = 0
  }, [])

  // 监听用户手动滚动
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (Math.abs(el.scrollTop) > 30) {
        if (autoScrollRef.current && !userScrolledRef.current) {
          userScrolledRef.current = true
          setAutoScroll(false)
        }
      } else {
        userScrolledRef.current = false
      }
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const connect = () => {
      if (!mountedRef.current) return
      try {
        const ws = createAuthedWS(
          `/system/log/ws?size=200&timestamp=${Date.now()}`
        )
        wsRef.current = ws
        ws.onopen = () => {
          setIsLoading(false)
          retryCountRef.current = 0
        }
        ws.onmessage = ev => {
          if (pausedRef.current) return
          try {
            const msg = JSON.parse(ev.data)
            if (msg?.type === 'init') {
              const lines = String(msg.data || '')
                .split('\n')
                .filter((l: string) => l.trim() !== '')
              setData(lines)
            } else if (msg?.type === 'append') {
              const line = String(msg.data || '')
              if (!line.trim()) return
              setData(prev => [...prev, line])
            }
          } catch {
            const text = String(ev.data || '')
            if (!text.trim()) return
            setData(prev => [...prev, text])
          }
        }
        ws.onerror = () => {
          // 交由 onclose 处理重连
        }
        ws.onclose = () => {
          if (!mountedRef.current) return
          const attempt = Math.min(retryCountRef.current + 1, 6)
          retryCountRef.current = attempt
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
          retryTimerRef.current = setTimeout(connect, delay)
        }
      } catch {
        if (!mountedRef.current) return
        retryTimerRef.current = setTimeout(connect, 2000)
      }
    }

    connect()
    return () => {
      mountedRef.current = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        wsRef.current.close()
    }
  }, [])

  // 数据变化时自动滚到底部
  useEffect(() => {
    if (autoScrollRef.current) {
      scrollToBottom()
    }
  }, [data, scrollToBottom])

  const renderData = useMemo(() => data.slice(-200), [data])

  return (
    <div className="h-full flex flex-col gap-2 min-h-0 overflow-hidden">
      {/* 头部区域 */}
      <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <div
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${paused ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}
        ></div>
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          {paused ? '已暂停' : '实时更新中'}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            自动滚动
          </span>
          <Switch
            size="small"
            checked={autoScroll}
            onChange={v => {
              setAutoScroll(v)
              userScrolledRef.current = !v
            }}
          />
        </div>
        <Button size="small" onClick={() => setPaused(p => !p)}>
          {paused ? '继续' : '暂停'}
        </Button>
      </div>

      {/* 日志内容区域 */}
      <div className="flex-1 min-h-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden shadow-lg">
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
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto overflow-x-auto p-4 space-y-1 flex flex-col-reverse"
          >
            <div className="space-y-1">
              {renderData.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-700/80 duration-200"
                >
                  <div className="flex-shrink-0 pt-1">
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
                  <div className="flex-1 min-w-0">
                    <div className="select-text text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {item}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center justify-end text-xs text-gray-600 dark:text-gray-400 pt-1">
        <div>共 {renderData.length} 条日志记录</div>
      </div>
    </div>
  )
}

export default Online
