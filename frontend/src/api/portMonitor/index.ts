import { request } from '../base'

export interface PortInfo {
  protocol: string
  local: string
  remote: string
  state: string
  pid: string
}

// 获取所有端口信息
export const apiGetAllPorts = async (): Promise<PortInfo[]> => {
  return request({
    url: '/port-monitor/ports',
    method: 'GET'
  }).then(res => res.data)
}

// 根据端口号获取端口信息
export const apiGetPortsByPort = async (port: number): Promise<PortInfo[]> => {
  return request({
    url: `/port-monitor/ports/${port}`,
    method: 'GET'
  }).then(res => res.data)
}

// 根据进程名获取端口信息
export const apiGetPortsByProcess = async (
  processName: string
): Promise<PortInfo[]> => {
  return request({
    url: '/port-monitor/process',
    method: 'GET',
    params: { process: processName }
  }).then(res => res.data)
}
