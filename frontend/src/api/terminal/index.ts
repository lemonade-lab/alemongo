import { request } from '../base'
import { TerminalSessionsResponse } from '@/components/Terminal/types'

// 获取终端会话列表
export const getTerminalSessions = (): Promise<TerminalSessionsResponse> => {
  return request({
    url: '/terminal/sessions',
    method: 'GET'
  })
}

// 关闭指定终端会话
export const closeTerminalSession = (
  sessionId: string
): Promise<{ message: string }> => {
  return request({
    url: `/terminal/sessions/${sessionId}`,
    method: 'DELETE'
  })
}
