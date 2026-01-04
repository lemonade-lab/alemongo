import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Breadcrumb,
  Button,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Upload,
  message,
  Dropdown,
  type MenuProps
} from 'antd'
import {
  FolderOpenOutlined,
  FileOutlined,
  UploadOutlined,
  ReloadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  DownOutlined
} from '@ant-design/icons'
import {
  sftpInfo,
  sftpList,
  sftpRead,
  sftpDownloadUrl,
  sftpZipUrl,
  sftpUpload,
  sftpWrite,
  sftpMkdir,
  sftpRename,
  sftpDelete,
  sftpCopy
} from '@/api/system/sftp'
import FileEdit from '@/commom/edit/FileEdit'
import Box from '@/commom/layout/Box'
import PermissionGuard from '@/components/PermissionGuard'
import { usePermission } from '@/hook/usePermission'

type Entry = {
  name: string
  path: string
  is_dir: boolean
  size: number
  mod_time: string
}

const SFTPPage = () => {
  const [curPath, setCurPath] = useState<string>('.')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [, setRoot] = useState('')
  const [preview, setPreview] = useState<{
    path: string
    name: string
    content: string
  } | null>(null)
  const [editorLang, setEditorLang] = useState<'yaml' | 'json' | 'env'>('env')
  const [renameValue, setRenameValue] = useState<string>('')
  const { hasPermission } = usePermission()
  const canWrite = hasPermission('admin')
  const canEdit = hasPermission('member')
  const dropRef = useRef<HTMLDivElement>(null)
  const [sortKey, setSortKey] = useState<'name' | 'time'>('name')
  const [sortAsc, setSortAsc] = useState<boolean>(true)

  type Crumb = { label: string; path: string }
  const bread: Crumb[] = useMemo(() => {
    const clean = curPath === '.' ? '' : curPath
    const parts = clean.split('/').filter(Boolean)
    const items: Crumb[] = [{ label: '/', path: '.' }]
    parts.forEach((p, i) => {
      items.push({ label: p, path: parts.slice(0, i + 1).join('/') })
    })
    return items
  }, [curPath])

  const load = useCallback(
    async (p = curPath) => {
      setLoading(true)
      try {
        const info = await sftpInfo()
        setRoot(info?.data?.root || '')
        const res = await sftpList(p)
        setEntries(res?.data?.entries || [])
        setCurPath(p)
      } finally {
        setLoading(false)
      }
    },
    [curPath]
  )

  const openDir = (p: string) => load(p)

  const openFile = async (e: Entry) => {
    const res = await sftpRead(e.path)
    setPreview({
      path: res.data.path,
      name: res.data.name,
      content: res.data.content
    })
    // 简易按后缀识别语言
    const ext = (res.data.name as string).split('.').pop()?.toLowerCase()
    const map: {
      [key: string]: 'json' | 'yaml'
    } = {
      json: 'json',
      yaml: 'yaml'
    }
    setEditorLang((ext && map[ext]) || 'env')
  }

  const goParent = () => {
    if (curPath === '.' || curPath === '') return
    const parent = curPath.split('/').slice(0, -1).join('/') || '.'
    load(parent)
  }

  // 仅在挂载时加载一次根目录，避免每次 curPath 改变时又回到根目录
  useEffect(() => {
    load('.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 拖拽上传 & 复制（通过自定义 copy:// 协议）
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onDrop = (e: DragEvent) => {
      prevent(e)
      if (!canWrite) return
      const files = e.dataTransfer?.files
      if (files && files.length) {
        Array.from(files).forEach(f => {
          sftpUpload(curPath, f).then(() => load())
        })
      }
      const text = e.dataTransfer?.getData('text/plain')
      if (text && text.startsWith('copy://')) {
        const src = decodeURIComponent(text.replace('copy://', ''))
        const base = curPath === '.' ? '' : curPath + '/'
        const name = src.split('/').pop() || 'copy'
        sftpCopy(src, base + name).then(() => load())
      }
    }
    el.addEventListener('dragover', prevent)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragover', prevent)
      el.removeEventListener('drop', onDrop)
    }
  }, [curPath, canWrite, load])

  // 排序后的数据
  const sortedEntries = useMemo(() => {
    const list = [...entries]
    list.sort((a, b) => {
      if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1 // 目录优先
      if (sortKey === 'name') {
        const r = a.name.localeCompare(b.name)
        return sortAsc ? r : -r
      } else {
        const at = new Date(a.mod_time).getTime()
        const bt = new Date(b.mod_time).getTime()
        const r = at - bt
        return sortAsc ? r : -r
      }
    })
    return list
  }, [entries, sortKey, sortAsc])

  return (
    <Box>
      <div
        ref={dropRef}
        className="p-2 flex gap-4 flex-col transition-colors flex-1"
      >
        <div className="flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={goParent}
              disabled={curPath === '.'}
            >
              上一级
            </Button>
            <Breadcrumb>
              {bread.map((b, i) => (
                <Breadcrumb.Item key={i}>
                  <a onClick={() => openDir(b.path)}>{b.label}</a>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
            <Button icon={<ReloadOutlined />} onClick={() => load()}>
              刷新
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'name',
                    label: '按名称排序',
                    onClick: () => {
                      setSortKey('name')
                      setSortAsc(true)
                    }
                  },
                  {
                    key: 'nameDesc',
                    label: '按名称倒序',
                    onClick: () => {
                      setSortKey('name')
                      setSortAsc(false)
                    }
                  },
                  {
                    key: 'time',
                    label: '按时间排序',
                    onClick: () => {
                      setSortKey('time')
                      setSortAsc(true)
                    }
                  },
                  {
                    key: 'timeDesc',
                    label: '按时间倒序',
                    onClick: () => {
                      setSortKey('time')
                      setSortAsc(false)
                    }
                  }
                ]
              }}
            >
              <Button>排序</Button>
            </Dropdown>
          </div>
          <Space>
            <PermissionGuard requiredIdentity="admin" showError={false}>
              <div className="flex gap-2">
                <Upload
                  showUploadList={false}
                  beforeUpload={file => {
                    sftpUpload(curPath, file).then(() => {
                      message.success('上传成功')
                      load()
                    })
                    return false
                  }}
                >
                  <Button icon={<UploadOutlined />}>上传</Button>
                </Upload>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    let value = ''
                    Modal.confirm({
                      title: '新建目录',
                      content: (
                        <Input
                          placeholder="目录名"
                          onChange={e => (value = e.target.value)}
                        />
                      ),
                      onOk: async () => {
                        if (!value) return Promise.reject()
                        await sftpMkdir(
                          (curPath === '.' ? '' : curPath + '/') + value
                        )
                        message.success('创建成功')
                        load()
                      }
                    })
                  }}
                >
                  新建目录
                </Button>
                <Button
                  icon={<FileOutlined />}
                  onClick={() => {
                    let fname = ''
                    Modal.confirm({
                      title: '新建文件',
                      content: (
                        <Input
                          placeholder="文件名"
                          onChange={e => (fname = e.target.value)}
                        />
                      ),
                      onOk: async () => {
                        if (!fname) return Promise.reject()
                        const path =
                          (curPath === '.' ? '' : curPath + '/') + fname
                        await sftpWrite(path, '')
                        message.success('已创建')
                        load()
                      }
                    })
                  }}
                >
                  新建文件
                </Button>
              </div>
            </PermissionGuard>
          </Space>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-2 bg-white dark:bg-zinc-900">
            <List
              loading={loading}
              dataSource={sortedEntries}
              locale={{ emptyText: <Empty description="空目录" /> }}
              renderItem={item => (
                <List.Item
                  onClick={() =>
                    item.is_dir ? openDir(item.path) : openFile(item)
                  }
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/40 rounded-md"
                  actions={[
                    (() => {
                      const items: MenuProps['items'] = [
                        ...(item.is_dir
                          ? [
                              {
                                key: 'open',
                                label: '打开',
                                onClick: () => openDir(item.path)
                              } as any,
                              {
                                key: 'download-zip',
                                label: (
                                  <a
                                    href={sftpZipUrl(item.path)}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    下载ZIP
                                  </a>
                                )
                              } as any
                            ]
                          : [
                              {
                                key: 'edit',
                                label: '编辑',
                                disabled: !canEdit,
                                onClick: () => openFile(item)
                              } as any,
                              {
                                key: 'download',
                                label: (
                                  <a
                                    href={sftpDownloadUrl(item.path)}
                                    download
                                    onClick={e => e.stopPropagation()}
                                  >
                                    下载
                                  </a>
                                )
                              } as any
                            ]),
                        { type: 'divider' },
                        {
                          key: 'copy',
                          label: '复制到当前目录',
                          disabled: !canWrite,
                          onClick: async () => {
                            const base = curPath === '.' ? '' : curPath + '/'
                            const name = item.name
                            await sftpCopy(item.path, base + name)
                            message.success('已复制')
                            load()
                          }
                        } as any,
                        {
                          key: 'rename',
                          label: '重命名',
                          disabled: !canWrite,
                          onClick: () => {
                            setRenameValue(item.name)
                            Modal.confirm({
                              title: `重命名 ${item.name}`,
                              content: (
                                <Input
                                  defaultValue={item.name}
                                  onChange={e => setRenameValue(e.target.value)}
                                />
                              ),
                              onOk: async () => {
                                if (!renameValue) return Promise.reject()
                                const base =
                                  curPath === '.' ? '' : curPath + '/'
                                await sftpRename(
                                  `${base}${item.name}`,
                                  `${base}${renameValue}`
                                )
                                message.success('重命名成功')
                                setRenameValue('')
                                load()
                              }
                            })
                          }
                        } as any,
                        {
                          key: 'delete',
                          label: '删除',
                          danger: true,
                          disabled: !canWrite,
                          onClick: () => {
                            Modal.confirm({
                              title: `删除 ${item.name}`,
                              onOk: async () => {
                                await sftpDelete(item.path, item.is_dir)
                                message.success('删除成功')
                                load()
                              }
                            })
                          }
                        } as any
                      ]
                      return (
                        <Dropdown
                          key="ops"
                          placement="bottomRight"
                          menu={{ items }}
                        >
                          <Button
                            onClick={e => e.stopPropagation()}
                            icon={<DownOutlined />}
                          >
                            操作
                          </Button>
                        </Dropdown>
                      )
                    })()
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      item.is_dir ? <FolderOpenOutlined /> : <FileOutlined />
                    }
                    title={<span>{item.name}</span>}
                    description={`${item.is_dir ? '目录' : '文件'} · ${new Date(item.mod_time).toLocaleString()} · ${item.size}B`}
                  />
                </List.Item>
              )}
            />
          </div>

          {preview ? (
            <PermissionGuard requiredIdentity="member" showError={false}>
              <FileEdit
                name={preview.name}
                value={preview.content}
                disableName
                language={editorLang}
                onSave={async (_, val) => {
                  await sftpWrite(preview.path, val)
                  message.success('已保存')
                }}
              />
            </PermissionGuard>
          ) : (
            <div className="border flex items-center justify-center rounded-md p-2 bg-white dark:bg-zinc-900 min-h-[300px]">
              <Empty description="选择一个文件以预览/编辑" />
            </div>
          )}
        </div>
      </div>
    </Box>
  )
}

export default SFTPPage
