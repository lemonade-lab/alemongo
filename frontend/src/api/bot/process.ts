import { request } from '../base'

export interface PortInfo {
  protocol: string
  local: string
  remote: string
  state: string
}

export interface ProcessPortInfo {
  pid: number
  ports: PortInfo[]
  error?: string
}

// 获取进程占用的端口信息
export const apiGetProcessPorts = async (
  pid: number
): Promise<ProcessPortInfo> => {
  return new Promise((resolve, reject) => {
    request({
      url: `/bot/process/${pid}/ports`,
      method: 'GET'
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}
