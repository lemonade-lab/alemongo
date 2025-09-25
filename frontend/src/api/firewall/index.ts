import { request } from '../base'

export interface FirewallStatusResponse {
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

export interface FirewallPlanRequest {
  action: string
  port?: number
  protocol?: string
  comment?: string
  execute?: boolean
  commandsOverride?: string[]
}

export interface FirewallPlanResponse {
  os: string
  plannedCommands: string[]
  executed: boolean
  message: string
  taskId?: string
  supported: boolean
  backend?: string
  unsupportedReason?: string
  nextActions?: string[]
  executionErrors?: string[]
}

export const getFirewallStatus = () =>
  request({
    method: 'GET',
    url: '/system/firewall/status'
  }) as Promise<FirewallStatusResponse>

export const planFirewall = (data: FirewallPlanRequest) =>
  request({
    method: 'POST',
    url: '/system/firewall/plan',
    data
  }) as Promise<FirewallPlanResponse>

export default {
  getFirewallStatus,
  planFirewall
}
