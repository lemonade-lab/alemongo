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
  FirewallStatusResponse
} from '@/api/system/firewall'
import { useNavigate } from 'react-router-dom'

const Apps: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<FirewallStatusResponse | null>(null)
  const navigate = useNavigate()

  // 计划相关
  const [action, setAction] = useState<
    'enable' | 'disable' | 'reload' | 'allow' | 'block'
  >('enable')
  const [port, setPort] = useState<number | undefined>(undefined)
  const [protocol, setProtocol] = useState<'tcp' | 'udp'>('tcp')
  const [comment, setComment] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [commandsText, setCommandsText] = useState('')
  const [executing, setExecuting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await apiFirewallStatus()
      setStatus(res)
      if (res.os !== 'darwin') {
        message.warning('当前仅提供 macOS PF 管理，其它平台待支持')
      }
      if (!res.pfctlInstalled) {
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
    try {
      setLoading(true)
      const res = await apiFirewallPlan({
        action,
        port,
        protocol,
        comment,
        execute: false
      })
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
        commandsOverride: commands
      })
      if (res.executed && res.taskId) {
        message.success('任务已创建，正在执行…')
        navigate(`/tasks?select=${encodeURIComponent(res.taskId)}`)
      } else {
        message.info('已返回计划（未执行），请检查命令是否为空')
      }
      setModalOpen(false)
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
      <div className="w-full h-full flex sm:p-6 gap-4 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold gradient-text">
              防火墙（PF）
            </h2>
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
            type="info"
            showIcon
            message={
              'macOS 使用 PF（pfctl）进行防火墙管理。建议先生成计划并预览脚本，再确认执行。\n若提示权限不足，请为命令添加 sudo 或以具有管理员权限的用户执行。'
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
              </Radio.Group>
            </div>

            {(action === 'allow' || action === 'block') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">端口：</span>
                <Input
                  style={{ width: 120 }}
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
                style={{ width: 360 }}
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

          <div className="flex justify-end">
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
        okText={executing ? '执行中…' : '确认执行'}
        okButtonProps={{ disabled: executing }}
        onOk={runExecute}
        width={720}
      >
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
