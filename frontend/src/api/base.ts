import { message } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { emitSessionExpired } from '@/utils/authEvent'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 1000 * 60 * 3, // 3分钟超时
  withCredentials: true // 自动发送 cookie
})

export const LOGIN_FLAG_KEY = 'alemongo:logged_in'

export const QQ_TEMPLATE_KEY = 'alemongo:qq:template'

const getContentType = (method: string) => {
  if (method === 'DELETE') return 'multipart/form-data'
  return method === 'GET'
    ? 'application/json'
    : 'application/x-www-form-urlencoded'
}

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

type MethodType = keyof typeof Method

let count = 0

export const server = async <T = any>(
  config: AxiosRequestConfig & {
    method: MethodType
  }
): Promise<T> => {
  const { headers, ...cfg } = config
  // 判断请求是否符合规范
  if (!Method[cfg.method]) {
    message.error('请求方法不正确，请检查请求配置')
    return Promise.reject(new Error('请求方法不正确'))
  }
  return new Promise((resolve, reject) => {
    api({
      headers: {
        'Content-Type': getContentType(cfg.method || 'GET'),
        ...headers
      },
      ...cfg
    })
      .then(res => {
        count = 0 // 重置错误计数
        resolve(res.data)
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          localStorage.removeItem(LOGIN_FLAG_KEY)
          if (window.location.pathname === '/login') {
            window.location.href = '/login'
          } else {
            emitSessionExpired()
          }
        } else if (err?.response?.data?.msg) {
          message.error(err.response.data.msg)
        } else if (err?.response?.status === 404) {
          message.error('API未找到，请检查网络连接或联系管理员')
        } else if (err?.response?.status === 500) {
          count++
          if (count > 15) {
            window.location.href = '/login'
            return
          } else if (count > 5) {
            message.error(`服务器错误,10s后退出(${15 - count}s)`)
            return
          }
          message.error('服务器错误，请稍后再试')
        }
        reject(err?.response?.data || {})
      })
  })
}

export const request = async <T = any>(
  config: AxiosRequestConfig & {
    method: MethodType
  }
): Promise<T> => {
  const { headers, ...cfg } = config
  // 判断请求是否符合规范
  if (!Method[cfg.method]) {
    message.error('请求方法不正确，请检查请求配置')
    return Promise.reject(new Error('请求方法不正确'))
  }
  return new Promise((resolve, reject) => {
    api({
      headers: {
        'Content-Type': getContentType(cfg.method || 'GET'),
        ...headers
      },
      ...cfg
    })
      .then(res => {
        count = 0 // 重置错误计数
        resolve(res.data)
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          localStorage.removeItem(LOGIN_FLAG_KEY)
          // 如果已在登录页则跳转，否则弹出登录弹窗
          if (window.location.pathname === '/login') {
            window.location.href = '/login'
          } else {
            emitSessionExpired()
          }
        } else if (err?.response?.data?.msg) {
          message.error(err.response.data.msg)
        } else if (err?.response?.status === 404) {
          message.error('API未找到，请检查网络连接或联系管理员')
        } else if (err?.response?.status === 500) {
          count++
          if (count > 15) {
            window.location.href = '/login'
            return
          } else if (count > 5) {
            message.error(`服务器错误,10s后退出(${15 - count}s)`)
            return
          }
          message.error('服务器错误，请稍后再试')
        }
        reject(err?.response?.data || {})
      })
  })
}

export default server
