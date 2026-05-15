import React, { useEffect, useMemo, useState } from 'react'
import Box from '@/commom/layout/Box'
import {
  Alert,
  Button,
  Descriptions,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  message
} from 'antd'
import { apiDepsCheck, apiDepsInstall, DepItem } from '@/api/system/deps'

const { Text } = Typography

// 应用管理：整合 NVM、Node.js、Git 的检测/安装
const AppsManage: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // NVM
  const [nvmItem, setNvmItem] = useState<DepItem | null>(null)
  const [nvmModalOpen, setNvmModalOpen] = useState(false)
  const [nvmCommandsText, setNvmCommandsText] = useState('')
  const [nvmExecuting, setNvmExecuting] = useState(false)
  const [nvmVersion, setNvmVersion] = useState<string | undefined>()

  // Node.js
  const [nodeItem, setNodeItem] = useState<DepItem | null>(null)
  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [nodeCommandsText, setNodeCommandsText] = useState('')
  const [nodeExecuting, setNodeExecuting] = useState(false)
  const [nodeVersion, setNodeVersion] = useState<string | undefined>()

  // Git
  const [gitItem, setGitItem] = useState<DepItem | null>(null)
  const [gitModalOpen, setGitModalOpen] = useState(false)
  const [gitCommandsText, setGitCommandsText] = useState('')
  const [gitExecuting, setGitExecuting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await apiDepsCheck(['nvm', 'node', 'git'])
      setNvmItem(res.items.find(i => i.name === 'nvm') || null)
      setNodeItem(res.items.find(i => i.name === 'node') || null)
      setGitItem(res.items.find(i => i.name === 'git') || null)
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

  // 生成计划：NVM
  const openPlanNvm = async () => {
    try {
      setLoading(true)
      const res = await apiDepsInstall({
        names: ['nvm'],
        execute: false,
        nvmVersion
      })
      const planned = res.plannedCommands?.['nvm'] || []
      setNvmCommandsText(planned.join('\n'))
      setNvmModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成计划失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 执行：NVM
  const runExecuteNvm = async () => {
    try {
      setNvmExecuting(true)
      const commands = nvmCommandsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      const res = await apiDepsInstall({
        names: ['nvm'],
        execute: true,
        nvmVersion,
        commandsOverride: { nvm: commands }
      })
      if (res.executed && res.taskId) {
        message.success('安装任务已创建，正在执行…')
      } else {
        message.info('已返回安装计划（未执行），请检查命令是否为空')
      }
      setNvmModalOpen(false)
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      message.error(msg)
    } finally {
      setNvmExecuting(false)
    }
  }

  // 生成计划：Node
  const openPlanNode = async () => {
    try {
      setLoading(true)
      const res = await apiDepsInstall({
        names: ['node'],
        execute: false,
        useNvm: true,
        nodeVersion
      })
      const planned = res.plannedCommands?.['node'] || []
      setNodeCommandsText(planned.join('\n'))
      setNodeModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成计划失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 执行：Node
  const runExecuteNode = async () => {
    try {
      setNodeExecuting(true)
      const commands = nodeCommandsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      const res = await apiDepsInstall({
        names: ['node'],
        execute: true,
        useNvm: true,
        nodeVersion,
        commandsOverride: { node: commands }
      })
      if (res.executed && res.taskId) {
        message.success('安装任务已创建，正在执行…')
      } else {
        message.info('已返回安装计划（未执行），请检查命令是否为空')
      }
      setNodeModalOpen(false)
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      message.error(msg)
    } finally {
      setNodeExecuting(false)
    }
  }

  // 生成计划：Git
  const openPlanGit = async () => {
    try {
      setLoading(true)
      const res = await apiDepsInstall({ names: ['git'], execute: false })
      const planned = res.plannedCommands?.['git'] || []
      setGitCommandsText(planned.join('\n'))
      setGitModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成计划失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 执行：Git
  const runExecuteGit = async () => {
    try {
      setGitExecuting(true)
      const commands = gitCommandsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      const res = await apiDepsInstall({
        names: ['git'],
        execute: true,
        commandsOverride: { git: commands }
      })
      if (res.executed && res.taskId) {
        message.success('安装任务已创建，正在执行…')
      } else {
        message.info('已返回安装计划（未执行），请检查命令是否为空')
      }
      setGitModalOpen(false)
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      message.error(msg)
    } finally {
      setGitExecuting(false)
    }
  }

  const nvmInstalledStatus = useMemo(
    () => (nvmItem?.installed ? '已安装' : '未安装'),
    [nvmItem]
  )
  const nodeInstalledStatus = useMemo(
    () => (nodeItem?.installed ? '已安装' : '未安装'),
    [nodeItem]
  )
  const gitInstalledStatus = useMemo(
    () => (gitItem?.installed ? '已安装' : '未安装'),
    [gitItem]
  )

  return (
    <Box>
      <div className="w-full h-full flex gap-4 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">应用管理</h1>
          <Button
            onClick={refresh}
            loading={loading}
            size="small"
            className="chatgpt-button"
          >
            刷新
          </Button>
        </div>

        {/* NVM 管理 */}
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold ">NVM 管理</h2>
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
                onClick={openPlanNvm}
                size="small"
                className="chatgpt-button"
              >
                {nvmItem?.installed ? '重装/修复' : '安装'}
              </Button>
            </Space>
          </div>
          <Descriptions bordered size="small" column={1} className="mb-3">
            <Descriptions.Item label="安装状态">
              <Tag color={nvmItem?.installed ? 'green' : 'red'}>
                {nvmInstalledStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {nvmItem?.version ? <Text code>{nvmItem.version}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              {nvmItem?.path ? <Text code>{nvmItem.path}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="管理器">
              {nvmItem?.manager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="系统">
              {nvmItem?.os || '-'}
            </Descriptions.Item>
          </Descriptions>
          <Alert
            type="info"
            showIcon
            message="可选指定 NVM 版本（默认 v0.40.3）；点击“安装/重装”将生成可编辑脚本。"
            className="mb-3"
          />
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">NVM 版本（可选）：</span>
            <Input
              style={{ minWidth: 220 }}
              placeholder="如 v0.40.3"
              value={nvmVersion}
              onChange={e => setNvmVersion(e.target.value || undefined)}
              allowClear
              className="chatgpt-input"
            />
          </div>
        </div>

        {/* Node.js 管理 */}
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold ">Node.js 管理</h2>
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
                onClick={openPlanNode}
                size="small"
                className="chatgpt-button"
              >
                {nodeItem?.installed ? '重装/修复' : '安装'}
              </Button>
            </Space>
          </div>
          <Descriptions bordered size="small" column={1} className="mb-3">
            <Descriptions.Item label="安装状态">
              <Tag color={nodeItem?.installed ? 'green' : 'red'}>
                {nodeInstalledStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {nodeItem?.version ? <Text code>{nodeItem.version}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              {nodeItem?.path ? <Text code>{nodeItem.path}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="管理器">
              {nodeItem?.manager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="系统">
              {nodeItem?.os || '-'}
            </Descriptions.Item>
          </Descriptions>
          <Alert
            type="info"
            showIcon
            message="可选指定 Node.js 版本（默认 22），将通过 NVM 安装并管理。"
            className="mb-3"
          />
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Node.js 版本（可选）：
            </span>
            <Input
              style={{ minWidth: 220 }}
              placeholder="如 22"
              value={nodeVersion}
              onChange={e => setNodeVersion(e.target.value || undefined)}
              allowClear
              className="chatgpt-input"
            />
          </div>
        </div>

        {/* Git 管理 */}
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold ">Git 管理</h2>
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
                onClick={openPlanGit}
                size="small"
                className="chatgpt-button"
              >
                {gitItem?.installed ? '重装/修复' : '安装'}
              </Button>
            </Space>
          </div>
          <Descriptions bordered size="small" column={1} className="mb-3">
            <Descriptions.Item label="安装状态">
              <Tag color={gitItem?.installed ? 'green' : 'red'}>
                {gitInstalledStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {gitItem?.version ? <Text code>{gitItem.version}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              {gitItem?.path ? <Text code>{gitItem.path}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="管理器">
              {gitItem?.manager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="系统">
              {gitItem?.os || '-'}
            </Descriptions.Item>
          </Descriptions>
          <Alert
            type="info"
            showIcon
            message="点击“安装/重装”将生成可编辑的安装脚本，确认后会作为任务执行。"
          />
        </div>
      </div>

      {/* NVM 安装脚本弹窗 */}
      <Modal
        open={nvmModalOpen}
        title="安装脚本 · NVM"
        onCancel={() => setNvmModalOpen(false)}
        okText={nvmExecuting ? '执行中…' : '确认执行'}
        okButtonProps={{ disabled: nvmExecuting }}
        onOk={runExecuteNvm}
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
                await navigator.clipboard.writeText(nvmCommandsText || '')
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
          value={nvmCommandsText}
          onChange={e => setNvmCommandsText(e.target.value)}
          autoSize={{ minRows: 12, maxRows: 20 }}
          placeholder="# 在此可编辑命令，一行一条"
        />
      </Modal>

      {/* Node 安装脚本弹窗 */}
      <Modal
        open={nodeModalOpen}
        title="安装脚本 · Node.js"
        onCancel={() => setNodeModalOpen(false)}
        okText={nodeExecuting ? '执行中…' : '确认执行'}
        okButtonProps={{ disabled: nodeExecuting }}
        onOk={runExecuteNode}
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
                await navigator.clipboard.writeText(nodeCommandsText || '')
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
          value={nodeCommandsText}
          onChange={e => setNodeCommandsText(e.target.value)}
          autoSize={{ minRows: 12, maxRows: 20 }}
          placeholder="# 在此可编辑命令，一行一条"
        />
      </Modal>

      {/* Git 安装脚本弹窗 */}
      <Modal
        open={gitModalOpen}
        title="安装脚本 · Git"
        onCancel={() => setGitModalOpen(false)}
        okText={gitExecuting ? '执行中…' : '确认执行'}
        okButtonProps={{ disabled: gitExecuting }}
        onOk={runExecuteGit}
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
                await navigator.clipboard.writeText(gitCommandsText || '')
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
          value={gitCommandsText}
          onChange={e => setGitCommandsText(e.target.value)}
          autoSize={{ minRows: 12, maxRows: 20 }}
          placeholder="# 在此可编辑命令，一行一条"
        />
      </Modal>
    </Box>
  )
}

export default AppsManage
