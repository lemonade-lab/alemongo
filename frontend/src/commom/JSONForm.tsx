import {
  Button,
  Input,
  message,
  Dropdown,
  Space,
  MenuProps,
  Switch
} from 'antd'
import { useState } from 'react'
import { Form } from 'antd'
import classNames from 'classnames'
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  ClearOutlined,
  MinusOutlined,
  FileTextOutlined,
  FolderOutlined,
  UnorderedListOutlined,
  CheckOutlined
} from '@ant-design/icons'

type BaseType = string | number | string[] | number[]
type ObjectType = {
  [key: string]: BaseType | ObjectType
}
type InputDataType = 'string' | 'object' | 'array' | 'boolean'

const JSONForm = ({
  data,
  map,
  handleAddChild,
  handleDelChild
}: {
  data: ObjectType
  map: { [key: string]: string }
  handleAddChild: (keyPath: string[], type: InputDataType) => void
  handleDelChild: (keyPath: string[]) => void
}) => {
  const [inputValue, setInputValue] = useState<{
    [key: string]: string
  }>({})
  const [mainInputValue, setMainInputValue] = useState<string>('')

  const items: MenuProps['items'] = [
    {
      key: 'add',
      type: 'group',
      label: '添加',
      children: [
        { key: 'string', label: '字符串', icon: <FileTextOutlined /> },
        { key: 'object', label: '对象', icon: <FolderOutlined /> },
        { key: 'array', label: '数组', icon: <UnorderedListOutlined /> },
        { key: 'boolean', label: '布尔值', icon: <CheckOutlined /> }
      ]
    },
    {
      key: 'delete',
      label: '删除',
      danger: true,
      icon: <DeleteOutlined />
    }
  ]
  const baseItems: MenuProps['items'] = [
    { key: 'string', label: '字符串', icon: <FileTextOutlined /> },
    { key: 'object', label: '对象', icon: <FolderOutlined /> },
    { key: 'array', label: '数组', icon: <UnorderedListOutlined /> },
    { key: 'boolean', label: '布尔值', icon: <CheckOutlined /> }
  ]

  const createConfigForm = (data: ObjectType, parentKey: string[] = []) => {
    return Object.keys(data).map(key => {
      const currentKey = [...parentKey, key]
      const domKey = currentKey.join('.')
      const isChild = parentKey.length > 0

      // 数组类型
      if (Array.isArray(data[key])) {
        return (
          <div
            key={domKey}
            className={classNames('transition-all duration-300', {
              'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4  shadow-lg hover:shadow-xl':
                !isChild,
              'bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/20 dark:to-slate-800/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 mb-4 shadow-md':
                isChild
            })}
          >
            <Form.List name={currentKey}>
              {(fields, { add, remove }) => (
                <div key={domKey} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={classNames('flex gap-2 items-center', {
                        'text-lg font-bold text-blue-700 dark:text-blue-300':
                          !isChild,
                        'text-sm font-medium text-gray-700 dark:text-gray-300':
                          isChild
                      })}
                    >
                      <UnorderedListOutlined className="text-blue-500 dark:text-blue-400" />
                      {map[key] || key} {isChild && ':'}
                    </div>
                    <Button
                      onClick={() => handleDelChild([...currentKey])}
                      danger
                      icon={<DeleteOutlined />}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      删除
                    </Button>
                  </div>
                  {fields.map(({ key: fieldKey, name, ...restField }) => (
                    <Form.Item
                      key={fieldKey}
                      {...restField}
                      name={name}
                      className="mb-0"
                      rules={[{ required: true, message: '请输入值' }]}
                    >
                      <Input
                        placeholder={`请输入 ${map[key] || key}`}
                        className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                      />
                    </Form.Item>
                  ))}
                  <div className="flex items-center justify-end gap-3 flex-1">
                    {fields.length > 0 && (
                      <>
                        <Button
                          type="dashed"
                          danger
                          icon={<ClearOutlined />}
                          onClick={() =>
                            handleAddChild([...currentKey], 'array')
                          }
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          清空
                        </Button>
                        <Button
                          type="dashed"
                          danger
                          icon={<MinusOutlined />}
                          onClick={() => remove(fields.length - 1)}
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          删除最后一项
                        </Button>
                      </>
                    )}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30 transition-all duration-300"
                      onClick={() => add()}
                    >
                      添加 {map[key] || key}
                    </Button>
                  </div>
                </div>
              )}
            </Form.List>
          </div>
        )
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        // 对象类型
        return (
          <div
            key={domKey}
            className={classNames('transition-all duration-300', {
              'bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-xl p-4  shadow-lg hover:shadow-xl':
                !isChild,
              'bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/20 dark:to-slate-800/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 mb-4 shadow-md':
                isChild
            })}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={classNames('flex gap-2 items-center', {
                  'text-lg font-bold text-purple-700 dark:text-purple-300':
                    !isChild,
                  'text-sm font-medium text-gray-700 dark:text-gray-300':
                    isChild
                })}
              >
                <FolderOutlined className="text-purple-500 dark:text-purple-400" />
                {map[key] || key}
              </div>
              <Space.Compact>
                <Input
                  className="w-24 bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300"
                  placeholder="key"
                  value={inputValue[domKey]}
                  onChange={e =>
                    setInputValue({ ...inputValue, [domKey]: e.target.value })
                  }
                />
                <Dropdown
                  menu={{
                    items,
                    onClick: ({ key }) => {
                      if (key === 'delete') {
                        handleDelChild([...currentKey])
                        return
                      }
                      if (!inputValue[domKey]) {
                        message.error('请输入key')
                        return
                      }
                      handleAddChild(
                        [...currentKey, inputValue[domKey]],
                        key as InputDataType
                      )
                    }
                  }}
                  trigger={['click']}
                >
                  <Button
                    onClick={e => e.stopPropagation()}
                    type="primary"
                    icon={<SettingOutlined />}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    操作
                  </Button>
                </Dropdown>
              </Space.Compact>
            </div>
            {createConfigForm(data[key] as ObjectType, currentKey)}
          </div>
        )
      } else if (typeof data[key] === 'boolean') {
        // 布尔值类型
        return (
          <div
            key={domKey}
            className={classNames(
              'flex flex-row gap-3 transition-all duration-300',
              {
                'bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl p-4  shadow-lg hover:shadow-xl':
                  !isChild,
                'bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/20 dark:to-slate-800/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 mb-4 shadow-md':
                  isChild
              }
            )}
          >
            <div className="flex-1 flex items-center gap-2">
              <CheckOutlined className="text-emerald-500 dark:text-emerald-400" />
              <Form.Item
                label={
                  <span
                    className={classNames({
                      'text-lg font-bold text-emerald-700 dark:text-emerald-300':
                        !isChild,
                      'text-sm font-medium text-gray-700 dark:text-gray-300':
                        isChild
                    })}
                  >
                    {map[key] || key}
                  </span>
                }
                name={currentKey}
                valuePropName="checked"
                className="mb-0"
              >
                <Switch
                  className="bg-gray-300 dark:bg-gray-600"
                  checkedChildren={<CheckOutlined className="text-white" />}
                />
              </Form.Item>
            </div>
            <Button
              onClick={() => handleDelChild([...currentKey])}
              danger
              icon={<DeleteOutlined />}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              删除
            </Button>
          </div>
        )
      }
      // 基本类型
      return (
        <div
          key={domKey}
          className={classNames(
            'flex flex-row gap-3 transition-all duration-300',
            {
              'bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-700/50 rounded-xl p-4  shadow-lg hover:shadow-xl':
                !isChild,
              'bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/20 dark:to-slate-800/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 mb-4 shadow-md':
                isChild
            }
          )}
        >
          <div className="flex-1 flex items-center gap-2">
            <FileTextOutlined className="text-orange-500 dark:text-orange-400" />
            <Form.Item
              label={
                <span
                  className={classNames({
                    'text-lg font-bold text-orange-700 dark:text-orange-300':
                      !isChild,
                    'text-sm font-medium text-gray-700 dark:text-gray-300':
                      isChild
                  })}
                >
                  {map[key] || key}
                </span>
              }
              name={currentKey}
              className="mb-0 flex-1"
            >
              <Input
                placeholder={key}
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300"
              />
            </Form.Item>
          </div>
          <Button
            onClick={() => handleDelChild([...currentKey])}
            danger
            icon={<DeleteOutlined />}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
          >
            删除
          </Button>
        </div>
      )
    })
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4  shadow-lg backdrop-blur-sm">
        <Space.Compact className="w-full">
          <Input
            placeholder="输入配置项名称"
            value={mainInputValue}
            onChange={e => {
              setMainInputValue(e.target.value)
            }}
            className="flex-1 bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
          />
          <Dropdown
            menu={{
              items: baseItems,
              onClick: ({ key }) => {
                if (!mainInputValue) {
                  message.error('请输入key')
                  return
                }
                handleAddChild([mainInputValue], key as InputDataType)
              }
            }}
            trigger={['click']}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6"
            >
              添加配置项
            </Button>
          </Dropdown>
        </Space.Compact>
      </div>
      {createConfigForm(data)}
    </>
  )
}

export default JSONForm
