import { TOKEN_KEY } from '@/api/base'

export function createAuthedWS(path: string): WebSocket {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const url = `${protocol}://${host}/api/v1${path}`
  // use subprotocol to carry token
  return new WebSocket(url, token ? [`token.${token}`] : undefined)
}
