import { useEffect, useState, useCallback } from 'react'
import { List, Badge, Button, Empty, Spin, Popconfirm, Tabs } from 'antd'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  deleteNotification,
  NotificationItem
} from '@/api'

const PAGE_SIZE = 15

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  refreshSignal?: number // 外部触发刷新
  onUnreadChange?: (count: number) => void
}

export default function NotificationDrawer({
  open,
  onClose,
  refreshSignal = 0,
  onUnreadChange
}: NotificationDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<NotificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('unread')
  const [unread, setUnread] = useState(0)
  const [refreshFlag, setRefreshFlag] = useState(0)

  const loadUnread = useCallback(() => {
    fetchUnreadCount()
      .then(r => {
        setUnread(r.unread)
        onUnreadChange?.(r.unread)
      })
      .catch(() => {})
  }, [onUnreadChange])

  const loadList = useCallback(() => {
    setLoading(true)
    fetchNotifications({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      page_size: PAGE_SIZE
    })
      .then(r => {
        setList(r.list || [])
        setTotal(r.total || 0)
      })
      .finally(() => setLoading(false))
  }, [statusFilter, page])

  useEffect(() => {
    if (open) {
      loadList()
      loadUnread()
    }
  }, [
    open,
    statusFilter,
    page,
    refreshFlag,
    loadList,
    loadUnread,
    refreshSignal
  ])

  const handleMarkRead = (item: NotificationItem) => {
    if (item.status === 'read') return
    markNotificationRead(item.id).then(() => {
      setRefreshFlag(f => f + 1)
      loadUnread()
    })
  }

  const handleDelete = (item: NotificationItem) => {
    deleteNotification(item.id).then(() => {
      setRefreshFlag(f => f + 1)
      loadUnread()
    })
  }

  const tabs = [
    {
      key: 'unread',
      label: (
        <Badge count={unread} size="small">
          未读
        </Badge>
      )
    },
    { key: 'read', label: '已读' },
    { key: 'all', label: '全部' }
  ]

  return (
    <div className="h-full flex flex-col">
      <Tabs
        activeKey={statusFilter}
        onChange={k => {
          setStatusFilter(k)
          setPage(1)
        }}
        items={tabs.map(t => ({ key: t.key, label: t.label }))}
        size="small"
      />
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spin />
          </div>
        ) : list.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />
        ) : (
          <List
            size="small"
            dataSource={list}
            renderItem={item => (
              <List.Item
                className={
                  item.status === 'unread'
                    ? 'bg-yellow-50 dark:bg-zinc-700/40 rounded px-2'
                    : 'px-2'
                }
                actions={[
                  item.status === 'unread' && (
                    <a key="mark" onClick={() => handleMarkRead(item)}>
                      已读
                    </a>
                  ),
                  <Popconfirm
                    key="del"
                    title="删除通知?"
                    onConfirm={() => handleDelete(item)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <a>删除</a>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="text-xs flex items-center gap-2">
                      {item.type && (
                        <span className="px-1 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded text-[10px]">
                          {item.type}
                        </span>
                      )}
                      <span className="font-medium">{item.title}</span>
                      {item.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      )}
                    </div>
                  }
                  description={
                    <div className="text-[11px] whitespace-pre-line text-zinc-600 dark:text-zinc-300">
                      {item.content}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      {total > PAGE_SIZE && (
        <div className="py-2 text-center text-xs text-zinc-500">
          <span>
            第 {page} 页 / 共 {Math.ceil(total / PAGE_SIZE)} 页{' '}
          </span>
          {page > 1 && (
            <Button
              size="small"
              type="link"
              onClick={() => setPage(p => p - 1)}
            >
              上一页
            </Button>
          )}
          {page * PAGE_SIZE < total && (
            <Button
              size="small"
              type="link"
              onClick={() => setPage(p => p + 1)}
            >
              下一页
            </Button>
          )}
        </div>
      )}
      <div className="pt-2 text-right">
        <Button size="small" onClick={onClose}>
          关闭
        </Button>
      </div>
    </div>
  )
}
