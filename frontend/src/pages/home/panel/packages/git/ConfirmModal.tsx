import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { ConfirmModalConfig } from './types'

/**
 * 通用确认对话框
 * 统一处理所有确认操作，避免重复的 Modal.confirm 代码
 */
export const showConfirmModal = (config: ConfirmModalConfig) => {
  const {
    title,
    content,
    okText = '确认',
    cancelText = '取消',
    type = 'warning',
    onOk,
    onCancel
  } = config

  // 根据类型设置不同的样式
  const okType = type === 'danger' ? 'danger' : 'primary'

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okType,
    onOk,
    onCancel
  })
}
