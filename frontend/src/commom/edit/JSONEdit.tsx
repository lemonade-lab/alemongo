import { Button, Input, message } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import YAML from 'js-yaml'
import MonacoEditor from './CodeEditor'
import useCodeTheme from '@/hook/useCodeTheme'
import {
  SaveOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const safeDecode = (val: string, type: 'json' | 'yaml') => {
  let obj
  if (type === 'yaml') {
    obj = YAML.load(val)
  } else {
    obj = JSON.parse(val)
  }
  if (typeof obj !== 'object' || obj == null) obj = {}
  return obj
}

const JSONEdit = ({
  name,
  value,
  onSave,
  disabledName = false,
  type = 'json',
  rightHeader = null
}: {
  name?: string
  value: string
  onSave: (name: string, value: string) => void
  disabledName?: boolean
  type?: 'json' | 'yaml'
  rightHeader?: React.ReactNode
}) => {
  const [codeData, setCodeData] = useState<string>('')
  const [disabled, setDisabled] = useState(false)
  const [nameValue, setNameValue] = useState<string>('')
  const theme = useCodeTheme() as 'light' | 'dark'

  // 初始化数据
  useEffect(() => {
    try {
      if (value) {
        const parsed = safeDecode(value, type)
        setCodeData(
          type === 'yaml'
            ? YAML.dump(parsed)
            : JSON.stringify(parsed, null, 2)
        )
      } else {
        setCodeData(type === 'yaml' ? '' : '{}')
      }
      setDisabled(false)
    } catch {
      setCodeData(value)
      setDisabled(true)
    }
  }, [value, type])

  const handleCodeChange = useCallback(
    (val: string | undefined) => {
      const v = val ?? ''
      setCodeData(v)
      try {
        safeDecode(v, type)
        setDisabled(false)
      } catch {
        setDisabled(true)
      }
    },
    [type]
  )

  const handleSave = () => {
    if (!nameValue) {
      message.error('名称不能为空')
      return
    }
    try {
      onSave(nameValue, codeData)
    } catch {
      message.error('保存失败，请重试')
    }
  }

  useEffect(() => {
    if (name) setNameValue(name)
  }, [name])

  return (
    <div className="w-full h-full flex flex-col border dark:border-zinc-700">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          {!disabledName && (
            <Input
              value={nameValue}
              placeholder="配置名称"
              allowClear
              onChange={e => setNameValue(e.target.value)}
              style={{ width: 200 }}
            />
          )}
          {disabledName && (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {nameValue}
            </span>
          )}
          {disabled && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <ExclamationCircleOutlined className="text-red-500" />
              <span className="text-red-600 dark:text-red-400 text-sm">
                格式错误
              </span>
            </div>
          )}
          {!disabled && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <CheckCircleOutlined className="text-green-500" />
              <span className="text-green-600 dark:text-green-400 text-sm">
                格式正确
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {rightHeader || null}
          <Button
            disabled={disabled}
            onClick={handleSave}
            type="primary"
            icon={<SaveOutlined />}
          >
            保存
          </Button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900">
        <div className="h-full">
          <MonacoEditor
            value={codeData}
            language={type}
            onChange={handleCodeChange}
            theme={theme}
          />
        </div>
      </div>
    </div>
  )
}

export default JSONEdit
