import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@/commom/layout/Box'
import { apiTasks, apiTask, apiTaskCancel, Task } from '@/api/system/tasks'
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  List,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm
} from 'antd'
import { useLocation } from 'react-router-dom'

const { Text } = Typography

type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'
const statusColor: Record<Task['status'], BadgeStatus> = {
  pending: 'default',
  running: 'processing',
  success: 'success',
  error: 'error',
  canceled: 'warning'
}

const TasksPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Task[]>([])
  const [selected, setSelected] = useState<Task | null>(null)
  const [polling, setPolling] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const location = useLocation()
  const [initialSelectApplied, setInitialSelectApplied] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await apiTasks()
      setItems(list)
      if (selected) {
        const fresh = list.find(i => i.id === selected.id) || null
        setSelected(fresh)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [selected])

  useEffect(() => {
    refresh()
  }, [refresh])

  // 初次加载后根据 URL 参数 ?select=taskId 自动选中任务
  useEffect(() => {
    if (initialSelectApplied) return
    const params = new URLSearchParams(location.search)
    const selectId = params.get('select')
    if (!selectId) {
      setInitialSelectApplied(true)
      return
    }
    // 如果列表已有，直接选中；否则拉取详情并插入
    const existing = items.find(i => i.id === selectId)
    if (existing) {
      setSelected(existing)
      setInitialSelectApplied(true)
    } else {
      ;(async () => {
        try {
          const t = await apiTask(selectId)
          setItems(prev => {
            const has = prev.some(i => i.id === t.id)
            return has ? prev : [t, ...prev]
          })
          setSelected(t)
        } catch {
          // ignore not found
        } finally {
          setInitialSelectApplied(true)
        }
      })()
    }
  }, [items, location.search, initialSelectApplied])

  // 简单轮询选中任务详情
  useEffect(() => {
    if (
      !selected ||
      ['success', 'error', 'canceled'].includes(selected.status)
    ) {
      setPolling(false)
      return
    }
    setPolling(true)
    const t = setInterval(async () => {
      try {
        const t = await apiTask(selected.id)
        setSelected(t)
        // 同步列表中的那一项
        setItems(prev => prev.map(i => (i.id === t.id ? t : i)))
      } catch {
        // ignore
      }
    }, 1500)
    return () => clearInterval(t)
  }, [selected])

  const logsText = useMemo(() => (selected?.logs || []).join('\n'), [selected])
  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logsText || '')
      message.success('日志已复制到剪贴板')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '复制失败'
      message.error(msg)
    }
  }

  return (
    <Box>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">任务中心</h2>
          <Space>
            <Button onClick={refresh} loading={loading} size="small">
              刷新
            </Button>
            {selected &&
              (selected.status === 'running' ||
                selected.status === 'pending') && (
                <Popconfirm
                  title="确认取消该任务？"
                  okText="取消任务"
                  cancelText="返回"
                  onConfirm={async () => {
                    if (!selected) return
                    try {
                      setCanceling(true)
                      const ok = await apiTaskCancel(selected.id)
                      if (ok) {
                        message.success('已发送取消请求')
                        // 立刻刷新一次
                        const t = await apiTask(selected.id)
                        setSelected(t)
                        setItems(prev => prev.map(i => (i.id === t.id ? t : i)))
                      } else {
                        message.warning('取消失败：可能任务已结束或不可取消')
                      }
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : '取消失败'
                      message.error(msg)
                    } finally {
                      setCanceling(false)
                    }
                  }}
                >
                  <Button danger size="small" loading={canceling}>
                    取消任务
                  </Button>
                </Popconfirm>
              )}
          </Space>
        </div>

        <Alert
          type="info"
          showIcon
          message="展示依赖安装等后台任务的执行进度与日志；选中某条任务可查看实时日志（自动轮询）。"
          className="mb-3"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg border border-white/20 p-3">
            <List
              dataSource={items}
              locale={{ emptyText: '暂无任务' }}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  className="cursor-pointer hover:bg-white/5 rounded"
                  onClick={() => setSelected(item)}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <Badge status={statusColor[item.status]} />
                        <span className="font-medium">{item.type}</span>
                        <Tag>{item.id}</Tag>
                      </div>
                    }
                    description={
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <span>创建时间：{item.createdAt}</span>
                        {item.startedAt && (
                          <span>开始时间：{item.startedAt}</span>
                        )}
                        {item.endedAt && <span>结束时间：{item.endedAt}</span>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>

          <div className="bg-white/10 rounded-lg border border-white/20 p-3 min-h-[360px]">
            {selected ? (
              <>
                <Descriptions size="small" bordered column={1} className="mb-3">
                  <Descriptions.Item label="任务ID">
                    <Text code>{selected.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="类型">
                    {selected.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag
                      color={
                        selected.status === 'success'
                          ? 'green'
                          : selected.status === 'running'
                            ? 'blue'
                            : selected.status === 'pending'
                              ? 'default'
                              : selected.status === 'canceled'
                                ? 'orange'
                                : 'red'
                      }
                    >
                      {selected.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="命令">
                    <div className="flex flex-col gap-1">
                      {selected.commands.map((c, idx) => (
                        <Text key={idx} code>
                          {c}
                        </Text>
                      ))}
                    </div>
                  </Descriptions.Item>
                  {selected.error && (
                    <Descriptions.Item label="错误">
                      <Text type="danger">{selected.error}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <div className="relative group">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="small" onClick={handleCopyLogs}>
                      复制日志
                    </Button>
                  </div>
                  <div className="bg-black text-green-400 p-3 rounded min-h-[200px] text-xs overflow-auto whitespace-pre-wrap">
                    {logsText || '无日志'}
                  </div>
                </div>
                {polling && (
                  <div className="text-xs text-gray-400 mt-2">
                    正在自动刷新日志…
                  </div>
                )}
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                选择左侧任务查看详情和日志
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  )
}

export default TasksPage
