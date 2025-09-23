import { request } from '../base'

export type DepItem = {
  name: string
  installed: boolean
  version?: string
  path?: string
  manager?: string
  os?: string
  installCommands?: string[]
  notes?: string[]
  errors?: string[]
}

export type DepCheckResponse = {
  os: string
  manager: string
  items: DepItem[]
}

export const apiDepsCheck = async (
  names?: string[]
): Promise<DepCheckResponse> => {
  const params = new URLSearchParams()
  ;(names || []).forEach(n => params.append('names', n))
  const qs = params.toString()
  const res = await request({
    url: `/system/deps/check${qs ? `?${qs}` : ''}`,
    method: 'GET'
  })
  // 后端响应包裹为 { code, msg, data }
  const { data } = res as { code: number; msg: string; data: DepCheckResponse }
  return data
}

export type DepInstallRequest = {
  names: string[]
  execute?: boolean
  useNvm?: boolean
  nodeVersion?: string
  nvmVersion?: string
  commandsOverride?: Record<string, string[]>
}

export type DepInstallResponse = {
  os: string
  manager: string
  plannedCommands: Record<string, string[]>
  executed: boolean
  message: string
  taskId?: string
}

export const apiDepsInstall = async (
  body: DepInstallRequest
): Promise<DepInstallResponse> => {
  const res = await request({
    url: '/system/deps/install',
    method: 'POST',
    data: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
  const { data } = res as {
    code: number
    msg: string
    data: DepInstallResponse
  }
  return data
}
