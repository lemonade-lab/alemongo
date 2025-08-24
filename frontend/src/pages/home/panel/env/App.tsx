import { message } from 'antd'
import { useEffect, useState } from 'react'
import FileEdit from '@/commom/edit/FileEdit'
import Box from '@/commom/layout/Box'
import { apiBotEnv, apiBotEnvUpdate } from '@/api/bot/env'
import { getBotName } from '../core'
const SSHUpdate = () => {
  const [data, setData] = useState<string>('')

  useEffect(() => {
    // 获取当前配置数据
    const name = getBotName()
    if (!name) {
      message.error('错误访问')
      return
    }
    apiBotEnv({
      name: name
    }).then(res => {
      setData(res)
    })
  }, [])

  const updateContent = (value: string) => {
    const botName = getBotName()
    apiBotEnvUpdate({
      name: botName,
      content: value
    })
      .then(() => {
        message.success('更新成功')
      })
      .catch(() => {
        message.error('保存失败，请重试')
      })
  }

  const onSave = (_name: string, value: string) => {
    updateContent(value)
  }
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col  transition-colors flex-1">
        <FileEdit disableName={true} onSave={onSave} name=".env" value={data} />
      </div>
    </Box>
  )
}

export default SSHUpdate
