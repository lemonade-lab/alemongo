import { request } from '../base'

/**
 * 流程：
 * 1. 绑定邮箱。得到验证码
 * 2. 校验验证码。成功后，邮箱绑定成功。
 */

/**
 * 绑定
 * @param data
 * @returns
 */
export const apiBindEmail = async (data: { email: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/user/bind_email',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

/**
 * 校验
 * @param data
 * @returns
 */
export const apiVerifyEmail = async data => {
  return new Promise((resolve, reject) => {
    request({
      url: '/user/verify_email',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}
