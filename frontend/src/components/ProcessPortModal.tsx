import React, { useState, useEffect } from 'react'
import { Modal, Table, Tag, Spin, Alert, Button } from 'antd'
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { apiGetProcessPorts, ProcessPortInfo } from '@/api/bot/process'

interface ProcessPortModalProps {
  visible: boolean
  pid: number
  botName: string
  onClose: () => void
}

const ProcessPortModal: React.FC<ProcessPortModalProps> = ({
  visible,
  pid,
  botName,
  onClose
}) => {
  const [loading, setLoading] = useState(false)
  const [portInfo, setPortInfo] = useState<ProcessPortInfo | null>(null)
  const [error, setError] = useState<string>('')

  const fetchPortInfo = async () => {
    if (!pid || pid <= 0) {
      setError('无效的进程ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiGetProcessPorts(pid)
      setPortInfo(data)
      if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError('获取端口信息失败')
      console.error('获取端口信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && pid > 0) {
      fetchPortInfo()
    }
  }, [visible, pid])

  const columns = [
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80,
      render: (protocol: string) => {
        const color =
          protocol === 'TCP' ? 'blue' : protocol === 'UDP' ? 'green' : 'default'
        return <Tag color={color}>{protocol}</Tag>
      }
    },
    {
      title: '本地地址',
      dataIndex: 'local',
      key: 'local',
      render: (local: string) => (
        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
          {local}
        </code>
      )
    },
    {
      title: '远程地址',
      dataIndex: 'remote',
      key: 'remote',
      render: (remote: string) => (
        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
          {remote}
        </code>
      )
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state: string) => {
        let color = 'default'
        if (state === 'LISTENING' || state === 'LISTEN') {
          color = 'green'
        } else if (state === 'ESTABLISHED') {
          color = 'blue'
        } else if (state === 'CLOSE_WAIT' || state === 'TIME_WAIT') {
          color = 'orange'
        }
        return <Tag color={color}>{state}</Tag>
      }
    }
  ]

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <InfoCircleOutlined className="text-blue-500" />
          <span>进程端口信息</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={fetchPortInfo}
          loading={loading}
        >
          刷新
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={800}
      className="dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-header]:bg-gray-800 dark:[&_.ant-modal-footer]:bg-gray-800"
    >
      <div className="space-y-4">
        {/* 进程信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                机器人:
              </span>
              <Tag color="blue">{botName}</Tag>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                进程ID:
              </span>
              <Tag color="green">{pid}</Tag>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <Alert
            message="获取端口信息失败"
            description={error}
            type="error"
            showIcon
          />
        )}

        {/* 端口列表 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : portInfo && portInfo.ports.length > 0 ? (
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                端口占用情况 ({portInfo.ports.length} 个)
              </h4>
            </div>
            <Table
              columns={columns}
              dataSource={portInfo.ports}
              rowKey={(record, index) =>
                `${record.protocol}-${record.local}-${index}`
              }
              pagination={false}
              size="small"
              className="dark:[&_.ant-table]:bg-gray-800 dark:[&_.ant-table-thead>tr>th]:bg-gray-700 dark:[&_.ant-table-tbody>tr>td]:bg-gray-800"
            />
          </div>
        ) : portInfo && portInfo.ports.length === 0 ? (
          <Alert
            message="暂无端口信息"
            description="该进程当前没有占用任何端口"
            type="info"
            showIcon
          />
        ) : null}
      </div>
    </Modal>
  )
}

export default ProcessPortModal
