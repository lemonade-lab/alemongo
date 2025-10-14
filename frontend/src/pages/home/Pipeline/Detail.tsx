import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@/commom/layout/Box'
import {
  apiGetPipeline,
  apiGetPipelineExecutions,
  Pipeline,
  PipelineExecution
} from '@/api/pipeline'
import {
  Button,
  Card,
  Space,
  Tag,
  Typography,
  message,
  List,
  Avatar,
  Descriptions,
  Divider,
  Timeline,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  ReloadOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  BranchesOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Text } = Typography

const PipelineDetailPage: React.FC = () => {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [executions, setExecutions] = useState<PipelineExecution[]>([])
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const loadPipeline = useCallback(async () => {
    if (!id) return
    try {
      const data = await apiGetPipeline(parseInt(id))
      setPipeline(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      message.error(msg)
    }
  }, [id])

  const loadExecutions = useCallback(async () => {
    if (!id) return
    try {
      const data = await apiGetPipelineExecutions(parseInt(id))
      setExecutions(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载执行记录失败'
      message.error(msg)
    }
  }, [id])

  useEffect(() => {
    loadPipeline()
    loadExecutions()
  }, [loadPipeline, loadExecutions])

  const latestExecRunning = useMemo(() => {
    if (!executions.length) return false
    return (
      executions[0].status === 'running' || executions[0].status === 'pending'
    )
  }, [executions])

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

  if (!pipeline) {
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
          onClick={() => navigate('/pipeline')}
        >
          返回
        </Button>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="流水线信息" className="mb-6">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="名称">
                {pipeline.name}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={pipeline.is_active ? 'green' : 'default'}>
                  {pipeline.is_active ? '启用' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="仓库">
                <Tag icon={<CodeOutlined />}>{pipeline.repository}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="分支">
                <Tag icon={<BranchesOutlined />}>{pipeline.branch}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="触发事件">
                <Tag icon={<SettingOutlined />}>{pipeline.event_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建者">
                {pipeline.created_by}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(pipeline.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {pipeline.description || '暂无描述'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="流水线步骤"
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/pipeline/${id}/edit`)}
                >
                  编辑
                </Button>
                {latestExecRunning && (
                  <Tag color="blue" icon={<ReloadOutlined spin />}>
                    运行中
                  </Tag>
                )}
              </Space>
            }
          >
            <Timeline>
              {pipeline.config.steps.map((step, index) => (
                <Timeline.Item
                  key={index}
                  dot={getStepTypeIcon(step.type)}
                  color="blue"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>{step.name}</Text>
                      <div className="text-sm text-gray-500">
                        <Tag>{step.type}</Tag>
                        <Tag color="orange">{step.when}</Tag>
                      </div>
                    </div>
                  </div>
                  {step.type === 'update_app' && (
                    <div className="text-sm text-gray-500 mt-1">
                      机器人: {step.config.bot_name} | 应用:{' '}
                      {step.config.app_name}
                    </div>
                  )}
                  {step.type === 'restart_bot' && (
                    <div className="text-sm text-gray-500 mt-1">
                      机器人: {step.config.bot_name}
                    </div>
                  )}
                  {step.type === 'custom_command' && (
                    <div className="text-sm text-gray-500 mt-1">
                      命令: {step.config.command}
                    </div>
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
                <Statistic
                  title="总执行次数"
                  value={executions.length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="成功次数"
                  value={executions.filter(e => e.status === 'success').length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="失败次数"
                  value={executions.filter(e => e.status === 'failed').length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="运行中"
                  value={executions.filter(e => e.status === 'running').length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>

          <Card
            title="最近执行记录"
            extra={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={loadExecutions}
              >
                刷新
              </Button>
            }
          >
            <List
              size="small"
              dataSource={executions.slice(0, 5)}
              locale={{ emptyText: '暂无执行记录' }}
              renderItem={execution => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    navigate(`/pipeline/${id}/execution/${execution.id}`)
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor:
                            getStatusColor(execution.status) === 'green'
                              ? '#52c41a'
                              : getStatusColor(execution.status) === 'blue'
                                ? '#1890ff'
                                : getStatusColor(execution.status) === 'red'
                                  ? '#ff4d4f'
                                  : '#d9d9d9'
                        }}
                        icon={getStatusIcon(execution.status)}
                      />
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <Text strong className="text-sm">
                          {execution.commit_msg || '手动触发'}
                        </Text>
                        <Tag color={getStatusColor(execution.status)}>
                          {execution.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-xs text-gray-500">
                        <div>触发者: {execution.triggered_by}</div>
                        <div>
                          时间:{' '}
                          {new Date(execution.created_at).toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Box>
  )
}

export default PipelineDetailPage
