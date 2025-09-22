// 终端相关类型定义

export interface TerminalMessage {
  type: 'input' | 'output' | 'resize' | 'session' | 'error' | 'ping' | 'pong'
  data: string
  cols?: number
  rows?: number
}

export interface TerminalSession {
  id: string
  last_used: string
  status: 'active' | 'inactive'
}

export interface TerminalSessionsResponse {
  sessions: TerminalSession[]
  count: number
}

export interface TerminalConfig {
  theme: 'dark' | 'light'
  fontSize: number
  fontFamily: string
  cursorBlink: boolean
  cursorStyle: 'block' | 'underline' | 'bar'
  scrollback: number
  tabStopWidth: number
  bellStyle: 'none' | 'visual' | 'sound' | 'both'
}

export interface TerminalTheme {
  background: string
  foreground: string
  cursor: string
  selection: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
}

export interface TerminalProps {
  className?: string
  onClose?: () => void
  config?: Partial<TerminalConfig>
  theme?: Partial<TerminalTheme>
}

export interface TerminalState {
  isConnected: boolean
  isConnecting: boolean
  sessionId: string
  showSearch: boolean
  searchTerm: string
  isFullscreen: boolean
  showSettings: boolean
}

export interface TerminalHook {
  terminal: TerminalState
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  clear: () => void
  search: (term: string) => void
  toggleFullscreen: () => void
  toggleSearch: () => void
  toggleSettings: () => void
}

// 默认配置
export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  cursorBlink: true,
  cursorStyle: 'block',
  scrollback: 1000,
  tabStopWidth: 4,
  bellStyle: 'none'
}

// 默认主题
export const DEFAULT_TERMINAL_THEMES: Record<string, TerminalTheme> = {
  dark: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#ffffff',
    selection: '#264f78',
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
  light: {
    background: '#ffffff',
    foreground: '#000000',
    cursor: '#000000',
    selection: '#add6ff',
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

// WebSocket 事件类型
export enum WebSocketEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  ERROR = 'error',
  RECONNECT = 'reconnect'
}

// 终端事件类型
export enum TerminalEventType {
  DATA = 'data',
  RESIZE = 'resize',
  CLEAR = 'clear',
  SEARCH = 'search',
  FULLSCREEN = 'fullscreen',
  SETTINGS = 'settings'
}

// 错误类型
export enum TerminalErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface TerminalError {
  type: TerminalErrorType
  message: string
  details?: string
  timestamp: number
}
