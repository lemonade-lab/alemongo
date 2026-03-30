import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Button,
  Spin,
  Switch,
  Tag,
  message,
  Modal,
  Input,
  Form,
  Space,
  Tooltip,
  Collapse,
  Empty,
  Popconfirm,
  DatePicker,
  Select
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  FileAddOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  CodeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  CopyOutlined,
  SearchOutlined,
  CheckOutlined,
  StopOutlined,
  MonitorOutlined
} from '@ant-design/icons'
import { Box, Markdown, Pagination } from '@/commom'
import {
  apiMultiBotList,
  apiMultiBotCreate,
  apiMultiBotStart,
  apiMultiBotStop,
  apiMultiBotRestart,
  apiMultiBotAddConfig,
  apiMultiBotDelete,
  apiMultiBotYarnInstall,
  apiMultiBotInstanceStart,
  apiMultiBotInstanceStop,
  apiMultiBotInstanceRestart,
  apiMultiBotConfigRead,
  apiMultiBotConfigUpdate,
  apiMultiBotConfigDelete,
  apiMultiBotEnvRead,
  apiMultiBotEnvUpdate,
  apiMultiBotLog,
  apiMultiBotLogDelete,
  getMultiBotLogDownloadUrl,
  apiMultiBotPackageRead,
  apiMultiBotPackageUpdate,
  apiMultiBotPackagesList,
  apiMultiBotPackagesClone,
  apiMultiBotPackagesDelete,
  apiMultiBotPackagesPull,
  apiMultiBotPackagesPullForce,
  apiMultiBotPackagesUpdate,
  apiMultiBotPackagesInfo,
  apiMultiBotConfigsList,
  apiMultiBotConfigHistoryList,
  apiMultiBotConfigHistoryRead,
  apiMultiBotConfigHistoryRestore,
  MultiBotInfo,
  MultiBotPackage,
  MultiBotConfigHistoryItem,
  apiMultiBotToggleEnabled
} from '@/api'
import { createAuthedWS } from '@/api/ws'
import classNames from 'classnames'
import ProcessPortModal from '@/components/ProcessPortModal'
import JSONEdit from '@/commom/edit/JSONEdit'
import dayjs from 'dayjs'
import { updateYamlAppsPreserveComments } from '@/utils/yaml'

const { TextArea } = Input

const MultiBots = () => {
  const [loading, setLoading] = useState(true)
  const [bots, setBots] = useState<MultiBotInfo[]>([])
  const [createVisible, setCreateVisible] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [selectedBot, setSelectedBot] = useState<string>('')
  const [addConfigName, setAddConfigName] = useState('')
  const [addConfigContent, setAddConfigContent] = useState('')
  const [addConfigLoading, setAddConfigLoading] = useState(false)
  const [form] = Form.useForm()

  // 端口弹窗
  const [portModalVisible, setPortModalVisible] = useState(false)
  const [portInfo, setPortInfo] = useState<{
    name: string
    pid: number
  } | null>(null)

  // 配置查看/编辑弹窗
  const [editConfigVisible, setEditConfigVisible] = useState(false)
  const [editConfigBot, setEditConfigBot] = useState('')
  const [editConfigName, setEditConfigName] = useState('')
  const [editConfigContent, setEditConfigContent] = useState('')
  const [editConfigLoading, setEditConfigLoading] = useState(false)
  const [configHistoryVisible, setConfigHistoryVisible] = useState(false)
  const [configHistoryLoading, setConfigHistoryLoading] = useState(false)
  const [configHistoryList, setConfigHistoryList] = useState<MultiBotConfigHistoryItem[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState('')
  const [selectedHistoryContent, setSelectedHistoryContent] = useState('')
  const [selectedHistoryLoading, setSelectedHistoryLoading] = useState(false)

  // 环境变量弹窗
  const [envVisible, setEnvVisible] = useState(false)
  const [envBot, setEnvBot] = useState('')
  const [envContent, setEnvContent] = useState('')
  const [envLoading, setEnvLoading] = useState(false)

  // yarn安装中
  const [installingBots, setInstallingBots] = useState<Set<string>>(new Set())

  // 日志弹窗
  const [logVisible, setLogVisible] = useState(false)
  const [logBot, setLogBot] = useState('')
  const [logProcess, setLogProcess] = useState('')
  const [logLines, setLogLines] = useState<string[]>([])
  const [logLoading, setLogLoading] = useState(false)
  const logScrollRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [logStreaming, setLogStreaming] = useState(false)
  const [logAutoScroll, setLogAutoScroll] = useState(true)
  const [logPaused, setLogPaused] = useState(false)
  const logAutoScrollRef = useRef(true)
  const logPausedRef = useRef(false)
  const logMountedRef = useRef(false)
  const logRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logRetryCountRef = useRef(0)
  const logUserScrolledRef = useRef(false)
  const [logMode, setLogMode] = useState<'online' | 'query'>('online')

  // 日志查询
  const [logQueryTimestamp, setLogQueryTimestamp] = useState<number>(Date.now())
  const [logQueryLines, setLogQueryLines] = useState<string[]>([])
  const [logQueryLoading, setLogQueryLoading] = useState(false)
  const [logQueryPage, setLogQueryPage] = useState(1)
  const [logQueryPageSize] = useState(100)
  const [logQueryTotal, setLogQueryTotal] = useState(0)

  // 应用管理弹窗
  const [pkgsVisible, setPkgsVisible] = useState(false)
  const [pkgsBot, setPkgsBot] = useState('')
  const [pkgsList, setPkgsList] = useState<MultiBotPackage[]>([])
  const [pkgsLoading, setPkgsLoading] = useState(false)
  const [cloneVisible, setCloneVisible] = useState(false)
  const [cloneForm] = Form.useForm()

  // 包配置 (package.json) 弹窗
  const [botPkgVisible, setBotPkgVisible] = useState(false)
  const [botPkgBot, setBotPkgBot] = useState('')
  const [botPkgContent, setBotPkgContent] = useState('')
  const [botPkgLoading, setBotPkgLoading] = useState(false)

  // 应用包配置编辑弹窗
  const [pkgEditVisible, setPkgEditVisible] = useState(false)
  const [pkgEditName, setPkgEditName] = useState('')
  const [pkgEditContent, setPkgEditContent] = useState('')
  const [pkgEditLoading, setPkgEditLoading] = useState(false)
  const [pkgReadmeVisible, setPkgReadmeVisible] = useState(false)
  const [pkgReadmeName, setPkgReadmeName] = useState('')
  const [pkgReadmeContent, setPkgReadmeContent] = useState('')

  const getPackageMeta = (pkgContent: string) => {
    try {
      const parsed = JSON.parse(pkgContent || '{}')
      return {
        name: typeof parsed.name === 'string' ? parsed.name : '-',
        version: typeof parsed.version === 'string' ? parsed.version : '-',
        description:
          typeof parsed.description === 'string' ? parsed.description : '-'
      }
    } catch {
      return {
        name: '-',
        version: '-',
        description: '-'
      }
    }
  }

  const fetchList = () => {
    setLoading(true)
    apiMultiBotList()
      .then(res => {
        setBots(res || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  // 创建
  const onCreateSubmit = (values: { name: string }) => {
    const reg = /^[a-zA-Z0-9_]+$/
    if (!reg.test(values.name)) {
      message.error('名称只能包含英文、数字、下划线')
      return
    }
    apiMultiBotCreate({ name: values.name }).then(() => {
      message.success('创建成功')
      setCreateVisible(false)
      form.resetFields()
      fetchList()
    })
  }

  // 添加配置
  const onAddConfig = (name: string, content: string) => {
    if (!name.trim()) {
      message.error('请输入配置名称')
      return
    }
    setAddConfigLoading(true)
    apiMultiBotAddConfig({
      bot_name: selectedBot,
      name: name.trim(),
      content
    })
      .then(() => {
        message.success('配置已添加')
        setConfigVisible(false)
        setAddConfigName('')
        setAddConfigContent('')
        fetchList()
      })
      .finally(() => setAddConfigLoading(false))
  }

  // 删除多配置机器人
  const onDelete = (name: string) => {
    Modal.confirm({
      title: '删除多配置机器人',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `确定删除 "${name}" 吗？将停止所有实例并删除整个目录，此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        return apiMultiBotDelete({ name }).then(() => {
          message.success('删除成功')
          fetchList()
        })
      }
    })
  }

  // Yarn Install
  const onYarnInstall = (name: string) => {
    setInstallingBots(prev => new Set(prev).add(name))
    message.loading({ content: `正在安装依赖...`, key: `yarn-${name}`, duration: 0 })
    apiMultiBotYarnInstall({ name })
      .then(() => {
        message.success({ content: '依赖安装成功', key: `yarn-${name}` })
        fetchList()
      })
      .catch(() => {
        message.error({ content: '依赖安装失败', key: `yarn-${name}` })
      })
      .finally(() => {
        setInstallingBots(prev => {
          const next = new Set(prev)
          next.delete(name)
          return next
        })
      })
  }

  // 启动全部
  const onStart = (name: string) => {
    apiMultiBotStart({ name }).then(msg => {
      message.success(msg || '启动成功')
      fetchList()
    })
  }

  // 停止全部
  const onStop = (name: string) => {
    Modal.confirm({
      title: '停止多配置机器人',
      icon: <ExclamationCircleOutlined className="text-orange-500" />,
      content: `确定停止 "${name}" 的所有运行实例吗？`,
      okText: '确认停止',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        apiMultiBotStop({ name }).then(msg => {
          message.success(msg || '已停止')
          fetchList()
        })
      }
    })
  }

  // 重启全部
  const onRestart = (name: string) => {
    apiMultiBotRestart({ name }).then(msg => {
      message.success(msg || '已重启')
      fetchList()
    })
  }

  // 单实例启动
  const onInstanceStart = (name: string, configName: string) => {
    apiMultiBotInstanceStart({ name, config_name: configName }).then(msg => {
      message.success(msg || '启动成功')
      fetchList()
    })
  }

  // 单实例停止
  const onInstanceStop = (name: string, configName: string) => {
    apiMultiBotInstanceStop({ name, config_name: configName }).then(msg => {
      message.success(msg || '已停止')
      fetchList()
    })
  }

  // 单实例重启
  const onInstanceRestart = (name: string, configName: string) => {
    apiMultiBotInstanceRestart({ name, config_name: configName }).then(msg => {
      message.success(msg || '已重启')
      fetchList()
    })
  }

  // 切换配置启用状态
  const onToggleEnabled = (name: string, configName: string, enabled: boolean) => {
    apiMultiBotToggleEnabled({ name, config_name: configName, enabled }).then(msg => {
      message.success(msg || (enabled ? '已启用' : '已禁用'))
      fetchList()
    })
  }

  // 查看/编辑配置
  const onOpenConfig = (botName: string, cfgName: string) => {
    setEditConfigBot(botName)
    setEditConfigName(cfgName)
    setEditConfigLoading(true)
    setEditConfigVisible(true)
    apiMultiBotConfigRead({ bot_name: botName, name: cfgName })
      .then(content => {
        setEditConfigContent(content || '')
      })
      .finally(() => setEditConfigLoading(false))
  }

  const loadConfigHistory = (botName: string, cfgName: string) => {
    setConfigHistoryLoading(true)
    apiMultiBotConfigHistoryList({ bot_name: botName, name: cfgName })
      .then(res => {
        setConfigHistoryList(res || [])
      })
      .finally(() => setConfigHistoryLoading(false))
  }

  const onOpenConfigHistory = () => {
    if (!editConfigBot || !editConfigName) return
    setConfigHistoryVisible(true)
    setSelectedHistoryId('')
    setSelectedHistoryContent('')
    loadConfigHistory(editConfigBot, editConfigName)
  }

  const onSelectConfigHistory = (historyID: string) => {
    setSelectedHistoryId(historyID)
    setSelectedHistoryLoading(true)
    apiMultiBotConfigHistoryRead({
      bot_name: editConfigBot,
      name: editConfigName,
      history_id: historyID
    })
      .then(content => {
        setSelectedHistoryContent(content || '')
      })
      .finally(() => setSelectedHistoryLoading(false))
  }

  const onRestoreConfigHistory = () => {
    if (!selectedHistoryId) {
      message.warning('请先选择一个历史版本')
      return
    }
    setSelectedHistoryLoading(true)
    apiMultiBotConfigHistoryRestore({
      bot_name: editConfigBot,
      name: editConfigName,
      history_id: selectedHistoryId
    })
      .then(content => {
        setEditConfigContent(content || '')
        message.success('已恢复到所选历史版本')
        setConfigHistoryVisible(false)
      })
      .finally(() => setSelectedHistoryLoading(false))
  }

  const onSaveConfig = (_name: string, content: string) => {
    setEditConfigLoading(true)
    apiMultiBotConfigUpdate({
      bot_name: editConfigBot,
      name: editConfigName,
      content
    })
      .then(() => {
        message.success('配置已保存')
        setEditConfigContent(content)
        setEditConfigVisible(false)
      })
      .finally(() => setEditConfigLoading(false))
  }

  // 删除配置
  const onDeleteConfig = (botName: string, cfgName: string) => {
    apiMultiBotConfigDelete({ bot_name: botName, name: cfgName }).then(() => {
      message.success('配置已删除')
      fetchList()
    })
  }

  // 环境变量
  const onOpenEnv = (botName: string) => {
    setEnvBot(botName)
    setEnvLoading(true)
    setEnvVisible(true)
    apiMultiBotEnvRead({ name: botName })
      .then(content => {
        setEnvContent(content || '')
      })
      .finally(() => setEnvLoading(false))
  }

  const onSaveEnv = () => {
    setEnvLoading(true)
    apiMultiBotEnvUpdate({ name: envBot, content: envContent })
      .then(() => {
        message.success('环境变量已保存')
        setEnvVisible(false)
      })
      .finally(() => setEnvLoading(false))
  }

  // ========= 在线日志 =========

  // 同步 ref
  useEffect(() => {
    logPausedRef.current = logPaused
  }, [logPaused])

  const logScrollToBottom = useCallback(() => {
    const el = logScrollRef.current
    if (!el) return
    el.scrollTop = 0 // flex-col-reverse: 0 = bottom
  }, [])

  useEffect(() => {
    logAutoScrollRef.current = logAutoScroll
    if (logAutoScroll) {
      logUserScrolledRef.current = false
      logScrollToBottom()
    }
  }, [logAutoScroll, logScrollToBottom])

  // 用户手动滚动检测
  useEffect(() => {
    const el = logScrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (Math.abs(el.scrollTop) > 30) {
        if (logAutoScrollRef.current && !logUserScrolledRef.current) {
          logUserScrolledRef.current = true
          setLogAutoScroll(false)
        }
      } else {
        logUserScrolledRef.current = false
      }
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [logVisible])

  // 数据变化时自动滚到底部
  useEffect(() => {
    if (logAutoScrollRef.current) logScrollToBottom()
  }, [logLines, logScrollToBottom])

  const logRenderData = useMemo(() => logLines.slice(-200), [logLines])

  const connectLogWS = useCallback((botName: string, processName: string) => {
    if (!logMountedRef.current) return
    try {
      const ws = createAuthedWS(
        `/multibot/log/ws?name=${encodeURIComponent(botName)}&process_name=${encodeURIComponent(processName)}&size=200&timestamp=${Date.now()}`
      )
      wsRef.current = ws
      ws.onopen = () => {
        setLogLoading(false)
        setLogStreaming(true)
        logRetryCountRef.current = 0
      }
      ws.onmessage = (evt) => {
        if (logPausedRef.current) return
        try {
          const msg = JSON.parse(evt.data)
          if (msg?.type === 'init') {
            const lines = String(msg.data || '').split('\n').filter((l: string) => l.trim() !== '')
            setLogLines(lines)
          } else if (msg?.type === 'append') {
            const line = String(msg.data || '')
            if (!line.trim()) return
            setLogLines(prev => [...prev, line])
          }
        } catch {
          const text = String(evt.data || '')
          if (text.trim()) setLogLines(prev => [...prev, text])
        }
      }
      ws.onclose = () => {
        setLogStreaming(false)
        if (!logMountedRef.current) return
        const attempt = Math.min(logRetryCountRef.current + 1, 6)
        logRetryCountRef.current = attempt
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        if (logRetryTimerRef.current) clearTimeout(logRetryTimerRef.current)
        logRetryTimerRef.current = setTimeout(() => connectLogWS(botName, processName), delay)
      }
      ws.onerror = () => { /* onclose handles retry */ }
    } catch {
      if (logMountedRef.current) {
        logRetryTimerRef.current = setTimeout(() => connectLogWS(botName, processName), 2000)
      }
    }
  }, [])

  const onOpenLog = (botName: string, processName: string) => {
    setLogBot(botName)
    setLogProcess(processName)
    setLogLines([])
    setLogLoading(true)
    setLogVisible(true)
    setLogStreaming(false)
    setLogPaused(false)
    setLogAutoScroll(true)
    setLogMode('online')
    logMountedRef.current = true
    logRetryCountRef.current = 0
    connectLogWS(botName, processName)
  }

  const onCloseLog = () => {
    logMountedRef.current = false
    if (logRetryTimerRef.current) clearTimeout(logRetryTimerRef.current)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }
    wsRef.current = null
    setLogStreaming(false)
    setLogVisible(false)
  }

  // 切换日志模式
  const switchLogMode = (mode: 'online' | 'query') => {
    if (mode === logMode) return
    setLogMode(mode)
    if (mode === 'online') {
      // 重新连接 WebSocket
      setLogLines([])
      setLogLoading(true)
      logMountedRef.current = true
      logRetryCountRef.current = 0
      connectLogWS(logBot, logProcess)
    } else {
      // 停止 WebSocket
      logMountedRef.current = false
      if (logRetryTimerRef.current) clearTimeout(logRetryTimerRef.current)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      wsRef.current = null
      setLogStreaming(false)
      // 加载查询日志
      fetchLogQuery()
    }
  }

  const fetchLogQuery = useCallback(() => {
    setLogQueryLoading(true)
    apiMultiBotLog({
      name: logBot,
      process_name: logProcess,
      timestamp: logQueryTimestamp,
      page: String(logQueryPage),
      pageSize: String(logQueryPageSize)
    })
      .then(res => {
        const lines = (res?.log || '').split('\n').filter((l: string) => l.trim() !== '')
        setLogQueryLines(lines)
        setLogQueryTotal(res?.count || 0)
      })
      .finally(() => setLogQueryLoading(false))
  }, [logBot, logProcess, logQueryTimestamp, logQueryPage, logQueryPageSize])

  // 日期/页码变化时重新查询
  useEffect(() => {
    if (logMode === 'query' && logVisible) {
      fetchLogQuery()
    }
  }, [logQueryTimestamp, logQueryPage, logMode, logVisible, fetchLogQuery])

  const onCopyLogPage = async () => {
    const lines = logMode === 'online' ? logRenderData : logQueryLines
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      message.success('已复制当前页日志')
    } catch {
      message.error('复制失败')
    }
  }

  const onDeleteLog = () => {
    apiMultiBotLogDelete({
      name: logBot,
      process_name: logProcess,
      timestamp: Date.now()
    }).then(() => {
      message.success('日志已清空')
      setLogLines([])
    })
  }

  const onDownloadLog = () => {
    const dateStr = logMode === 'query'
      ? dayjs(logQueryTimestamp).format('YYYY-MM-DD')
      : new Date().toISOString().slice(0, 10)
    const url = getMultiBotLogDownloadUrl(logBot, logProcess, dateStr)
    window.open(url, '_blank')
  }

  // ========= 应用管理 =========
  const onOpenPackages = (botName: string) => {
    setPkgsBot(botName)
    setPkgsLoading(true)
    setPkgsVisible(true)

    apiMultiBotPackagesList({ name: botName })
      .then(res => setPkgsList(res || []))
      .finally(() => setPkgsLoading(false))
  }

  const refreshPackages = () => {
    setPkgsLoading(true)
    apiMultiBotPackagesList({ name: pkgsBot })
      .then(res => setPkgsList(res || []))
      .finally(() => setPkgsLoading(false))
  }

  const onCloneSubmit = (values: { repo_url: string; branch_name: string; force?: boolean }) => {
    const proxy = cloneForm.getFieldValue('proxy') as string | undefined
    let repoURL = values.repo_url.trim()

    if (
      proxy &&
      proxy !== 'direct' &&
      /^https:\/\/github\.com\//i.test(repoURL) &&
      !repoURL.startsWith(proxy)
    ) {
      repoURL = `${proxy}${repoURL}`
    }

    setPkgsLoading(true)
    apiMultiBotPackagesClone({
      name: pkgsBot,
      repo_url: repoURL,
      branch_name: values.branch_name,
      force: values.force ? '1' : undefined
    })
      .then(() => {
        message.success('克隆成功')
        setCloneVisible(false)
        cloneForm.resetFields()
        refreshPackages()
      })
      .catch(() => message.error('克隆失败'))
      .finally(() => setPkgsLoading(false))
  }

  const onDeletePackage = (appName: string) => {
    apiMultiBotPackagesDelete({ name: pkgsBot, app_name: appName }).then(() => {
      message.success('应用已删除')
      refreshPackages()
    })
  }

  // 查看/编辑机器人 package.json
  const onOpenBotPkg = (botName: string) => {
    setBotPkgBot(botName)
    setBotPkgLoading(true)
    setBotPkgVisible(true)
    apiMultiBotPackageRead({ name: botName })
      .then((content: string) => {
        setBotPkgContent(content || '{}')
      })
      .finally(() => setBotPkgLoading(false))
  }

  const onSaveBotPkg = () => {
    setBotPkgLoading(true)
    apiMultiBotPackageUpdate({ name: botPkgBot, content: botPkgContent })
      .then(() => {
        message.success('package.json 已保存')
        setBotPkgVisible(false)
      })
      .catch(() => message.error('保存失败'))
      .finally(() => setBotPkgLoading(false))
  }

  // 编辑应用包 package.json
  const onOpenPkgEdit = (appName: string) => {
    setPkgEditName(appName)
    setPkgEditLoading(true)
    setPkgEditVisible(true)
    apiMultiBotPackagesInfo({ name: pkgsBot, app_name: appName })
      .then((res: MultiBotPackage | null) => {
        setPkgEditContent(res?.pkg || '{}')
      })
      .finally(() => setPkgEditLoading(false))
  }

  const onOpenPkgReadme = (pkg: MultiBotPackage) => {
    setPkgReadmeName(pkg.name)
    setPkgReadmeContent(pkg.md || '')
    setPkgReadmeVisible(true)
  }

  const onSavePkgEdit = () => {
    setPkgEditLoading(true)
    apiMultiBotPackagesUpdate({
      name: pkgsBot,
      app_name: pkgEditName,
      content: pkgEditContent
    })
      .then(() => {
        message.success('配置已保存')
        setPkgEditVisible(false)
        refreshPackages()
      })
      .catch(() => message.error('保存失败'))
      .finally(() => setPkgEditLoading(false))
  }

  const onPullPackage = (pkg: MultiBotPackage) => {
    setPkgsLoading(true)
    apiMultiBotPackagesPull({
      name: pkgsBot,
      repo_name: pkg.name,
      branch_name: pkg.git.branch
    })
      .then(() => {
        message.success('拉取成功')
        refreshPackages()
      })
      .finally(() => setPkgsLoading(false))
  }

  const onForcePullPackage = (pkg: MultiBotPackage) => {
    setPkgsLoading(true)
    apiMultiBotPackagesPullForce({
      name: pkgsBot,
      repo_name: pkg.name,
      branch_name: pkg.git.branch
    })
      .then(() => {
        message.success('强制更新成功')
        refreshPackages()
      })
      .finally(() => setPkgsLoading(false))
  }

  // 启用/停用应用（在所有配置中添加/移除 apps 数组中的包名）
  const onTogglePackage = async (pkg: MultiBotPackage, enable: boolean) => {
    setPkgsLoading(true)
    try {
      // 获取包名
      let pkgName = pkg.name
      try {
        const pkgJSON = JSON.parse(pkg.pkg)
        if (pkgJSON.name) pkgName = pkgJSON.name
      } catch { /* use dir name */ }

      // 获取所有配置文件
      const configs = await apiMultiBotConfigsList(pkgsBot)
      if (!configs || configs.length === 0) {
        message.warning('该机器人没有配置文件，请先添加配置')
        setPkgsLoading(false)
        return
      }

      let updated = 0
      for (const cfgName of configs) {
        const content = await apiMultiBotConfigRead({ bot_name: pkgsBot, name: cfgName })
        const result = updateYamlAppsPreserveComments(content || '', pkgName, enable)
        if (!result.changed) {
          continue // 无需改动
        }
        await apiMultiBotConfigUpdate({
          bot_name: pkgsBot,
          name: cfgName,
          content: result.content
        })
        updated++
      }

      if (updated > 0) {
        message.success(`已在 ${updated} 个配置中${enable ? '启用' : '停用'} ${pkgName}`)
      } else {
        message.info(`所有配置已是${enable ? '启用' : '停用'}状态`)
      }
    } catch {
      message.error('操作失败')
    } finally {
      setPkgsLoading(false)
    }
  }

  // 统计运行实例数
  const runningCount = (bot: MultiBotInfo) =>
    (bot.instances || []).filter(i => i.status === 1).length

  return (
    <Box>
      <Spin spinning={loading} tip="加载中...">
        <div className="w-full flex flex-col gap-6">
          {/* 顶部 */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">多进程机器</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                一个文件夹，多份配置，多进程并行启动
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateVisible(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
            >
              新建
            </Button>
          </div>

          {/* 列表 */}
          {bots.length === 0 && !loading ? (
            <div className="flex justify-center py-20">
              <Empty description="暂无多配置机器人，点击右上角新建" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bots.map(bot => (
                <div
                  key={bot.name}
                  className={classNames(
                    'rounded-xl p-5',
                    'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                    'border border-white/30 dark:border-gray-700/30',
                    'shadow-sm hover:shadow-md transition-shadow duration-200'
                  )}
                >
                  {/* 头部 */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {bot.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>创建: {bot.create_at || '-'}</span>
                        <Tag color={bot.node_modules ? 'green' : 'orange'}>
                          {bot.node_modules ? '依赖已安装' : '未安装依赖'}
                        </Tag>
                        <Tag
                          color={
                            runningCount(bot) > 0 ? 'blue' : 'default'
                          }
                        >
                          {runningCount(bot)} / {(bot.configs || []).length}{' '}
                          运行中
                        </Tag>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <Space wrap>
                      <Tooltip title="安装依赖">
                        <Button
                          icon={<DownloadOutlined />}
                          size="small"
                          loading={installingBots.has(bot.name)}
                          onClick={() => onYarnInstall(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="系统日志">
                        <Button
                          icon={<MonitorOutlined />}
                          size="small"
                          onClick={() => onOpenLog(bot.name, bot.name + ':_system')}
                        />
                      </Tooltip>
                      <Tooltip title="添加配置">
                        <Button
                          icon={<FileAddOutlined />}
                          size="small"
                          onClick={() => {
                            setSelectedBot(bot.name)
                            setAddConfigName('')
                            setAddConfigContent('')
                            setConfigVisible(true)
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="环境变量">
                        <Button
                          icon={<CodeOutlined />}
                          size="small"
                          onClick={() => onOpenEnv(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="包配置">
                        <Button
                          icon={<FileTextOutlined />}
                          size="small"
                          onClick={() => onOpenBotPkg(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="应用管理">
                        <Button
                          icon={<AppstoreOutlined />}
                          size="small"
                          onClick={() => onOpenPackages(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="启动全部">
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          size="small"
                          className="bg-green-500 border-none hover:bg-green-600"
                          onClick={() => onStart(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="停止全部">
                        <Button
                          danger
                          icon={<PauseCircleOutlined />}
                          size="small"
                          onClick={() => onStop(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="重启全部">
                        <Button
                          icon={<ReloadOutlined />}
                          size="small"
                          onClick={() => onRestart(bot.name)}
                        />
                      </Tooltip>
                      <Tooltip title="删除">
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => onDelete(bot.name)}
                        />
                      </Tooltip>
                    </Space>
                  </div>

                  {/* 实例列表 */}
                  {(bot.instances || []).length > 0 ? (
                    <Collapse
                      size="small"
                      ghost
                      items={[
                        {
                          key: '1',
                          label: (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              <SettingOutlined className="mr-1" />
                              查看 {(bot.instances || []).length} 个配置实例
                            </span>
                          ),
                          children: (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {(bot.instances || []).map(inst => (
                                <div
                                  key={inst.process_name}
                                  className={classNames(
                                    'flex items-center justify-between p-3 rounded-lg',
                                    'bg-gray-50/80 dark:bg-gray-700/50',
                                    'border',
                                    inst.enabled === false
                                      ? 'border-gray-300 dark:border-gray-600 opacity-60'
                                      : inst.status === 1
                                        ? 'border-green-200 dark:border-green-800'
                                        : 'border-gray-200 dark:border-gray-600'
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                                      {inst.config_name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      PID:{' '}
                                      {inst.pid > 0 ? (
                                        <button
                                          className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
                                          onClick={() => {
                                            setPortInfo({
                                              name: inst.process_name,
                                              pid: inst.pid
                                            })
                                            setPortModalVisible(true)
                                          }}
                                        >
                                          {inst.pid}
                                        </button>
                                      ) : (
                                        '-'
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {/* 启用/禁用开关 */}
                                    <Tooltip title={inst.enabled !== false ? '批量操作时启用' : '批量操作时跳过'}>
                                      <Switch
                                        size="small"
                                        checked={inst.enabled !== false}
                                        onChange={(checked) =>
                                          onToggleEnabled(bot.name, inst.config_name, checked)
                                        }
                                      />
                                    </Tooltip>
                                    {/* 查看/编辑配置 */}
                                    <Tooltip title="编辑配置">
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() =>
                                          onOpenConfig(bot.name, inst.config_name)
                                        }
                                      />
                                    </Tooltip>
                                    {/* 在线日志 */}
                                    <Tooltip title="在线日志">
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<FileTextOutlined />}
                                        onClick={() =>
                                          onOpenLog(bot.name, inst.process_name)
                                        }
                                      />
                                    </Tooltip>
                                    {/* 单实例控制 */}
                                    {inst.status === 1 ? (
                                      <>
                                        <Tooltip title="停止实例">
                                          <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<PauseCircleOutlined />}
                                            onClick={() =>
                                              onInstanceStop(bot.name, inst.config_name)
                                            }
                                          />
                                        </Tooltip>
                                        <Tooltip title="重启实例">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<ReloadOutlined />}
                                            onClick={() =>
                                              onInstanceRestart(bot.name, inst.config_name)
                                            }
                                          />
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <Tooltip title="启动实例">
                                        <Button
                                          type="text"
                                          size="small"
                                          className="text-green-500"
                                          icon={<PlayCircleOutlined />}
                                          onClick={() =>
                                            onInstanceStart(bot.name, inst.config_name)
                                          }
                                        />
                                      </Tooltip>
                                    )}
                                    {/* 删除配置 */}
                                    <Popconfirm
                                      title="删除此配置？"
                                      description="关联的实例将被移除"
                                      onConfirm={() =>
                                        onDeleteConfig(bot.name, inst.config_name)
                                      }
                                      okText="删除"
                                      cancelText="取消"
                                    >
                                      <Tooltip title="删除配置">
                                        <Button
                                          type="text"
                                          size="small"
                                          danger
                                          icon={<DeleteOutlined />}
                                        />
                                      </Tooltip>
                                    </Popconfirm>
                                    <Tag
                                      color={
                                        inst.enabled === false
                                          ? 'default'
                                          : inst.status === 1 ? 'green' : 'default'
                                      }
                                      className="rounded-full ml-1"
                                    >
                                      {inst.enabled === false
                                        ? '已禁用'
                                        : inst.status === 1 ? '运行中' : '已停止'}
                                    </Tag>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        }
                      ]}
                    />
                  ) : (
                    <div className="text-sm text-gray-400 dark:text-gray-500 py-2">
                      暂无配置文件，请添加 .yaml 配置后启动
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Spin>

      {/* 新建弹窗 */}
      <Modal
        title="新建多配置机器人"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} onFinish={onCreateSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="机器人名称"
            rules={[
              { required: true, message: '请输入名称' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '仅支持英文、数字、下划线'
              }
            ]}
          >
            <Input placeholder="例如: my_bot" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加配置弹窗 */}
      <Modal
        title={`为 ${selectedBot} 添加配置`}
        open={configVisible}
        onCancel={() => {
          setConfigVisible(false)
          setAddConfigName('')
          setAddConfigContent('')
        }}
        footer={null}
        width={860}
        destroyOnClose
      >
        <div className="h-[70vh] min-h-[520px]">
          <JSONEdit
            name={addConfigName}
            value={addConfigContent || '# 在这里编写你的 YAML 配置（可为空）\n'}
            onSave={onAddConfig}
            type="yaml"
            rightHeader={
              <span className="text-xs text-gray-500 dark:text-gray-400">
                文件名不需要扩展名，将自动保存为 YAML
              </span>
            }
          />
          {addConfigLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/30 pointer-events-none">
              <Spin />
            </div>
          )}
        </div>
      </Modal>

      {/* 查看/编辑配置弹窗 */}
      <Modal
        title={`配置: ${editConfigName}`}
        open={editConfigVisible}
        onCancel={() => setEditConfigVisible(false)}
        width={860}
        footer={null}
        destroyOnClose
      >
        <div className="relative h-[70vh] min-h-[520px]">
          <JSONEdit
            name={editConfigName}
            value={editConfigContent}
            onSave={onSaveConfig}
            disabledName
            type="yaml"
            rightHeader={
              <Space>
                <Button size="small" onClick={onOpenConfigHistory}>历史记录</Button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  YAML 注释会被保留，格式化为显式操作
                </span>
              </Space>
            }
          />
          {editConfigLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/30 pointer-events-none">
              <Spin />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title={`历史记录与对比 — ${editConfigName}`}
        open={configHistoryVisible}
        onCancel={() => setConfigHistoryVisible(false)}
        width={1200}
        footer={
          <Space>
            <Button onClick={() => setConfigHistoryVisible(false)}>关闭</Button>
            <Button onClick={onRestoreConfigHistory} type="primary" disabled={!selectedHistoryId}>
              恢复所选版本
            </Button>
          </Space>
        }
      >
        <div className="grid grid-cols-12 gap-3 h-[70vh] min-h-[520px]">
          <div className="col-span-4 border rounded-lg overflow-hidden flex flex-col min-h-0">
            <div className="px-3 py-2 text-sm font-medium border-b">编辑历史</div>
            <Spin spinning={configHistoryLoading} className="flex-1 min-h-0">
              {configHistoryList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">暂无历史记录</div>
              ) : (
                <div className="h-full overflow-auto p-2 space-y-2">
                  {configHistoryList.map(item => (
                    <button
                      key={item.id}
                      className={classNames(
                        'w-full text-left px-3 py-2 rounded border text-xs transition-colors',
                        selectedHistoryId === item.id
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      )}
                      onClick={() => onSelectConfigHistory(item.id)}
                    >
                      <div className="font-medium">{item.create_at}</div>
                      <div className="text-gray-500 mt-1">{(item.size / 1024).toFixed(2)} KB</div>
                    </button>
                  ))}
                </div>
              )}
            </Spin>
          </div>
          <div className="col-span-4 border rounded-lg overflow-hidden flex flex-col min-h-0">
            <div className="px-3 py-2 text-sm font-medium border-b">当前内容</div>
            <pre className="flex-1 min-h-0 overflow-auto p-3 text-xs font-mono whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900/60">
              {editConfigContent || '(空)'}
            </pre>
          </div>
          <div className="col-span-4 border rounded-lg overflow-hidden flex flex-col min-h-0">
            <div className="px-3 py-2 text-sm font-medium border-b">历史版本内容</div>
            <Spin spinning={selectedHistoryLoading} className="flex-1 min-h-0">
              <pre className="h-full overflow-auto p-3 text-xs font-mono whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900/60">
                {selectedHistoryContent || '(请在左侧选择历史版本)'}
              </pre>
            </Spin>
          </div>
        </div>
      </Modal>

      {/* 环境变量弹窗 */}
      <Modal
        title={`环境变量 — ${envBot}`}
        open={envVisible}
        onCancel={() => setEnvVisible(false)}
        width={640}
        footer={
          <Space>
            <Button onClick={() => setEnvVisible(false)}>取消</Button>
            <Button type="primary" loading={envLoading} onClick={onSaveEnv}>
              保存
            </Button>
          </Space>
        }
      >
        <Spin spinning={envLoading}>
          <TextArea
            rows={14}
            value={envContent}
            onChange={e => setEnvContent(e.target.value)}
            className="font-mono"
            placeholder="KEY=VALUE\nDB_HOST=localhost"
          />
        </Spin>
      </Modal>

      {/* 端口信息弹窗 */}
      {portInfo && (
        <ProcessPortModal
          visible={portModalVisible}
          pid={portInfo.pid}
          botName={portInfo.name}
          onClose={() => {
            setPortModalVisible(false)
            setPortInfo(null)
          }}
        />
      )}

      {/* 在线日志弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span>日志 — {logBot} / {logProcess}</span>
            {logMode === 'online' && logStreaming && <Tag color="green" className="ml-2">实时</Tag>}
          </div>
        }
        open={logVisible}
        onCancel={onCloseLog}
        width={900}
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="small"
                type={logMode === 'online' ? 'primary' : 'default'}
                onClick={() => switchLogMode('online')}
              >
                在线日志
              </Button>
              <Button
                size="small"
                type={logMode === 'query' ? 'primary' : 'default'}
                icon={<SearchOutlined />}
                onClick={() => switchLogMode('query')}
              >
                查询日志
              </Button>
            </div>
            <Space>
              <Button size="small" icon={<CopyOutlined />} onClick={onCopyLogPage}>
                复制
              </Button>
              <Button size="small" icon={<DownloadOutlined />} onClick={onDownloadLog}>
                下载
              </Button>
              <Popconfirm
                title="确定清空当天日志？"
                onConfirm={onDeleteLog}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  清空
                </Button>
              </Popconfirm>
              <Button size="small" onClick={onCloseLog}>关闭</Button>
            </Space>
          </div>
        }
      >
        {logMode === 'online' ? (
          /* 在线日志模式 */
          <>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  logPaused ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
                }`}
              />
              <span className="text-xs text-gray-500">
                {logPaused ? '已暂停' : '实时更新中'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">自动滚动</span>
                <Switch
                  size="small"
                  checked={logAutoScroll}
                  onChange={v => {
                    setLogAutoScroll(v)
                    logUserScrolledRef.current = !v
                  }}
                />
              </div>
              <Button
                size="small"
                onClick={() => setLogPaused(p => !p)}
              >
                {logPaused ? '继续' : '暂停'}
              </Button>
            </div>
            {logLoading && logRenderData.length === 0 ? (
              <div className="flex items-center justify-center" style={{ height: 440 }}>
                <Spin tip="正在连接日志..." />
              </div>
            ) : logRenderData.length === 0 ? (
              <div className="flex items-center justify-center text-gray-400" style={{ height: 440 }}>
                暂无日志数据
              </div>
            ) : (
              <div className="flex flex-col" style={{ height: 440 }}>
                <div
                  ref={logScrollRef}
                  className="flex-1 overflow-y-auto overflow-x-auto rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col-reverse"
                >
                  <div className="p-3 space-y-1">
                    {logRenderData.map((line, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0 select-text text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                          {line}
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {line.toLowerCase().includes('error') ? (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          ) : line.toLowerCase().includes('warn') ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          ) : line.toLowerCase().includes('info') ? (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right text-xs text-gray-400 pt-1">
                  共 {logRenderData.length} 条日志
                </div>
              </div>
            )}
          </>
        ) : (
          /* 查询日志模式 */
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="bg-white rounded-md dark:bg-slate-500">
                <DatePicker
                  value={dayjs(logQueryTimestamp)}
                  onChange={date => {
                    if (date) {
                      setLogQueryTimestamp(Number(date.valueOf()))
                      setLogQueryPage(1)
                    }
                  }}
                  size="small"
                  format="YYYY-MM-DD"
                />
              </div>
              <span className="text-xs text-gray-500">
                {dayjs(logQueryTimestamp).format('YYYY-MM-DD')} · 第 {logQueryPage} 页 · 共 {logQueryTotal} 行
              </span>
            </div>
            {logQueryLoading ? (
              <div className="flex items-center justify-center" style={{ height: 400 }}>
                <Spin tip="加载中..." />
              </div>
            ) : logQueryLines.length === 0 ? (
              <div className="flex items-center justify-center text-gray-400" style={{ height: 400 }}>
                该日期暂无日志
              </div>
            ) : (
              <div className="flex flex-col" style={{ height: 440 }}>
                <div className="flex-1 overflow-y-auto overflow-x-auto rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 space-y-1">
                    {logQueryLines.map((line, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0 select-text text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                          {line}
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {line.toLowerCase().includes('error') ? (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          ) : line.toLowerCase().includes('warn') ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          ) : line.toLowerCase().includes('info') ? (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 pt-2">
                  <Pagination
                    page={logQueryPage}
                    total={logQueryTotal}
                    pageSize={logQueryPageSize}
                    onPageChange={p => setLogQueryPage(p)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* 应用管理弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined />
            <span>应用管理 — {pkgsBot}</span>
          </div>
        }
        open={pkgsVisible}
        onCancel={() => setPkgsVisible(false)}
        width={800}
        footer={
          <Space>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={() => setCloneVisible(true)}
            >
              克隆应用
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshPackages}
            >
              刷新
            </Button>  
          </Space>
        }
      >
        <Spin spinning={pkgsLoading}>
          {pkgsList.length === 0 ? (
            <Empty description="暂无应用，点击「克隆应用」添加" />
          ) : (
            <div className="flex flex-col gap-3 max-h-[480px] overflow-auto">
              {pkgsList.map(pkg => (
                <div
                  key={pkg.name}
                  className={classNames(
                    'p-4 rounded-lg',
                    'bg-gray-50 dark:bg-gray-700/50',
                    'border border-gray-200 dark:border-gray-600'
                  )}
                >
                  {(() => {
                    const meta = getPackageMeta(pkg.pkg)
                    return (
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {pkg.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                        <div>
                          包名: {meta.name} | 版本: {meta.version}
                        </div>
                        <div className="break-words">
                          描述: {meta.description}
                        </div>
                        <div>仓库: {pkg.git?.repo || '-'}</div>
                        <div>
                          分支: <Tag color="blue" className="text-xs">{pkg.git?.branch || '-'}</Tag>
                          <Tag color={pkg.status === 1 ? 'green' : 'orange'} className="text-xs">
                            {pkg.status === 1 ? '已安装' : '未安装'}
                          </Tag>
                        </div>
                        <div>作者: {pkg.git?.author || '-'} | 提交: {pkg.git?.commit?.slice(0, 8) || '-'}</div>
                      </div>
                    </div>
                    <Space>
                      <Tooltip title="启用">
                        <Button
                          size="small"
                          icon={<CheckOutlined />}
                          className="text-green-500"
                          onClick={() => onTogglePackage(pkg, true)}
                        />
                      </Tooltip>
                      <Tooltip title="停用">
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          onClick={() => onTogglePackage(pkg, false)}
                        />
                      </Tooltip>
                      <Tooltip title="编辑配置">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onOpenPkgEdit(pkg.name)}
                        />
                      </Tooltip>
                      <Tooltip title="查看 README">
                        <Button
                          size="small"
                          icon={<FileTextOutlined />}
                          onClick={() => onOpenPkgReadme(pkg)}
                        />
                      </Tooltip>
                      <Tooltip title="拉取更新">
                        <Button
                          size="small"
                          icon={<SyncOutlined />}
                          onClick={() => onPullPackage(pkg)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="强制更新"
                        description="确定强制更新吗？将放弃本地所有修改"
                        onConfirm={() => onForcePullPackage(pkg)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Tooltip title="强制更新">
                          <Button
                            size="small"
                            icon={<ExclamationCircleOutlined />}
                            className="text-orange-500"
                          />
                        </Tooltip>
                      </Popconfirm>
                      <Popconfirm
                        title={`确定删除 "${pkg.name}" 吗？`}
                        onConfirm={() => onDeletePackage(pkg.name)}
                        okText="删除"
                        cancelText="取消"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </Spin>
      </Modal>

      <Modal
        title={`README — ${pkgReadmeName}`}
        open={pkgReadmeVisible}
        onCancel={() => setPkgReadmeVisible(false)}
        width={900}
        footer={
          <Space>
            <Button onClick={() => setPkgReadmeVisible(false)}>关闭</Button>
          </Space>
        }
      >
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
          {pkgReadmeContent ? (
            <Markdown content={pkgReadmeContent} />
          ) : (
            <Empty description="该应用没有 README.md" />
          )}
        </div>
      </Modal>

      {/* 包配置 (package.json) 弹窗 */}
      <Modal
        title={`包配置 — ${botPkgBot}/package.json`}
        open={botPkgVisible}
        onCancel={() => setBotPkgVisible(false)}
        width={640}
        footer={
          <Space>
            <Button onClick={() => setBotPkgVisible(false)}>取消</Button>
            <Button
              type="primary"
              loading={botPkgLoading}
              onClick={onSaveBotPkg}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Spin spinning={botPkgLoading}>
          <TextArea
            rows={18}
            value={botPkgContent}
            onChange={e => setBotPkgContent(e.target.value)}
            className="font-mono text-xs"
          />
        </Spin>
      </Modal>

      {/* 应用包配置编辑弹窗 */}
      <Modal
        title={`编辑配置 — ${pkgEditName}/package.json`}
        open={pkgEditVisible}
        onCancel={() => setPkgEditVisible(false)}
        width={640}
        footer={
          <Space>
            <Button onClick={() => setPkgEditVisible(false)}>取消</Button>
            <Button
              type="primary"
              loading={pkgEditLoading}
              onClick={onSavePkgEdit}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Spin spinning={pkgEditLoading}>
          <TextArea
            rows={18}
            value={pkgEditContent}
            onChange={e => setPkgEditContent(e.target.value)}
            className="font-mono text-xs"
          />
        </Spin>
      </Modal>

      {/* 克隆应用弹窗 */}
      <Modal
        title="克隆应用"
        open={cloneVisible}
        onCancel={() => {
          setCloneVisible(false)
          cloneForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form form={cloneForm} onFinish={onCloneSubmit} layout="vertical">
          <Form.Item
            name="proxy"
            label="代理"
            initialValue="https://ghfast.top/"
            tooltip="仅对 https://github.com/... 地址生效，git@ 地址保持不变"
          >
            <Select
              options={[
                { label: 'ghfast.top（默认）', value: 'https://ghfast.top/' },
                { label: 'ghproxy.com', value: 'https://ghproxy.com/' },
                { label: 'ghproxy.net', value: 'https://ghproxy.net/' },
                { label: 'ghp.ci', value: 'https://ghp.ci/' },
                { label: 'gitclone.com', value: 'https://gitclone.com/github.com/' },
                { label: 'hub.gitmirror.com', value: 'https://hub.gitmirror.com/' },
                { label: '直连', value: 'direct' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="repo_url"
            label="仓库地址"
            rules={[{ required: true, message: '请输入仓库URL' }]}
          >
            <Input placeholder="https://github.com/user/repo.git 或 git@github.com:user/repo.git" />
          </Form.Item>
          <Form.Item
            name="branch_name"
            label="分支名"
            rules={[{ required: true, message: '请输入分支名' }]}
            initialValue="release"
          >
            <Input placeholder="例如: release" />
          </Form.Item>
          <Form.Item name="force" valuePropName="checked">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                强制覆盖（若已存在同名应用）
              </span>
            </label>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={pkgsLoading}>
              克隆
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  )
}

export default MultiBots
