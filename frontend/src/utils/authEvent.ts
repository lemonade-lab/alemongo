/**
 * 认证事件管理器
 * 用于在 API 拦截器与 UI 组件之间通信，
 * 当会话过期时触发登录弹窗而非跳转登录页。
 */

type AuthEventListener = () => void

const listeners: Set<AuthEventListener> = new Set()

/** 标记是否已经触发了未授权事件（防止重复弹窗） */
let fired = false

/** 订阅会话过期事件 */
export function onSessionExpired(listener: AuthEventListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 触发会话过期事件（供 API 拦截器调用） */
export function emitSessionExpired() {
  if (fired) return
  fired = true
  listeners.forEach(fn => fn())
}

/** 重置触发状态（重新登录成功后调用） */
export function resetSessionExpired() {
  fired = false
}
