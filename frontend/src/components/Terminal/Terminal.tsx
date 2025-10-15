import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
import { Button, message, Modal, Space, Typography } from 'antd'
import {
  ReloadOutlined,
  FullscreenOutlined,
  SearchOutlined,
  SettingOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import useTheme from '@/hook/useTheme'
import './Terminal.css'
import { TOKEN_KEY } from '@/api'

const { Text } = Typography

interface TerminalProps {
  className?: string
}

interface TerminalMessage {
  type: string
  data: string
  cols?: number
  rows?: number
}

const Terminal: React.FC<TerminalProps> = ({ className = '' }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sendQueueRef = useRef<string[]>([])
  const isSendingRef = useRef(false)

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isMounted, setIsMounted] = useState(true)

  const { dark: isDark } = useTheme()

  // 处理发送队列 - 使用 useRef 避免循环依赖
  const processSendQueueRef = useRef<(() => void) | null>(null)

  processSendQueueRef.current = () => {
    if (
      sendQueueRef.current.length === 0 ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      isSendingRef.current = false
      return
    }

    isSendingRef.current = true
    const message = sendQueueRef.current.shift()

    if (message) {
      try {
        console.log(
          '发送消息:',
          message,
          '队列剩余:',
          sendQueueRef.current.length,
          '缓冲区大小:',
          wsRef.current.bufferedAmount
        )
        wsRef.current.send(message)
        console.log('消息发送成功, 缓冲区大小:', wsRef.current.bufferedAmount)

        // 检查缓冲区是否已满
        if (wsRef.current.bufferedAmount > 0) {
          console.log('缓冲区有数据，等待发送完成')
          // 等待缓冲区清空
          setTimeout(() => {
            processSendQueueRef.current?.()
          }, 50)
        } else {
          // 继续处理队列中的下一个消息
          setTimeout(() => {
            processSendQueueRef.current?.()
          }, 10)
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        isSendingRef.current = false
      }
    } else {
      isSendingRef.current = false
    }
  }

  // 发送消息队列 - 使用 useRef 避免循环依赖
  const sendMessageRef = useRef<((message: string) => void) | null>(null)

  sendMessageRef.current = (message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('WebSocket未连接，无法发送消息')
      return
    }

    sendQueueRef.current.push(message)

    if (!isSendingRef.current) {
      processSendQueueRef.current?.()
    }
  }

  const sendMessage = useCallback((message: string) => {
    sendMessageRef.current?.(message)
  }, [])

  // 初始化终端
  const initTerminal = useCallback(() => {
    if (!terminalRef.current || xtermRef.current) return

    const xterm = new XTerm({
      theme: {
        // 与首页玻璃风格一致：背景透明，由容器提供毛玻璃/卡片背景
        background: 'transparent',
        foreground: isDark ? '#e5e5e5' : '#111827',
        cursor: isDark ? '#ffffff' : '#111827',
        selectionBackground: isDark ? '#264f78' : '#add6ff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
      allowTransparency: true,
      allowProposedApi: true,
      // 启用右键菜单
      rightClickSelectsWord: true,
      // 不设置固定cols/rows，让FitAddon自动计算
      windowsMode: false,
      convertEol: false
    })

    // 添加插件
    const fitAddon = new FitAddon()
    const searchAddon = new SearchAddon()
    const webLinksAddon = new WebLinksAddon()

    xterm.loadAddon(fitAddon)
    xterm.loadAddon(searchAddon)
    xterm.loadAddon(webLinksAddon)

    xterm.open(terminalRef.current)

    // 保存引用
    xtermRef.current = xterm
    fitAddonRef.current = fitAddon
    searchAddonRef.current = searchAddon

    // 关键修复：立即fit并等待WebSocket连接后发送尺寸
    // 使用多次fit确保尺寸计算准确
    setTimeout(() => {
      fitAddon.fit()
    }, 0)

    setTimeout(() => {
      fitAddon.fit()
    }, 50)

    setTimeout(() => {
      fitAddon.fit()
      // fit完成后，如果WebSocket已连接，立即发送resize消息
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        xtermRef.current
      ) {
        const msg: TerminalMessage = {
          type: 'resize',
          data: '',
          cols: xtermRef.current.cols,
          rows: xtermRef.current.rows
        }
        console.log('初始化后发送终端尺寸:', msg)
        sendMessage(JSON.stringify(msg))
      }
    }, 100)

    // 处理用户输入
    xterm.onData(data => {
      console.log(
        '终端输入:',
        data,
        '长度:',
        data.length,
        'WebSocket状态:',
        wsRef.current?.readyState
      )
      const msg: TerminalMessage = {
        type: 'input',
        data: data
      }
      console.log('准备发送输入消息:', msg)

      // 使用队列发送消息，确保消息不丢失
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          console.log(
            '发送消息:',
            JSON.stringify(msg),
            '缓冲区大小:',
            wsRef.current.bufferedAmount
          )
          wsRef.current.send(JSON.stringify(msg))
          console.log('消息发送成功, 缓冲区大小:', wsRef.current.bufferedAmount)
        } catch (error) {
          console.error('发送失败:', error)
          // 如果发送失败，将消息加入队列重试
          sendQueueRef.current.push(JSON.stringify(msg))
          if (!isSendingRef.current) {
            processSendQueueRef.current?.()
          }
        }
      } else {
        console.log('WebSocket未连接，将消息加入队列')
        sendQueueRef.current.push(JSON.stringify(msg))
        if (!isSendingRef.current) {
          processSendQueueRef.current?.()
        }
      }
    })

    // 处理终端大小变化 - xterm内部尺寸变化时触发
    xterm.onResize(size => {
      console.log('终端尺寸变化:', size)
      const msg: TerminalMessage = {
        type: 'resize',
        data: '',
        cols: size.cols,
        rows: size.rows
      }
      // 立即发送给后端，确保PTY尺寸同步
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(msg))
        } catch (error) {
          console.error('发送resize消息失败:', error)
        }
      } else {
        // 如果WebSocket未连接，加入队列
        sendMessage(JSON.stringify(msg))
      }
    })

    // 处理窗口大小变化 - 浏览器窗口resize时触发
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      // 防抖：避免频繁调用
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        if (fitAddonRef.current) {
          console.log('窗口大小变化，重新fit')
          fitAddonRef.current.fit()
          // fit()会触发xterm.onResize，自动发送resize消息到后端
        }
      }, 100) // 100ms 防抖
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark])

  // 连接WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    // 检查组件是否仍然挂载
    if (!isMounted) return

    setIsConnecting(true)

    const wsUrl = `/api/v1/terminal/ws`

    // 获取 token
    const token =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    if (!token) {
      message.error('认证失败，请重新登录')
      setIsConnecting(false)
      return
    }

    try {
      // 使用 subprotocol 传递 token
      const ws = new WebSocket(wsUrl, [`token.${token}`])
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket连接成功')
        setIsConnected(true)
        setIsConnecting(false)

        // 关键修复：连接成功后立即发送终端尺寸到后端
        // 必须在接收任何输出之前完成，确保后端PTY尺寸与前端xterm一致
        setTimeout(() => {
          if (
            xtermRef.current &&
            wsRef.current?.readyState === WebSocket.OPEN
          ) {
            const msg: TerminalMessage = {
              type: 'resize',
              data: '',
              cols: xtermRef.current.cols,
              rows: xtermRef.current.rows
            }
            console.log('WebSocket连接后发送终端尺寸:', msg)
            try {
              wsRef.current.send(JSON.stringify(msg))
              console.log('终端尺寸发送成功')
            } catch (error) {
              console.error('发送初始尺寸失败:', error)
            }
          }
        }, 50) // 稍微延迟，确保连接完全建立
      }

      ws.onmessage = event => {
        try {
          const msg: TerminalMessage = JSON.parse(event.data)
          // 减少日志输出，避免控制台刷屏
          if (msg.type !== 'output') {
            console.log('收到WebSocket消息:', msg.type)
          }

          switch (msg.type) {
            case 'session':
              setSessionId(msg.data)
              console.log('终端会话ID:', msg.data)
              break
            case 'output':
              if (xtermRef.current && msg.data) {
                // 关键修复：直接写入，不做任何处理
                // xterm.js 会自动处理ANSI转义序列和换行
                try {
                  xtermRef.current.write(msg.data)
                } catch (error) {
                  console.error('写入终端数据失败:', error)
                }
              }
              break
            case 'error':
              console.error('终端错误:', msg.data)
              message.error(`终端错误: ${msg.data}`)
              break
            case 'pong':
              // 心跳响应，不需要处理
              break
            default:
              console.warn('未知消息类型:', msg.type)
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error, event.data)
        }
      }

      ws.onclose = event => {
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        // 只有在组件仍然挂载且不是正常关闭时才重连
        if (isMounted && event.code !== 1000) {
          message.warning('终端连接已断开，3秒后尝试重连...')
          // 自动重连
          reconnectTimeoutRef.current = setTimeout(() => {
            // 再次检查组件是否仍然挂载
            if (isMounted) {
              connectWebSocket()
            }
          }, 3000)
        }
      }

      ws.onerror = error => {
        setIsConnecting(false)
        console.error('WebSocket连接错误:', error)
        message.error('终端连接失败，3秒后尝试重连...')

        // 连接失败时也尝试重连
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              connectWebSocket()
            }
          }, 3000)
        }
      }
    } catch (error) {
      setIsConnecting(false)
      console.error('创建WebSocket连接失败:', error)
      message.error('创建终端连接失败')
    }
  }, [isMounted])

  // 断开连接
  const disconnect = useCallback(() => {
    // 清理重连定时器
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // 关闭 WebSocket 连接
    if (wsRef.current) {
      wsRef.current.close(1000, '用户主动断开')
      wsRef.current = null
    }

    // 重置状态
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  // 重新连接
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connectWebSocket()
    }, 500)
  }, [disconnect, connectWebSocket])

  // 搜索功能
  const handleSearch = useCallback((term: string) => {
    if (searchAddonRef.current && term) {
      searchAddonRef.current.findNext(term)
    }
  }, [])

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      terminalRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // 清理终端
  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      // 可选：向后端发送 Ctrl+L 来清屏
      const msg: TerminalMessage = {
        type: 'input',
        data: '\x0c' // Ctrl+L
      }
      sendMessage(JSON.stringify(msg))
    }
  }, [sendMessage])

  // 重置终端（更彻底的清理）
  const resetTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.reset()
      // 向后端发送 reset 命令
      const msg: TerminalMessage = {
        type: 'input',
        data: 'reset\r' // 执行 reset 命令
      }
      sendMessage(JSON.stringify(msg))
    }
  }, [sendMessage])

  // 初始化
  useEffect(() => {
    const cleanup = initTerminal()
    return cleanup
  }, [initTerminal])

  // 更新主题
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = {
        background: 'transparent',
        foreground: isDark ? '#e5e5e5' : '#111827',
        cursor: isDark ? '#ffffff' : '#111827',
        selectionBackground: isDark ? '#264f78' : '#add6ff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      }
    }
  }, [isDark])

  // 自动连接和组件卸载时清理资源
  useEffect(() => {
    // 延迟连接，给后端一些启动时间
    const connectTimer = setTimeout(() => {
      connectWebSocket()
    }, 500)

    return () => {
      // 清理连接定时器
      clearTimeout(connectTimer)

      // 组件卸载时自动断开连接
      setIsMounted(false)

      // 清理重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // 清理发送队列
      sendQueueRef.current = []
      isSendingRef.current = false

      // 关闭 WebSocket 连接
      if (wsRef.current) {
        wsRef.current.close(1000, '组件卸载')
        wsRef.current = null
      }

      // 重置状态
      setIsConnected(false)
      setIsConnecting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div
      className={`terminal-container chatgpt-card ${className} ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* 终端工具栏 */}
      <div className="terminal-toolbar">
        <div className="terminal-toolbar-left">
          {sessionId && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              会话: {sessionId.slice(-8)}
            </Text>
          )}
        </div>

        <div className="terminal-toolbar-right">
          <Space>
            {/* 连接状态 */}
            <div
              className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
            >
              <div className="status-dot" />
              <Text type={isConnected ? 'success' : 'danger'}>
                {isConnected ? '已连接' : isConnecting ? '连接中...' : '未连接'}
              </Text>
            </div>

            {/* 搜索按钮 */}
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setShowSearch(!showSearch)}
              size="small"
            />

            {/* 设置按钮 */}
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(true)}
              size="small"
            />

            {/* 全屏按钮 */}
            <Button
              type="text"
              icon={<FullscreenOutlined />}
              onClick={toggleFullscreen}
              size="small"
            />

            {/* 重连按钮 */}
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={reconnect}
              loading={isConnecting}
              size="small"
            />

            {/* 断开按钮 */}
            <Button
              type="text"
              icon={<DisconnectOutlined />}
              onClick={disconnect}
              disabled={!isConnected}
              size="small"
            />
          </Space>
        </div>
      </div>

      {/* 搜索栏 */}
      {showSearch && (
        <div className="terminal-search">
          <input
            type="text"
            placeholder="搜索终端内容..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearch(searchTerm)
              }
            }}
            className="search-input"
          />
          <Button
            type="primary"
            size="small"
            onClick={() => handleSearch(searchTerm)}
          >
            搜索
          </Button>
        </div>
      )}

      {/* 终端内容 */}
      <div className="terminal-content" ref={terminalRef} />

      {/* 设置模态框 */}
      <Modal
        title="终端设置"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        width={400}
      >
        <div className="terminal-settings">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={clearTerminal} block>
              清空终端 (Ctrl+L)
            </Button>
            <Button onClick={resetTerminal} block type="primary">
              重置终端 (执行 reset 命令)
            </Button>
            <Button onClick={reconnect} block loading={isConnecting}>
              重新连接
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  )
}

export default Terminal
