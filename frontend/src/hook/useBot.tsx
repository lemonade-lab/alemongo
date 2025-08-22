import {
  apiBotInfo,
  apiBotRun,
  apiBotStop,
  apiBotYarnInstall,
  BotInfo
} from '@/api'
import { getBotName } from '@/pages/home/panel/core'
import { message } from 'antd'
import { useEffect, useRef, useState } from 'react'

const useBot = () => {
  const [info, setInfo] = useState<BotInfo>({
    name: '',
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: '',
    port: 0
  })
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onUpdate = (name: string) => {
    apiBotInfo({
      name
    }).then(res => {
      setInfo(res)
    })
  }

  useEffect(() => {
    const name = getBotName()
    onUpdate(name)
    return () => {
      // 清除轮训
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
      }
    }
  }, [])

  const [isLoading, setLoading] = useState(false)

  // 开始轮训
  const startPollingInstall = (name: string) => {
    pollingRef.current = setTimeout(() => {
      apiBotInfo({ name }).then(res => {
        if (!res.node_modules) {
          startPollingInstall(name)
          return
        }
        message.success('依赖安装完成')
        setInfo(res)
        // 去掉loading
        setLoading(false)
      })
    }, 1000)
  }

  const onInstall = (name: string) => {
    if (isLoading) {
      message.warning('正在安装中，请稍后')
      return
    }
    setLoading(true)
    // 安装依赖
    apiBotYarnInstall({
      name
    })
      .then(() => {
        startPollingInstall(name)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onRun = (name: string) => {
    apiBotRun({
      name
    }).then(() => {
      onUpdate(name)
    })
  }

  const onStop = (name: string) => {
    apiBotStop({
      name
    }).then(() => {
      onUpdate(name)
    })
  }

  const control = {
    info,
    isLoading,
    setLoading,
    onInstall,
    onUpdate,
    onRun,
    onStop
  }

  return [control]
}

export default useBot
