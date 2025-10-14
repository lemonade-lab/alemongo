import React, { useCallback, useEffect, useState } from 'react'
import Box from '@/commom/layout/Box'
import {
  apiGetPipelines,
  apiDeletePipeline,
  apiTriggerPipeline,
  Pipeline
} from '@/api/pipeline'
import { getAllCachedBranchesForRepository } from '@/utils/branchCache'
import {
  Button,
  Card,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
  Badge,
  Avatar,
  Tooltip,
  Modal,
  Select
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
  BranchesOutlined,
  CodeOutlined,
  KeyOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Option } = Select

const PipelinePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [triggering, setTriggering] = useState<number | null>(null)
  const [triggerModalVisible, setTriggerModalVisible] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(
    null
  )
  const [branches, setBranches] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGetPipelines()
      setPipelines(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = async (id: number) => {
    try {
      await apiDeletePipeline(id)
      message.success('删除成功')
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '删除失败'
      message.error(msg)
    }
  }

  const handleTrigger = async (id: number) => {
    // 找到对应的流水线
    const pipeline = pipelines.find(p => p.id === id)
    if (!pipeline) return

    setSelectedPipeline(pipeline)
    setSelectedBranch(pipeline.branch) // 默认使用流水线配置的分支
    setTriggerModalVisible(true)

    // 使用统一的缓存工具从所有缓存中加载分支列表
    const cachedBranches = getAllCachedBranchesForRepository(
      pipeline.repository
    )
    setBranches(cachedBranches)
  }

  const executeTriggerWithModal = async () => {
    if (!selectedPipeline) return

    setTriggerModalVisible(false)
    await executeTrigger(selectedPipeline.id, selectedBranch)
  }

  const handleModalCancel = () => {
    setTriggerModalVisible(false)
    setSelectedPipeline(null)
    setSelectedBranch('')
    setBranches([])
  }

  const executeTrigger = async (id: number, branch: string) => {
    setTriggering(id)
    try {
      const exec = await apiTriggerPipeline(id, branch ? { branch } : undefined)
      message.success('流水线已触发')
      // 跳转到执行详情页查看日志
      if (exec && exec.id) {
        navigate(`/pipeline/${id}/execution/${exec.id}`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '触发失败'
      message.error(msg)
    } finally {
      setTriggering(null)
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'push':
        return <CodeOutlined />
      case 'pull_request':
        return <BranchesOutlined />
      default:
        return <SettingOutlined />
    }
  }

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} className="mb-2">
            流水线管理
          </Title>
          <Text type="secondary">管理和监控自动化部署流水线</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/pipeline/create')}
          >
            创建流水线
          </Button>
        </Space>
      </div>

      {pipelines.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <SettingOutlined style={{ fontSize: '48px' }} />
          </div>
          <Title level={4} type="secondary">
            暂无流水线
          </Title>
          <Text type="secondary" className="block mb-4">
            创建您的第一个自动化流水线，实现自动部署
          </Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/pipeline/create')}
          >
            创建流水线
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pipelines.map(pipeline => (
            <Card
              key={pipeline.id}
              className="hover:shadow-lg transition-shadow duration-300"
              actions={[
                <Tooltip title="查看详情">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/pipeline/${pipeline.id}`)}
                  />
                </Tooltip>,
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/pipeline/${pipeline.id}/edit`)}
                  />
                </Tooltip>,
                <Tooltip title="手动触发">
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    loading={triggering === pipeline.id}
                    onClick={() => handleTrigger(pipeline.id)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="确认删除此流水线？"
                  description="删除后无法恢复"
                  onConfirm={() => handleDelete(pipeline.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Tooltip title="删除">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: pipeline.is_active
                        ? '#52c41a'
                        : '#d9d9d9'
                    }}
                    icon={getEventTypeIcon(pipeline.event_type)}
                  />
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{pipeline.name}</span>
                    <Badge
                      status={pipeline.is_active ? 'success' : 'default'}
                      text={pipeline.is_active ? '启用' : '禁用'}
                    />
                  </div>
                }
                description={
                  <div className="space-y-2">
                    <div>
                      <Text type="secondary" className="text-xs">
                        {pipeline.description || '暂无描述'}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Tag icon={<CodeOutlined />}>{pipeline.repository}</Tag>
                      <Tag icon={<BranchesOutlined />}>{pipeline.branch}</Tag>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Tag icon={getEventTypeIcon(pipeline.event_type)}>
                        {pipeline.event_type}
                      </Tag>
                      <Text type="secondary">
                        {pipeline.config.steps.length} 个步骤
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Tag
                        color={
                          pipeline.config.webhook?.enabled ? 'green' : 'default'
                        }
                        icon={<KeyOutlined />}
                      >
                        Webhook{' '}
                        {pipeline.config.webhook?.enabled ? '已启用' : '未启用'}
                      </Tag>
                    </div>
                    <div className="text-xs text-gray-400">
                      创建者: {pipeline.created_by}
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      {/* 触发流水线Modal */}
      <Modal
        title="触发流水线"
        open={triggerModalVisible}
        onOk={executeTriggerWithModal}
        onCancel={handleModalCancel}
        confirmLoading={triggering !== null}
        okText="触发"
        cancelText="取消"
      >
        <div className="space-y-4 py-4">
          <div>
            <div className="mb-2">
              <Text strong>流水线:</Text> <Text>{selectedPipeline?.name}</Text>
            </div>
            <div className="mb-2">
              <Text strong>仓库:</Text>{' '}
              <Text code>{selectedPipeline?.repository}</Text>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Text strong>选择分支:</Text>
              <Tooltip title="手动输入或从列表中选择">
                <QuestionCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <Select
              value={selectedBranch || undefined}
              onChange={(value: string) => setSelectedBranch(value)}
              placeholder={`默认: ${selectedPipeline?.branch}`}
              showSearch
              allowClear
              style={{ width: '100%' }}
              dropdownRender={menu => (
                <>
                  {menu}
                  {branches.length === 0 && (
                    <div className="p-2 text-center text-gray-400 text-sm border-t">
                      暂无缓存分支,请手动输入
                    </div>
                  )}
                </>
              )}
              notFoundContent={
                <div className="text-center py-2 text-gray-400">
                  暂无分支列表
                </div>
              }
            >
              {branches.map(branch => (
                <Option key={branch} value={branch}>
                  <Space>
                    <BranchesOutlined />
                    {branch}
                  </Space>
                </Option>
              ))}
            </Select>

            <div className="mt-2 text-xs text-gray-500">
              留空则使用流水线配置的默认分支:{' '}
              <Text code>{selectedPipeline?.branch}</Text>
            </div>
          </div>
        </div>
      </Modal>
    </Box>
  )
}

export default PipelinePage
