import { apiBotPackage, apiBotPackageUpdate } from '@/api'
import { message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { getBotName } from '../core'
import Box from '@/commom/layout/Box'
import JSONEdit from '@/commom/edit/JSONEdit'

const Package = () => {
  const [pkgData, setPkgData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  /**
   * @param _name
   * @param value
   * @returns
   */
  const onSave = (_name: string, value: string) => {
    if (isLoading) {
      return
    }
    const name = getBotName()
    setIsLoading(true)
    apiBotPackageUpdate({
      name: name,
      content: value
    })
      .then(() => {
        message.success('保存成功')
      })
      .catch(() => {
        message.error('保存失败，请重试')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const initBotPackage = (name: string) => {
    apiBotPackage({
      name: name
    }).then(res => {
      setPkgData(res)
    })
  }

  useEffect(() => {
    const name = getBotName()
    initBotPackage(name)
  }, [])
  return (
    <Box>
      <Spin spinning={isLoading}>
        <JSONEdit
          onSave={onSave}
          disabledName
          name="package.json"
          value={pkgData}
        />
      </Spin>
    </Box>
  )
}

export default Package
