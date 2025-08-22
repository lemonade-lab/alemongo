import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, message, Tooltip } from 'antd'
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { getBotName } from './core'
import { apiBotStatus } from '@/api/bot'
import Box from '@/commom/Box'

interface ProcessInfo {
  name: string
  status: string
  pid: number
  port: number
  restart_count: number
  consecutive_failures: number
  last_start_time: string
  last_health_check: string
  last_restart_time: string
  is_zombie: boolean
}

const ProcessStatus: React.FC = () => {
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchProcessStatus = async () => {
    setLoading(true)
    try {
      const name = getBotName()
      const data = await apiBotStatus({ name })
      if (data) {
        setProcessInfo(data)
      }
    } catch (error) {
      message.error('获取进程状态失败')
      console.error('获取进程状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcessStatus()
    // 每30秒自动刷新一次
    const interval = setInterval(fetchProcessStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'green'
      case 'stopped':
        return 'red'
      case 'crashed':
        return 'orange'
      case 'not_registered':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中'
      case 'stopped':
        return '已停止'
      case 'crashed':
        return '已崩溃'
      case 'not_registered':
        return '未注册'
      default:
        return status
    }
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-'
    try {
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN')
    } catch {
      return timeStr
    }
  }

  const columns = [
    {
      title: '属性',
      dataIndex: 'key',
      key: 'key',
      width: 150
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: any, record: any) => {
        if (record.key === '状态') {
          return <Tag color={getStatusColor(value)}>{getStatusText(value)}</Tag>
        }
        if (record.key === '僵尸进程') {
          return value ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>
        }
        if (record.key === 'PID' && value === 0) {
          return '-'
        }
        if (record.key === '端口' && value === 0) {
          return '-'
        }
        return value
      }
    }
  ]

  const dataSource = processInfo
    ? [
        { key: '进程名称', value: processInfo.name },
        { key: '状态', value: processInfo.status },
        { key: 'PID', value: processInfo.pid },
        { key: '端口', value: processInfo.port },
        { key: '重启次数', value: processInfo.restart_count },
        { key: '连续失败次数', value: processInfo.consecutive_failures },
        { key: '僵尸进程', value: processInfo.is_zombie },
        { key: '最后启动时间', value: formatTime(processInfo.last_start_time) },
        {
          key: '最后健康检查',
          value: formatTime(processInfo.last_health_check)
        },
        {
          key: '最后重启时间',
          value: formatTime(processInfo.last_restart_time)
        }
      ]
    : []

  return (
    <Box>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-2">进程状态监控</h2>
          <Tooltip title="显示进程的详细运行状态，包括健康检查、重启次数等信息">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchProcessStatus}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      {processInfo ? (
        <Card>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            size="small"
            loading={loading}
            rowKey="key"
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500 py-8">暂无进程状态信息</div>
        </Card>
      )}
    </Box>
  )
}

export default ProcessStatus
