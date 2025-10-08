import React, { useEffect, useMemo, useState } from 'react'
import Box from '@/commom/layout/Box'
import {
  Alert,
  Button,
  Descriptions,
  Input,
  Modal,
  Radio,
  Space,
  Tag,
  message
} from 'antd'
import type { RadioChangeEvent } from 'antd'
import {
  apiFirewallPlan,
  apiFirewallStatus,
  FirewallStatusResponse,
  FirewallPlanResponse
} from '@/api/system/firewall'
import { useNavigate } from 'react-router-dom'

const Apps: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<FirewallStatusResponse | null>(null)
  const navigate = useNavigate()

  // 计划相关
  const [action, setAction] = useState<
    'enable' | 'disable' | 'reload' | 'allow' | 'block' | 'list' | 'remove'
  >('enable')
  const [port, setPort] = useState<number | undefined>(undefined)
  const [protocol, setProtocol] = useState<'tcp' | 'udp'>('tcp')
  const [comment, setComment] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [commandsText, setCommandsText] = useState('')
  const [executing, setExecuting] = useState(false)
  const [planResp, setPlanResp] = useState<FirewallPlanResponse | null>(null)
  const [fingerprintInput, setFingerprintInput] = useState('')

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await apiFirewallStatus()
      setStatus(res)
      if (!res.supported) {
        message.warning(
          res.unsupportedReason
            ? `当前平台暂未支持：${res.unsupportedReason}`
            : '当前平台暂未支持防火墙控制'
        )
      } else if (res.backend) {
        message.success(`使用后端: ${res.backend}`)
      }
      if (res.os === 'darwin' && res.supported && !res.pfctlInstalled) {
        message.warning('未检测到 pfctl，可能无法使用 PF 防火墙')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const openPlan = async () => {
    if ((action === 'allow' || action === 'block') && (!port || port <= 0)) {
      message.warning('请填写有效端口')
      return
    }
    if (action === 'remove' && !fingerprintInput) {
      message.warning('删除需要提供指纹')
      return
    }
    try {
      setLoading(true)
      const res = await apiFirewallPlan({
        action,
        port,
        protocol,
        comment,
        execute: false,
        ...(action === 'remove' ? { fingerprint: fingerprintInput } : {})
      })
      setPlanResp(res)
      setCommandsText((res.plannedCommands || []).join('\n'))
      setModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成计划失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const runExecute = async () => {
    try {
      setExecuting(true)
      const commands = commandsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      const res = await apiFirewallPlan({
        action,
        port,
        protocol,
        comment,
        execute: true,
        commandsOverride: commands,
        ...(action === 'remove' ? { fingerprint: fingerprintInput } : {})
      })
      if (res.executed && res.taskId) {
        message.success('任务已创建，正在执行…')
        navigate(`/tasks?select=${encodeURIComponent(res.taskId)}`)
      } else {
        message.info('已返回计划（未执行），请检查命令是否为空')
      }
      setModalOpen(false)
      setPlanResp(null)
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      message.error(msg)
    } finally {
      setExecuting(false)
    }
  }

  const pfEnabledText = useMemo(
    () => (status?.pfEnabled ? '已启用' : '未启用'),
    [status?.pfEnabled]
  )

  return (
    <Box>
      <div className="w-full h-full flex gap-4 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold gradient-text">防火墙管理</h2>
            <Space>
              <Button
                onClick={refresh}
                loading={loading}
                size="small"
                className="chatgpt-button"
              >
                刷新
              </Button>
              <Button
                type="primary"
                onClick={openPlan}
                size="small"
                className="chatgpt-button"
              >
                生成计划
              </Button>
            </Space>
          </div>

          <Descriptions bordered size="small" column={1} className="mb-4">
            <Descriptions.Item label="系统">
              {status?.os || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Supported">
              <Tag color={status?.supported ? 'green' : 'red'}>
                {status?.supported ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            {status?.backend && (
              <Descriptions.Item label="Backend">
                <Tag color="blue">{status.backend}</Tag>
              </Descriptions.Item>
            )}
            {status?.os === 'darwin' && (
              <>
                <Descriptions.Item label="pfctl">
                  <Tag color={status?.pfctlInstalled ? 'green' : 'red'}>
                    {status?.pfctlInstalled ? '已安装' : '未检测到'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="PF 状态">
                  <Tag color={status?.pfEnabled ? 'green' : 'red'}>
                    {pfEnabledText}
                  </Tag>
                </Descriptions.Item>
              </>
            )}
            {!status?.supported && status?.unsupportedReason && (
              <Descriptions.Item label="Reason">
                <Tag color="orange">{status.unsupportedReason}</Tag>
              </Descriptions.Item>
            )}
            {status?.nextActions && status.nextActions.length > 0 && (
              <Descriptions.Item label="Next">
                <Space wrap size={[4, 4]}>
                  {status.nextActions.map(a => (
                    <Tag key={a}>{a}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
            {status?.info && (
              <Descriptions.Item label="信息">
                <pre className="whitespace-pre-wrap text-xs bg-black/5 dark:bg-white/5 p-2 rounded">
                  {status.info}
                </pre>
              </Descriptions.Item>
            )}
            {status?.rulesPreview && (
              <Descriptions.Item label="规则预览">
                <pre className="whitespace-pre-wrap text-xs bg-black/5 dark:bg-white/5 p-2 rounded">
                  {status.rulesPreview}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Alert
            type={status?.supported ? 'info' : 'warning'}
            showIcon
            message={
              status?.supported
                ? '跨平台抽象：当前使用后端生成命令的方式进行管理。生成计划后可复制命令再手动验证，避免误操作。'
                : '当前平台暂未实现执行支持，可参考提示的 Next Actions 手动处理。'
            }
            className="mb-3"
          />

          <div className="mb-4 flex flex-col gap-3">
            <div>
              <span className="mr-2">操作：</span>
              <Radio.Group
                value={action}
                onChange={(e: RadioChangeEvent) => setAction(e.target.value)}
              >
                <Radio.Button value="enable">启用 PF</Radio.Button>
                <Radio.Button value="disable">禁用 PF</Radio.Button>
                <Radio.Button value="reload">重载配置</Radio.Button>
                <Radio.Button value="allow">开放端口</Radio.Button>
                <Radio.Button value="block">拦截端口</Radio.Button>
                <Radio.Button value="list">查看规则</Radio.Button>
                <Radio.Button value="remove">删除记录</Radio.Button>
              </Radio.Group>
            </div>
            {action === 'remove' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">指纹：</span>
                <Input
                  style={{ minWidth: 360 }}
                  placeholder="请输入要删除的规则 fingerprint"
                  value={fingerprintInput}
                  onChange={e => setFingerprintInput(e.target.value.trim())}
                  allowClear
                  className="chatgpt-input"
                />
              </div>
            )}

            {(action === 'allow' || action === 'block') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">端口：</span>
                <Input
                  style={{ minWidth: 120 }}
                  type="number"
                  placeholder="如 8080"
                  value={port}
                  onChange={e => setPort(Number(e.target.value) || undefined)}
                  className="chatgpt-input"
                />
                <span className="text-sm text-gray-600 ml-2">协议：</span>
                <Radio.Group
                  value={protocol}
                  onChange={(e: RadioChangeEvent) =>
                    setProtocol(e.target.value)
                  }
                >
                  <Radio.Button value="tcp">TCP</Radio.Button>
                  <Radio.Button value="udp">UDP</Radio.Button>
                </Radio.Group>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">备注：</span>
              <Input
                style={{ minWidth: 360 }}
                placeholder="可选，如 本机服务端口"
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={64}
                showCount
                allowClear
                className="chatgpt-input"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {action === 'list'
                ? '生成后可复制命令查看当前系统防火墙规则（不会修改）'
                : action === 'remove'
                  ? '删除仅标记数据库记录，暂不直接移除系统底层规则'
                  : '请谨慎修改防火墙，执行前务必确认命令安全'}
            </span>
            <Button
              onClick={openPlan}
              type="primary"
              className="chatgpt-button"
            >
              生成计划
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title="防火墙脚本"
        onCancel={() => setModalOpen(false)}
        okText={
          executing
            ? '执行中…'
            : planResp?.alreadyExists &&
                (action === 'allow' || action === 'block')
              ? '仍然执行'
              : '确认执行'
        }
        okButtonProps={{ disabled: executing }}
        onOk={runExecute}
        width={720}
      >
        {planResp?.fingerprint && (
          <Alert
            type={planResp.alreadyExists ? 'warning' : 'info'}
            showIcon
            message={
              planResp.alreadyExists
                ? `规则已存在 (fingerprint=${planResp.fingerprint})`
                : `指纹: ${planResp.fingerprint}`
            }
            className="mb-3"
          />
        )}
        {planResp?.executionErrors && planResp.executionErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            message={
              <div>
                <div className="font-semibold mb-1">执行错误(预检)</div>
                <ul className="list-disc pl-5 text-xs">
                  {planResp.executionErrors.map(e => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            }
            className="mb-3"
          />
        )}
        <Alert
          type="warning"
          showIcon
          message="将以 bash -lc 方式串行执行，建议先预览脚本。"
          className="mb-3"
        />
        <div className="flex justify-end mb-2">
          <Button
            size="small"
            className="chatgpt-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(commandsText || '')
                message.success('脚本已复制到剪贴板')
              } catch (err) {
                const msg = err instanceof Error ? err.message : '复制失败'
                message.error(msg)
              }
            }}
          >
            复制脚本
          </Button>
        </div>
        <Input.TextArea
          value={commandsText}
          onChange={e => setCommandsText(e.target.value)}
          autoSize={{ minRows: 12, maxRows: 20 }}
          placeholder="# 在此可编辑命令，一行一条"
        />
      </Modal>
    </Box>
  )
}

export default Apps
