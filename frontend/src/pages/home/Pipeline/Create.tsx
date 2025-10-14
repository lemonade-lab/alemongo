import React, { useState, useEffect, useCallback } from 'react'
import Box from '@/commom/layout/Box'
import {
  apiCreatePipeline,
  apiGetPipeline,
  apiUpdatePipeline,
  CreatePipelineRequest,
  PipelineStep
} from '@/api/pipeline'
import { apiBotList } from '@/api/bot/control'
import { apiBotPackagesList, BotPackages } from '@/api/bot/packages'
import { apiGenerateWebhookSecret } from '@/api/pipeline'
import {
  Input,
  Button,
  Card,
  Space,
  Select,
  Typography,
  message,
  Row,
  Col,
  Switch,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  KeyOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

const PipelineCreatePage: React.FC = () => {
  const [steps, setSteps] = useState<PipelineStep[]>([])
  const [loading, setLoading] = useState(false)
  const [bots, setBots] = useState<Array<{ name: string; status: number }>>([])
  const [packages, setPackages] = useState<BotPackages[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [generatingSecret, setGeneratingSecret] = useState(false)
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [webhookSecret, setWebhookSecret] = useState('')

  // 流水线基本信息状态
  const [pipelineName, setPipelineName] = useState('')
  const [pipelineDescription, setPipelineDescription] = useState('')
  const [repository, setRepository] = useState('')
  const [branch, setBranch] = useState('')
  const [eventType, setEventType] = useState('push')
  const [isActive, setIsActive] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const loadBots = async () => {
    try {
      const botList = await apiBotList()
      setBots(botList)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载机器人列表失败'
      message.error(msg)
    }
  }

  const loadPackages = useCallback(async (botName: string) => {
    if (!botName) {
      setPackages([])
      return
    }
    setLoadingPackages(true)
    try {
      const packageList = await apiBotPackagesList({ name: botName })
      setPackages(packageList)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载应用列表失败'
      message.error(msg)
      setPackages([])
    } finally {
      setLoadingPackages(false)
    }
  }, [])

  const handleGenerateSecret = async () => {
    setGeneratingSecret(true)
    try {
      const result = await apiGenerateWebhookSecret()
      setWebhookSecret(result.secret)
      message.success('密钥生成成功')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成密钥失败'
      message.error(msg)
    } finally {
      setGeneratingSecret(false)
    }
  }

  const loadPipeline = useCallback(
    async (pipelineId: number) => {
      setLoading(true)
      try {
        const pipeline = await apiGetPipeline(pipelineId)

        // 设置基本信息状态
        setPipelineName(pipeline.name)
        setPipelineDescription(pipeline.description)
        setRepository(pipeline.repository)
        setBranch(pipeline.branch)
        setEventType(pipeline.event_type)
        setIsActive(pipeline.is_active)

        // 设置 Webhook 状态
        setWebhookEnabled(pipeline.config.webhook?.enabled || false)
        setWebhookSecret(pipeline.config.webhook?.secret || '')

        // 设置步骤
        setSteps(pipeline.config.steps)

        // 如果步骤中有机器人配置，加载对应的应用列表
        const updateAppSteps = pipeline.config.steps.filter(
          step => step.type === 'update_app'
        )
        if (updateAppSteps.length > 0) {
          const firstBotName = updateAppSteps[0].config.bot_name
          if (firstBotName && typeof firstBotName === 'string') {
            loadPackages(firstBotName)
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        message.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [loadPackages]
  )

  useEffect(() => {
    loadBots()
    if (isEdit && id) {
      loadPipeline(parseInt(id))
    }
  }, [isEdit, id, loadPipeline])

  const handleSubmit = async () => {
    // 验证必填字段
    if (!pipelineName.trim()) {
      message.error('请输入流水线名称')
      return
    }
    if (!repository.trim()) {
      message.error('请输入仓库地址')
      return
    }
    if (!branch.trim()) {
      message.error('请输入分支名称')
      return
    }
    if (steps.length === 0) {
      message.error('请至少添加一个步骤')
      return
    }
    if (webhookEnabled && !webhookSecret.trim()) {
      message.error('启用 Webhook 时必须配置密钥')
      return
    }

    setLoading(true)
    try {
      const pipelineData: CreatePipelineRequest = {
        name: pipelineName,
        description: pipelineDescription,
        repository: repository,
        branch: branch,
        event_type: eventType,
        config: {
          steps: steps,
          webhook: webhookEnabled
            ? {
                enabled: webhookEnabled,
                secret: webhookSecret
              }
            : undefined
        }
      }

      if (isEdit && id) {
        await apiUpdatePipeline(parseInt(id), {
          ...pipelineData,
          is_active: isActive
        })
        message.success('更新成功')
      } else {
        await apiCreatePipeline(pipelineData)
        message.success('创建成功')
      }
      navigate('/pipeline')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const addStep = () => {
    const newStep: PipelineStep = {
      name: '',
      type: 'update_app',
      config: {},
      when: 'always'
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    setSteps(newSteps)
  }

  const updateStep = (
    index: number,
    field: keyof PipelineStep,
    value: string
  ) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const updateStepConfig = (
    index: number,
    key: string,
    value: string | boolean
  ) => {
    const newSteps = [...steps]
    newSteps[index].config = { ...newSteps[index].config, [key]: value }
    setSteps(newSteps)
  }

  const renderStepConfig = (step: PipelineStep, index: number) => {
    switch (step.type) {
      case 'update_app':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  机器人名称 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(step.config.bot_name || '')}
                  onChange={(value: string) => {
                    updateStepConfig(index, 'bot_name', value)
                    updateStepConfig(index, 'app_name', '') // 清空应用选择
                    loadPackages(value)
                  }}
                  placeholder="请选择机器人"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {bots.map(bot => (
                    <Option key={bot.name} value={bot.name}>
                      {bot.name} {bot.status === 1 ? '(运行中)' : '(已停止)'}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  应用名称 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(step.config.app_name || '')}
                  onChange={(value: string) =>
                    updateStepConfig(index, 'app_name', value)
                  }
                  placeholder="请选择应用"
                  loading={loadingPackages}
                  disabled={!step.config.bot_name}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {packages.map(pkg => (
                    <Option key={pkg.name} value={pkg.name}>
                      {pkg.name} {pkg.status === 1 ? '(已安装)' : '(未安装)'}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>
        )
      case 'restart_bot':
        return (
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  机器人名称 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(step.config.bot_name || '')}
                  onChange={(value: string) =>
                    updateStepConfig(index, 'bot_name', value)
                  }
                  placeholder="请选择机器人"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {bots.map(bot => (
                    <Option key={bot.name} value={bot.name}>
                      {bot.name} {bot.status === 1 ? '(运行中)' : '(已停止)'}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  操作类型{' '}
                  <Tooltip title="restart: 重启(未运行则启动); start: 仅启动; stop: 仅停止">
                    <QuestionCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </label>
                <Select
                  value={String(step.config.action || 'restart')}
                  onChange={(value: string) =>
                    updateStepConfig(index, 'action', value)
                  }
                  placeholder="请选择操作类型"
                >
                  <Option value="restart">重启 (Restart)</Option>
                  <Option value="start">启动 (Start)</Option>
                  <Option value="stop">停止 (Stop)</Option>
                </Select>
              </div>
            </Col>
            {step.config.action === 'stop' && (
              <Col span={24}>
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Switch
                      checked={Boolean(step.config.auto_start)}
                      onChange={(checked: boolean) =>
                        updateStepConfig(index, 'auto_start', checked)
                      }
                      className="mr-2"
                    />
                    停止后自动启动{' '}
                    <Tooltip title="停止后等待2秒自动重新启动(相当于强制重启)">
                      <QuestionCircleOutlined className="ml-1 text-gray-400" />
                    </Tooltip>
                  </label>
                </div>
              </Col>
            )}
          </Row>
        )
      case 'custom_command':
        return (
          <Row gutter={16}>
            <Col span={16}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  命令 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={String(step.config.command || '')}
                  onChange={e =>
                    updateStepConfig(index, 'command', e.target.value)
                  }
                  placeholder="请输入要执行的命令"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工作目录
                </label>
                <Input
                  value={String(step.config.working_dir || '/tmp')}
                  onChange={e =>
                    updateStepConfig(index, 'working_dir', e.target.value)
                  }
                  placeholder="/tmp"
                />
              </div>
            </Col>
          </Row>
        )
      default:
        return null
    }
  }

  const stepTypes = [
    {
      value: 'update_app',
      label: '更新应用',
      description: '更新指定机器人的指定应用'
    },
    {
      value: 'restart_bot',
      label: '重启机器人',
      description: '重启指定的机器人'
    },
    {
      value: 'custom_command',
      label: '自定义命令',
      description: '执行自定义的shell命令'
    }
  ]

  const whenOptions = [
    { value: 'always', label: '总是执行' },
    { value: 'on_success', label: '仅在前一步成功时执行' },
    { value: 'on_failure', label: '仅在前一步失败时执行' }
  ]

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

      <div>
        <Card title="基本信息" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  流水线名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="请输入流水线名称"
                  value={pipelineName}
                  onChange={e => setPipelineName(e.target.value)}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  触发事件 <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="请选择触发事件"
                  value={eventType}
                  onChange={value => setEventType(value)}
                >
                  <Option value="push">Push 事件</Option>
                  <Option value="pull_request">Pull Request 事件</Option>
                  <Option value="pull_request_review">
                    Pull Request Review 事件
                  </Option>
                  <Option value="issues">Issues 事件</Option>
                  <Option value="issue_comment">Issue Comment 事件</Option>
                  <Option value="release">Release 事件</Option>
                  <Option value="create">Create 事件</Option>
                  <Option value="delete">Delete 事件</Option>
                  <Option value="workflow_run">Workflow Run 事件</Option>
                  <Option value="schedule">Schedule 事件</Option>
                </Select>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  仓库地址 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="owner/repo"
                  value={repository}
                  onChange={e => setRepository(e.target.value)}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分支名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="main, dev*, feature/*, release-*, *dev*"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  addonAfter={
                    <Tooltip title="支持通配符匹配：* 表示任意字符，? 表示单个字符。例如 dev* 匹配 dev、develop、dev-1.0 等">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  }
                />
              </div>
            </Col>
          </Row>

          {/* Webhook 配置 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    启用 Webhook 自动触发
                  </label>
                  <Switch
                    checked={webhookEnabled}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                    onChange={checked => {
                      setWebhookEnabled(checked)
                      if (!checked) {
                        setWebhookSecret('')
                      }
                    }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook 密钥{' '}
                    {webhookEnabled && <span className="text-red-500">*</span>}
                  </label>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="启用 Webhook 后可输入密钥或点击生成"
                      style={{ width: 'calc(100% - 100px)' }}
                      disabled={!webhookEnabled}
                      value={webhookSecret}
                      onChange={e => setWebhookSecret(e.target.value)}
                    />
                    <Button
                      icon={<KeyOutlined />}
                      loading={generatingSecret}
                      onClick={handleGenerateSecret}
                      style={{ width: '100px' }}
                      disabled={!webhookEnabled}
                    >
                      生成密钥
                    </Button>
                  </Space.Compact>
                </div>
              </Col>
            </Row>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <TextArea
              rows={3}
              placeholder="请输入流水线描述"
              value={pipelineDescription}
              onChange={e => setPipelineDescription(e.target.value)}
            />
          </div>
          {isEdit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                启用状态
              </label>
              <Switch
                checked={isActive}
                onChange={checked => setIsActive(checked)}
              />
            </div>
          )}
        </Card>

        <Card
          title="流水线步骤"
          extra={
            <Button type="dashed" icon={<PlusOutlined />} onClick={addStep}>
              添加步骤
            </Button>
          }
        >
          {steps.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Text>暂无步骤，点击上方按钮添加步骤</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  size="small"
                  title={`步骤 ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeStep(index)}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          步骤名称 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={step.name}
                          onChange={e =>
                            updateStep(index, 'name', e.target.value)
                          }
                          placeholder="请输入步骤名称"
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          步骤类型 <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={step.type}
                          onChange={value => updateStep(index, 'type', value)}
                        >
                          {stepTypes.map(type => (
                            <Option key={type.value} value={type.value}>
                              {type.label}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          执行条件
                        </label>
                        <Select
                          value={step.when}
                          onChange={value => updateStep(index, 'when', value)}
                        >
                          {whenOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>
                  </Row>
                  {renderStepConfig(step, index)}
                </Card>
              ))}
            </div>
          )}
        </Card>

        <div className="text-center mt-6">
          <Space>
            <Button onClick={() => navigate('/pipeline')}>取消</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEdit ? '更新' : '创建'}
            </Button>
          </Space>
        </div>
      </div>
    </Box>
  )
}

export default PipelineCreatePage
