import { request } from '../base'

export type FirewallStatusResponse = {
  os: string
  pfctlInstalled?: boolean
  pfEnabled?: boolean
  info?: string
  rulesPreview?: string
  error?: string
  supported: boolean
  backend?: string
  unsupportedReason?: string
  nextActions?: string[]
}

export const apiFirewallStatus = async (): Promise<FirewallStatusResponse> => {
  const res = await request({ url: '/system/firewall/status', method: 'GET' })
  const { data } = res as {
    code: number
    msg: string
    data: FirewallStatusResponse
  }
  return data
}

export type FirewallPlanRequest = {
  action:
    | 'enable'
    | 'disable'
    | 'reload'
    | 'allow'
    | 'block'
    | 'list'
    | 'remove'
  port?: number
  protocol?: 'tcp' | 'udp'
  comment?: string
  execute?: boolean
  commandsOverride?: string[]
  fingerprint?: string
}

export type FirewallPlanResponse = {
  os: string
  plannedCommands: string[]
  executed: boolean
  message: string
  taskId?: string
  supported?: boolean
  backend?: string
  unsupportedReason?: string
  nextActions?: string[]
  executionErrors?: string[]
  fingerprint?: string
  alreadyExists?: boolean
}

export const apiFirewallPlan = async (
  body: FirewallPlanRequest
): Promise<FirewallPlanResponse> => {
  const res = await request({
    url: '/system/firewall/plan',
    method: 'POST',
    data: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
  const { data } = res as {
    code: number
    msg: string
    data: FirewallPlanResponse
  }
  return data
}
