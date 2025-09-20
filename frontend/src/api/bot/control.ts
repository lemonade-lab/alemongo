import { request } from "../base"
import { BotInfo } from "../types"

export const apiBotList = async (): Promise<BotInfo[]> => {
  return request({
    url: '/bot/list',
    method: 'GET'
  }).then(res => res.data)
}

/**
 *
 * @param data
 * @returns
 */
export const apiBotCreate = async (data: { name: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/create',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotRun = async (data: { name: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/run',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotStop = async (data: { name: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/stop',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotDelete = async (data: { name: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/info',
      method: 'DELETE',
      data: data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotInfo = async (data: { name: string }): Promise<BotInfo> => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/info',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}

export const apiBotCopy = async (data: { bot_name: string }) => {
  return new Promise((resolve, reject) => {
    request({
      url: '/bot/copy',
      method: 'POST',
      data
    })
      .then(res => res.data)
      .then(resolve)
      .catch(reject)
  })
}
