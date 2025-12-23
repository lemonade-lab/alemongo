import { Button, Input, message, Form } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import YAML from 'js-yaml'
import JSONForm from './JSONForm'
import { nameMap } from '../config/NameMap'
import MonacoEditor from './CodeEditor'
import cloneDeep from 'lodash/cloneDeep'
import useCodeTheme from '@/hook/useCodeTheme'
import {
  SaveOutlined,
  CodeOutlined,
  FormOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

type BaseType = string | number | string[] | number[]
type ObjectType = {
  [key: string]: BaseType | ObjectType
}
type InputDataType = 'string' | 'object' | 'array' | 'boolean'

const safeDecode = (val: string, type: 'json' | 'yaml'): ObjectType => {
  let obj
  if (type === 'yaml') {
    obj = YAML.load(val)
  } else {
    obj = JSON.parse(val)
  }
  if (typeof obj !== 'object' || obj == null) obj = {}
  return obj as ObjectType
}

const safeEncode = (val: ObjectType, type: 'json' | 'yaml'): string => {
  if (type === 'yaml') {
    return YAML.dump(val)
  } else {
    return JSON.stringify(val, null, 2)
  }
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
  const [formData, setFormData] = useState<ObjectType>({})
  const [codeData, setCodeData] = useState<string>('')
  const [form] = Form.useForm()
  const [disabled, setDisabled] = useState(false)
  const [nameValue, setNameValue] = useState<string>('')
  const [activeKey, setActiveKey] = useState<'form' | 'code'>('form')
  const theme = useCodeTheme() as 'light' | 'dark'

  // 初始化数据
  useEffect(() => {
    try {
      const initialData = value ? safeDecode(value, type) : {}
      const initialStr = safeEncode(initialData, type)
      setFormData(initialData)
      setCodeData(initialStr)
      form.resetFields()
      form.setFieldsValue(initialData)
      setDisabled(false)
    } catch {
      setDisabled(true)
    }
  }, [value, type, form])

  const handleFormChange = () => {
    const formData = form.getFieldsValue()
    setFormData(formData)
  }

  // 处理Code模式下的数据变化
  const handleCodeChange = useCallback(
    (val: string | undefined) => {
      const value = val ?? ''
      setCodeData(value)
      try {
        safeDecode(value, type)
        setDisabled(false)
      } catch {
        setDisabled(true)
      }
    },
    [type]
  )

  // 切换模式时的数据同步
  const handleModeChange = (newMode: 'form' | 'code') => {
    if (newMode === activeKey) return
    if (newMode === 'form') {
      // 切换到Form模式：将Code数据同步到Form
      try {
        const jsonData = safeDecode(codeData, type)
        setFormData(jsonData)
        form.setFieldsValue(jsonData)
        setDisabled(false)
      } catch {
        message.error('代码格式错误，无法切换到表单模式')
        return
      }
    } else {
      // 切换到Code模式：将Form数据同步到Code
      const str = safeEncode(formData, type)
      setCodeData(str)
      setDisabled(false)
    }
    setActiveKey(newMode)
  }

  const handleAddChild = (keyPath: string[], dataType: InputDataType) => {
    if (!Array.isArray(keyPath) || keyPath.length === 0) {
      message.error('非法路径')
      return
    }
    const newData = cloneDeep(formData)
    let status = true
    const updateNestedObject = (
      obj: Record<string, unknown>,
      keys: string[],
      value: ObjectType
    ) => {
      const [currentKey, ...restKeys] = keys
      if (restKeys.length === 0) {
        if (obj[currentKey] !== undefined) {
          message.warning(`key ${currentKey} 已存在，请使用其他名称`)
          status = false
          return
        }
        obj[currentKey] = value
      } else {
        if (!obj[currentKey] || typeof obj[currentKey] !== 'object') {
          obj[currentKey] = {}
        }
        updateNestedObject(
          obj[currentKey] as Record<string, unknown>,
          restKeys,
          value
        )
      }
    }
    const newValue = () => {
      switch (dataType) {
        case 'array':
          return []
        case 'object':
          return {}
        case 'string':
          return ''
        case 'boolean':
          return false
        default:
          return ''
      }
    }
    updateNestedObject(newData, keyPath, newValue())
    if (!status) return
    message.info('修改成功')
    setFormData(newData)
    form.setFieldsValue(newData)
  }

  const handleDelChild = (keyPath: string[]) => {
    if (!Array.isArray(keyPath) || keyPath.length === 0) {
      message.error('非法路径')
      return
    }
    const newData = cloneDeep(formData)
    const deleteNestedObject = (
      obj: Record<string, unknown>,
      keys: string[]
    ) => {
      const [currentKey, ...restKeys] = keys
      if (restKeys.length === 0) {
        delete obj[currentKey]
      } else {
        if (obj[currentKey] && typeof obj[currentKey] === 'object') {
          deleteNestedObject(
            obj[currentKey] as Record<string, unknown>,
            restKeys
          )
        }
      }
    }
    deleteNestedObject(newData, keyPath)
    setFormData(newData)
    form.setFieldsValue(newData)
  }

  const handleSave = () => {
    if (!nameValue) {
      message.error('名称不能为空')
      return
    }
    try {
      // 根据当前模式使用对应的数据
      let saveData: string
      if (activeKey === 'form') {
        saveData = safeEncode(formData, type)
      } else {
        saveData = codeData
      }
      onSave(nameValue, saveData)
    } catch {
      message.error('保存失败，请重试')
    }
  }

  useEffect(() => {
    if (name) setNameValue(name)
  }, [name])

  // ---------- 自定义Tab ----------
  const tabList = [
    { key: 'form', label: '表单', icon: <FormOutlined /> },
    {
      key: 'code',
      label: (
        <div className="flex items-center gap-2">
          源码
          <div className="text-xs text-gray-500 dark:text-gray-400">
            (可右键菜单)
          </div>
        </div>
      ),
      icon: <CodeOutlined />
    }
  ]

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

      {/* Tab 导航 */}
      <div className="flex border-b dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={`
              flex items-center gap-2 px-6 py-3 focus:outline-none transition-colors
              ${
                activeKey === tab.key
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
            onClick={() => handleModeChange(tab.key as 'form' | 'code')}
            type="button"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900">
        {activeKey === 'form' && (
          <div className="h-full p-4 overflow-auto">
            <Form
              form={form}
              labelCol={{ span: 6 }}
              onValuesChange={handleFormChange}
            >
              <JSONForm
                data={formData}
                map={nameMap}
                handleAddChild={handleAddChild}
                handleDelChild={handleDelChild}
              />
            </Form>
          </div>
        )}
        {activeKey === 'code' && (
          <div className="h-full">
            <MonacoEditor
              value={codeData}
              language={type}
              onChange={handleCodeChange}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default JSONEdit
