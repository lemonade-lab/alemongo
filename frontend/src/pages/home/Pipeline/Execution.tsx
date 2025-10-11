import React, { useCallback, useEffect, useState } from 'react'
import Box from '@/commom/layout/Box'
import { apiGetPipelineExecution, PipelineExecution } from '@/api/pipeline'
import {
  Button,
  Card,
  Tag,
  Typography,
  message,
  Descriptions,
  Timeline,
  Alert,
  Row,
  Col,
  Divider,
  Progress
} from 'antd'
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  SettingOutlined,
  CopyOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Text } = Typography

const PipelineExecutionPage: React.FC = () => {
  const [execution, setExecution] = useState<PipelineExecution | null>(null)
  const [, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const loadExecution = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await apiGetPipelineExecution(parseInt(id))
      setExecution(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadExecution()
  }, [loadExecution])

  // 轮询运行中的执行记录
  useEffect(() => {
    if (!execution || !['pending', 'running'].includes(execution.status)) {
      setPolling(false)
      return
    }
    setPolling(true)
    const interval = setInterval(() => {
      loadExecution()
    }, 2000)
    return () => clearInterval(interval)
  }, [execution, loadExecution])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green'
      case 'running':
        return 'blue'
      case 'failed':
        return 'red'
      case 'cancelled':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined />
      case 'running':
        return <ClockCircleOutlined />
      case 'failed':
        return <CloseCircleOutlined />
      case 'cancelled':
        return <ExclamationCircleOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'update_app':
        return <CodeOutlined />
      case 'restart_bot':
        return <SettingOutlined />
      case 'custom_command':
        return <CodeOutlined />
      default:
        return <SettingOutlined />
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('已复制到剪贴板')
    } catch (e) {
      console.error(e)
      message.error('复制失败')
    }
  }

  const getExecutionProgress = () => {
    if (!execution) return 0
    const totalSteps = execution.steps.length
    const completedSteps = execution.steps.filter(step =>
      ['success', 'failed', 'skipped'].includes(step.status)
    ).length
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  }

  if (!execution) {
    return (
      <Box>
        <div className="text-center py-12">
          <Text type="secondary">加载中...</Text>
        </div>
      </Box>
    )
  }

  return (
    <Box>
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/pipeline/${execution.pipeline_id}`)}
        >
          返回
        </Button>
        {polling && (
          <Tag color="blue" icon={<ReloadOutlined spin />}>
            实时更新中
          </Tag>
        )}
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="执行信息" className="mb-6">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="执行ID">
                <Text code>{execution.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={getStatusColor(execution.status)}
                  icon={getStatusIcon(execution.status)}
                >
                  {execution.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="触发者">
                {execution.triggered_by}
              </Descriptions.Item>
              <Descriptions.Item label="分支">
                <Tag icon={<CodeOutlined />}>{execution.branch}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交哈希">
                <Text code>{execution.commit_hash}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="提交消息">
                {execution.commit_msg}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {execution.started_at
                  ? new Date(execution.started_at).toLocaleString()
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {execution.finished_at
                  ? new Date(execution.finished_at).toLocaleString()
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(execution.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="执行进度">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Text strong>总体进度</Text>
                <Text type="secondary">
                  {
                    execution.steps.filter(s =>
                      ['success', 'failed', 'skipped'].includes(s.status)
                    ).length
                  }{' '}
                  / {execution.steps.length}
                </Text>
              </div>
              <Progress
                percent={getExecutionProgress()}
                status={
                  execution.status === 'failed'
                    ? 'exception'
                    : execution.status === 'success'
                      ? 'success'
                      : 'active'
                }
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068'
                }}
              />
            </div>
            <Divider />
            <Timeline>
              {execution.steps.map(step => (
                <Timeline.Item
                  key={step.id}
                  dot={getStepTypeIcon(step.step_type)}
                  color={
                    step.status === 'success'
                      ? 'green'
                      : step.status === 'failed'
                        ? 'red'
                        : step.status === 'running'
                          ? 'blue'
                          : 'gray'
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Text strong>{step.step_name}</Text>
                      <div className="text-sm text-gray-500">
                        <Tag>{step.step_type}</Tag>
                        <Tag color={getStatusColor(step.status)}>
                          {step.status}
                        </Tag>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.started_at && (
                        <div>
                          开始: {new Date(step.started_at).toLocaleTimeString()}
                        </div>
                      )}
                      {step.finished_at && (
                        <div>
                          结束:{' '}
                          {new Date(step.finished_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {step.error_msg && (
                    <Alert
                      message="错误信息"
                      description={step.error_msg}
                      type="error"
                      showIcon
                      className="mb-2"
                    />
                  )}

                  {step.logs && (
                    <Card
                      size="small"
                      title="执行日志"
                      extra={
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(step.logs)}
                        >
                          复制
                        </Button>
                      }
                    >
                      <div className="bg-black text-green-400 p-3 rounded text-xs overflow-auto whitespace-pre-wrap max-h-40">
                        {step.logs || '无日志'}
                      </div>
                    </Card>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="执行统计" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {execution.steps.filter(s => s.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-500">成功</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {execution.steps.filter(s => s.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-500">失败</div>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {execution.steps.filter(s => s.status === 'running').length}
                  </div>
                  <div className="text-sm text-gray-500">运行中</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {execution.steps.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">等待中</div>
                </div>
              </Col>
            </Row>
          </Card>

          {execution.error_msg && (
            <Card title="错误信息" className="mb-6">
              <Alert
                message="执行失败"
                description={execution.error_msg}
                type="error"
                showIcon
              />
            </Card>
          )}

          <Card
            title="完整日志"
            extra={
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(execution.logs)}
              >
                复制
              </Button>
            }
          >
            <div className="bg-black text-green-400 p-3 rounded text-xs overflow-auto whitespace-pre-wrap max-h-96">
              {execution.logs || '无日志'}
            </div>
          </Card>
        </Col>
      </Row>
    </Box>
  )
}

export default PipelineExecutionPage
