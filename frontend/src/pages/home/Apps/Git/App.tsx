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

/**
 * @returns
 */
const Apps: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<DepItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [commandsText, setCommandsText] = useState('')
  const [executing, setExecuting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await apiDepsCheck(['git'])
      const it = res.items.find(i => i.name === 'git') || null
      setItem(it)
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
    try {
      setLoading(true)
      const res = await apiDepsInstall({ names: ['git'], execute: false })
      const planned = res.plannedCommands?.['git'] || []
      setCommandsText(planned.join('\n'))
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
      setModalOpen(false)
      refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      message.error(msg)
    } finally {
      setExecuting(false)
    }
  }

  const installedStatus = useMemo(
    () => (item?.installed ? '已安装' : '未安装'),
    [item]
  )

  return (
    <Box>
      <div className="w-full h-full flex sm:p-6 gap-4 flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 duration-300">
        <div className="chatgpt-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold gradient-text">Git 管理</h2>
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
                {item?.installed ? '重装/修复' : '安装'}
              </Button>
            </Space>
          </div>

          <Descriptions bordered size="small" column={1} className="mb-4">
            <Descriptions.Item label="安装状态">
              <Tag color={item?.installed ? 'green' : 'red'}>
                {installedStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {item?.version ? <Text code>{item.version}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              {item?.path ? <Text code>{item.path}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="管理器">
              {item?.manager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="系统">
              {item?.os || '-'}
            </Descriptions.Item>
            {!!item?.notes?.length && (
              <Descriptions.Item label="备注">
                <div className="flex flex-col gap-1">
                  {item.notes.map((n, idx) => (
                    <Text key={idx} type="secondary">
                      {n}
                    </Text>
                  ))}
                </div>
              </Descriptions.Item>
            )}
            {!!item?.errors?.length && (
              <Descriptions.Item label="错误">
                <div className="flex flex-col gap-1">
                  {item.errors.map((n, idx) => (
                    <Text key={idx} type="danger">
                      {n}
                    </Text>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Alert
            type="info"
            showIcon
            message="点击“安装/重装”将生成可编辑的安装脚本，确认后会作为任务执行。"
            className="mb-3"
          />
        </div>
      </div>

      <Modal
        open={modalOpen}
        title="安装脚本 · Git"
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
