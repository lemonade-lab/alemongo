import { Button, Input, message, Form } from 'antd'
import { useEffect, useState } from 'react'
import YAML from 'js-yaml'
import JSONForm from './JSONForm'
import { nameMap } from '../config/NameMap'
import MonacoEditor from './MonacoEditor'
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
  const theme = useCodeTheme()

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
  const handleCodeChange = (val: string | undefined) => {
    const value = val ?? ''
    setCodeData(value)
    try {
      safeDecode(value, type)
      setDisabled(false)
    } catch {
      setDisabled(true)
    }
  }

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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
      {/* 顶部工具栏 */}
      <div className="flex flex-col sm:flex-row  items-end  sm:items-center justify-end sm:justify-between gap-2 sm:gap-4 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-700/50 rounded-t-xl mobile-p-3">
        <div className="flex items-center gap-3 justify-center">
          {!disabledName && (
            <div className="relative mobile-w-full">
              <Input
                value={nameValue}
                placeholder="配置名称"
                allowClear
                onChange={e => setNameValue(e.target.value)}
                style={{ minWidth: 120 }}
              />
            </div>
          )}
          {disabledName && (
            <div className="px-2 py-1 bg-white/70 dark:bg-zinc-800/70 border border-gray-300/50 dark:border-zinc-600/50 rounded-lg min-w-[120px] inline-block mobile-w-full mobile-text-center">
              <span className="text-gray-700 dark:text-gray-200 font-medium mobile-text-sm">
                {nameValue}
              </span>
            </div>
          )}
          {disabled && (
            <div className="flex items-center w-44 gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-lg">
              <ExclamationCircleOutlined className="text-red-500 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400 text-sm font-medium mobile-text-xs">
                格式错误
              </span>
            </div>
          )}
          {!disabled && (
            <div className="flex items-center gap-2 w-44 px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50 rounded-lg">
              <CheckCircleOutlined className="text-green-500 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 text-sm font-medium mobile-text-xs">
                格式正确
              </span>
            </div>
          )}
        </div>
        <div className="flex items-end gap-3  justify-center">
          {rightHeader || null}
          <Button
            disabled={disabled}
            onClick={handleSave}
            type="primary"
            icon={<SaveOutlined />}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0  hover:shadow-xl transition-all duration-300 rounded-lg"
          >
            保存
          </Button>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex flex-row bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-zinc-700/50">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={`
              flex items-center gap-2 py-1 px-3 sm:px-6 sm:py-3 focus:outline-none transition-all duration-300 font-medium mobile-button touch-optimized mobile-w-full mobile-justify-center mobile-h-12
              ${
                activeKey === tab.key
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
              }
            `}
            onClick={() => handleModeChange(tab.key as 'form' | 'code')}
            type="button"
          >
            {tab.icon}
            <span className="mobile-text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-b-xl overflow-hidden">
        {activeKey === 'form' && (
          <div className="flex-1 p-6 overflow-auto mobile-p-3 mobile-scroll">
            <Form
              form={form}
              labelCol={{ span: 6 }}
              onValuesChange={handleFormChange}
              className="h-full"
            >
              <div className="flex flex-col gap-4">
                <JSONForm
                  data={formData}
                  map={nameMap}
                  handleAddChild={handleAddChild}
                  handleDelChild={handleDelChild}
                />
              </div>
            </Form>
          </div>
        )}
        {activeKey === 'code' && (
          <div className="flex-1 flex flex-col min-h-0 p-2 mobile-p-1">
            <div className="flex-1 rounded-lg overflow-hidden border border-gray-200/50 dark:border-zinc-700/50 shadow-inner">
              <MonacoEditor
                value={codeData}
                disabled={disabled}
                onSave={handleSave}
                language={type}
                width="100%"
                height="100%"
                onChange={handleCodeChange}
                theme={theme}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JSONEdit
