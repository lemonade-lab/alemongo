import { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message
} from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import {
  createMenuItem,
  defaultMenuItems,
  FIXED_MENU_ITEM_ID,
  menuRouteOptions,
  saveMenuItems,
  type EditableMenuItem
} from './menuItems'

const { Text } = Typography

const moveItem = (
  items: EditableMenuItem[],
  index: number,
  direction: 'up' | 'down'
): EditableMenuItem[] => {
  const nextIndex = direction === 'up' ? index - 1 : index + 1
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items
  }

  const nextItems = [...items]
  const [target] = nextItems.splice(index, 1)
  nextItems.splice(nextIndex, 0, target)
  return nextItems
}

const normalizeInternalPath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const isValidExternalUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const validateMenuItems = (items: EditableMenuItem[]): string | null => {
  for (const [index, item] of items.entries()) {
    if (!item.label.trim()) {
      return `第 ${index + 1} 项菜单名称不能为空`
    }

    if (item.targetType === 'external') {
      if (!isValidExternalUrl(item.key.trim())) {
        return `第 ${index + 1} 项外链必须是完整的 http(s) 地址`
      }
      continue
    }

    if (item.targetType === 'custom') {
      const normalizedPath = normalizeInternalPath(item.key)
      if (!normalizedPath || !normalizedPath.startsWith('/')) {
        return `第 ${index + 1} 项自定义路由格式不正确`
      }
      continue
    }

    if (!menuRouteOptions.some(option => option.value === item.key)) {
      return `第 ${index + 1} 项内部页面必须从预设页面中选择`
    }
  }

  return null
}

const MenuManager = ({
  open,
  items,
  onClose,
  onSave
}: {
  open: boolean
  items: EditableMenuItem[]
  onClose: () => void
  onSave: (items: EditableMenuItem[]) => void
}) => {
  const [draftItems, setDraftItems] = useState<EditableMenuItem[]>(items)

  useEffect(() => {
    if (open) {
      setDraftItems(items)
    }
  }, [items, open])

  const handleChange = (id: string, patch: Partial<EditableMenuItem>) => {
    setDraftItems(current =>
      current.map(item => {
        if (item.id !== id) {
          return item
        }

        const nextTargetType = patch.targetType ?? item.targetType
        const fallbackKey =
          nextTargetType === 'external'
            ? 'https://example.com'
            : nextTargetType === 'custom'
              ? '/custom-path'
              : menuRouteOptions[0]?.value || '/'

        const fallbackIconKey =
          nextTargetType === 'external'
            ? 'link'
            : nextTargetType === 'custom'
              ? 'code'
              : item.iconKey

        return {
          ...item,
          ...patch,
          iconKey: patch.iconKey ?? fallbackIconKey,
          key:
            patch.key !== undefined
              ? patch.key
              : nextTargetType !== item.targetType
                ? fallbackKey
                : item.key
        }
      })
    )
  }

  const handleSave = () => {
    const normalizedItems = draftItems.map(item => ({
      ...item,
      label: item.label.trim(),
      key:
        item.targetType === 'external'
          ? item.key.trim()
          : normalizeInternalPath(item.key)
    }))
    const error = validateMenuItems(normalizedItems)

    if (error) {
      void message.error(error)
      return
    }

    saveMenuItems(normalizedItems)
    onSave(normalizedItems)
    void message.success('菜单配置已保存')
    onClose()
  }

  return (
    <Modal
      open={open}
      title="管理菜单"
      width={900}
      onCancel={onClose}
      onOk={handleSave}
      okText="保存"
      cancelText="取消"
    >
      <div className="flex flex-col gap-4">
        <Text type="secondary">
          整个菜单都支持配置。内部页面从预设列表选择，自定义路由用于手填站内路径，外部地址会新标签页打开。
        </Text>

        <Space wrap>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() =>
              setDraftItems(current => [...current, createMenuItem()])
            }
          >
            新增菜单
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setDraftItems(defaultMenuItems)}
          >
            恢复默认
          </Button>
        </Space>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {draftItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-zinc-900/70"
              >
                {(() => {
                  const isFixedHome = item.id === FIXED_MENU_ITEM_ID

                  return (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Space wrap>
                          <Text strong>
                            {item.label || `菜单 ${index + 1}`}
                          </Text>
                          <Tag
                            color={
                              item.targetType === 'external'
                                ? 'gold'
                                : item.targetType === 'custom'
                                  ? 'purple'
                                  : 'blue'
                            }
                          >
                            {item.targetType === 'external'
                              ? '外部地址'
                              : item.targetType === 'custom'
                                ? '自定义路由'
                                : '内部页面'}
                          </Tag>
                          {isFixedHome ? (
                            <Tag color="cyan">固定首页</Tag>
                          ) : null}
                          {item.identity ? <Tag>{item.identity}</Tag> : null}
                        </Space>
                        <Space>
                          <Button
                            icon={<ArrowUpOutlined />}
                            disabled={index === 0}
                            onClick={() =>
                              setDraftItems(current =>
                                moveItem(current, index, 'up')
                              )
                            }
                          />
                          <Button
                            icon={<ArrowDownOutlined />}
                            disabled={
                              index === draftItems.length - 1 || isFixedHome
                            }
                            onClick={() =>
                              setDraftItems(current =>
                                moveItem(current, index, 'down')
                              )
                            }
                          />
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={isFixedHome}
                            onClick={() =>
                              setDraftItems(current =>
                                current.filter(menu => menu.id !== item.id)
                              )
                            }
                          />
                        </Space>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_140px_1fr]">
                        <Input
                          value={item.label}
                          placeholder="菜单名称"
                          onChange={event =>
                            handleChange(item.id, { label: event.target.value })
                          }
                        />
                        <Select
                          value={item.targetType}
                          disabled={isFixedHome}
                          options={[
                            { label: '内部页面', value: 'internal' },
                            { label: '自定义路由', value: 'custom' },
                            { label: '外部地址', value: 'external' }
                          ]}
                          onChange={value =>
                            handleChange(item.id, {
                              targetType:
                                value as EditableMenuItem['targetType']
                            })
                          }
                        />
                        {item.targetType === 'external' ? (
                          <Input
                            value={item.key}
                            disabled={isFixedHome}
                            placeholder="https://example.com"
                            onChange={event =>
                              handleChange(item.id, { key: event.target.value })
                            }
                          />
                        ) : item.targetType === 'custom' ? (
                          <Input
                            value={item.key}
                            disabled={isFixedHome}
                            placeholder="/custom-path"
                            onChange={event =>
                              handleChange(item.id, { key: event.target.value })
                            }
                          />
                        ) : (
                          <Select
                            value={item.key}
                            disabled={isFixedHome}
                            options={menuRouteOptions}
                            onChange={value =>
                              handleChange(item.id, { key: value })
                            }
                          />
                        )}
                      </div>
                      {isFixedHome ? (
                        <div className="mt-2 text-xs text-zinc-500">
                          首页固定在顶部并绑定 `/`，不参与类型、地址和删除编辑。
                        </div>
                      ) : null}
                    </>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default MenuManager
