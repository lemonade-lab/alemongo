import {
  apiBotConfig,
  apiBotConfigs,
  apiBotConfigsList,
  apiBotConfigUpdate
} from '@/api'
import { useEffect, useState } from 'react'
import { Button, message, Select } from 'antd'
import { getBotName } from '../core'
import Box from '@/commom/layout/Box'
import JSONEdit from '@/commom/edit/JSONEdit'

const Conifg = () => {
  const [yamlData, setYamlData] = useState<string>('')

  const [concifgNames, setConfigNames] = useState<string[]>([])
  useEffect(() => {
    apiBotConfigsList().then(res => {
      setConfigNames(res)
    })
  }, [])

  useEffect(() => {
    const name = getBotName()
    apiBotConfig({
      name: name
    }).then(res => {
      setYamlData(res)
    })
  }, [])
  const onSave = (_name: string, value: string) => {
    const name = getBotName()
    apiBotConfigUpdate({
      name: name,
      content: value
    })
      .then(() => {
        message.success('保存成功')
        setYamlData(value)
      })
      .catch(() => {
        message.error('保存失败，请重试')
      })
  }
  const [isLoading, setIsLoading] = useState(false)
  const [select, setSelect] = useState<string>('')
  return (
    <Box>
      <JSONEdit
        name="alemon.yaml"
        disabledName
        value={yamlData}
        onSave={onSave}
        // onChange={setYamlData}
        rightHeader={
          <div className="flex gap-2">
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="label"
              className="min-w-40"
              loading={isLoading}
              value={select}
              onChange={value => setSelect(value)}
              options={concifgNames.map(item => ({
                label: item,
                value: item
              }))}
            />
            <Button
              loading={isLoading}
              type="primary"
              onClick={() => {
                if (!select) {
                  message.warning('请选择配置文件后引入当前配置')
                  return
                }
                setIsLoading(true)
                apiBotConfigs({
                  name: select
                })
                  .then(res => {
                    setYamlData(res)
                    message.success('引入成功，请确认保存')
                  })
                  .finally(() => {
                    setIsLoading(false)
                  })
              }}
            >
              引入
            </Button>
          </div>
        }
        type="yaml"
      />
    </Box>
  )
}

export default Conifg
