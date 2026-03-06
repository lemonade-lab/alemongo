export function createAuthedWS(path: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const url = `${protocol}://${host}/api/v1${path}`
  // cookie 会由浏览器自动携带，无需额外传递认证信息
  return new WebSocket(url)
}
