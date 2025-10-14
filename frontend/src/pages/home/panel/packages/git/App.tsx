import { useEffect, useState, useCallback } from 'react'
import {
  apiBotPackagesGitBranches,
  apiBotPackagesGitCommits,
  apiBotPackagesGitSwitch,
  apiBotPackagesGitFetch,
  apiBotPackagesPull,
  apiBotPackagesGitBranchesLocal,
  apiBotPackagesGitCommitsLocal,
  apiBotPackagesGitStatus,
  apiBotPackagesGitCheckout,
  apiBotPackagesGitDiscard,
  apiBotPackagesGitCleanup,
  apiBotPackagesGitUnshallow,
  BotPackagesGitBranches,
  BotPackagesGitCommits,
  BotPackagesGitBranchCommitsInfo,
  BotPackagesGitStatus,
  type GitRemoteAnalysis
} from '@/api'
import {
  Button,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Spin,
  Empty
} from 'antd'
import {
  BranchesOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { getBotName, getGitPackageName } from '../../core'
import Box from '@/commom/layout/Box'
import dayjs from 'dayjs'

const { Text } = Typography
const { Option } = Select

const setLocalStoreBranches = (
  localKeyName: string,
  branches: BotPackagesGitBranches
) => {
  localStorage.setItem(`${localKeyName}:branches`, JSON.stringify(branches))
}

const getLocalStoreBranches = (
  localKeyName: string
): BotPackagesGitBranches | null => {
  const branches = localStorage.getItem(`${localKeyName}:branches`)
  return branches ? JSON.parse(branches) : null
}

const setLocalStoreSelectedBranch = (branch: string) => {
  localStorage.setItem('gitManager:selectedBranch', branch)
}

const getLocalStoreSelectedBranch = (): string => {
  return localStorage.getItem('gitManager:selectedBranch') || ''
}

// gitManager:useLocalAPI
const setLocalStoreUseLocalAPI = (useLocal: boolean) => {
  localStorage.setItem('gitManager:useLocalAPI', useLocal ? '1' : '0')
}

const getLocalStoreUseLocalAPI = (): boolean => {
  return localStorage.getItem('gitManager:useLocalAPI') === '1'
}

const GitManager = () => {
  // 初始化时从localStorage恢复分支信息
  const [branches, setBranches] = useState<BotPackagesGitBranches>({
    branches: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_page: 0
  })
  const [commits, setCommits] = useState<BotPackagesGitCommits>({
    commits: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_page: 0
  })
  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    try {
      return getLocalStoreSelectedBranch()
    } catch {
      return ''
    }
  }) // 选择的分支（用于切换）
  const [currentBranch, setCurrentBranch] = useState<string>('') // 当前所在的分支
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [isLoadingCommits, setIsLoadingCommits] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [switchModalVisible, setSwitchModalVisible] = useState(false)
  const [selectedCommit, setSelectedCommit] =
    useState<BotPackagesGitBranchCommitsInfo | null>(null)
  const [gitStatus, setGitStatus] = useState<BotPackagesGitStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [isUnshallowing, setIsUnshallowing] = useState(false)
  // 默认使用本地API，且从本地存储中恢复
  const [useLocalAPI, setUseLocalAPI] = useState<boolean>(() => {
    try {
      return getLocalStoreUseLocalAPI()
    } catch {
      return true
    }
  })
  // 记录当前提交列表对应的分支（用于区分浏览分支与当前分支）
  const [commitsBranchName, setCommitsBranchName] = useState<string>('')
  const [remoteAnalysis, setRemoteAnalysis] =
    useState<GitRemoteAnalysis | null>(null)
  const botName = getBotName()
  const appName = getGitPackageName()
  const localKeyName = `${botName}:${appName}`

  useEffect(() => {
    const newBranches = {
      ...branches
    }
    const localBranches = getLocalStoreBranches(localKeyName) ?? {
      branches: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_page: 0
    }
    if (localBranches) {
      const mergedBranches = Array.from(
        new Set([...newBranches.branches, ...localBranches.branches])
      )
      newBranches.branches = mergedBranches
    }
    // 持久化存储更新后的分支信息
    setLocalStoreBranches(localKeyName, newBranches)
  }, [branches, localKeyName])

  // 获取分支列表
  const loadBranches = useCallback(
    async (page = 1, pageSize = 10) => {
      if (!botName || !appName) return

      setIsLoadingBranches(true)
      try {
        // 根据设置选择使用本地API还是远程API
        const data = useLocalAPI
          ? await apiBotPackagesGitBranchesLocal({
              name: botName,
              app_name: appName,
              page,
              page_size: pageSize
            })
          : await apiBotPackagesGitBranches({
              name: botName,
              app_name: appName,
              page,
              page_size: pageSize
            })
        setBranches(() => {
          const newBranches = {
            branches: data.branches,
            total: data.total,
            page: data.page,
            page_size: data.page_size,
            total_page: data.total_page
          }
          const localBranches = getLocalStoreBranches(localKeyName) ?? {
            branches: [],
            total: 0,
            page: 1,
            page_size: 10,
            total_page: 0
          }
          if (localBranches) {
            const mergedBranches = Array.from(
              new Set([...newBranches.branches, ...localBranches.branches])
            )
            newBranches.branches = mergedBranches
          }
          return newBranches
        })
        // 如果还没有选择分支，并且当前分支存在于列表中，使用当前分支；否则选第一个
        if (!selectedBranch && data.branches.length > 0) {
          const branchToSelect =
            currentBranch && data.branches.includes(currentBranch)
              ? currentBranch
              : data.branches[0]
          setSelectedBranch(branchToSelect)
          // 持久化保存选中的分支
          setLocalStoreSelectedBranch(branchToSelect)
        }
      } catch {
        message.error('获取分支列表失败')
      } finally {
        setIsLoadingBranches(false)
      }
    },
    [botName, appName, selectedBranch, useLocalAPI, currentBranch]
  )

  // 获取提交记录
  const loadCommits = useCallback(
    async (branchName: string, page = 1, pageSize = 10) => {
      if (!botName || !appName || !branchName) return

      setIsLoadingCommits(true)
      try {
        // 根据设置选择使用本地API还是远程API
        const data = useLocalAPI
          ? await apiBotPackagesGitCommitsLocal({
              name: botName,
              app_name: appName,
              branch_name: branchName,
              page,
              page_size: pageSize
            })
          : await apiBotPackagesGitCommits({
              name: botName,
              app_name: appName,
              branch_name: branchName,
              page,
              page_size: pageSize
            })

        setCommits(data)
        setCommitsBranchName(branchName)
      } catch {
        message.error('获取提交记录失败')
      } finally {
        setIsLoadingCommits(false)
      }
    },
    [botName, appName, useLocalAPI]
  )

  // 获取Git状态
  const loadGitStatus = useCallback(async () => {
    if (!botName || !appName) return

    setIsLoadingStatus(true)
    try {
      const status = await apiBotPackagesGitStatus({
        name: botName,
        app_name: appName
      })
      setGitStatus(status)
      // 更新当前分支状态
      setCurrentBranch(status.current_branch)
    } catch {
      message.error('获取Git状态失败')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [botName, appName])

  // 统一刷新函数：状态、分支与提交
  const refetchAll = useCallback(() => {
    loadGitStatus()
    loadBranches()
    if (commitsBranchName) {
      loadCommits(commitsBranchName)
    } else if (currentBranch) {
      loadCommits(currentBranch)
    }
  }, [
    loadGitStatus,
    loadBranches,
    loadCommits,
    commitsBranchName,
    currentBranch
  ])

  // 从远程获取最新分支信息
  const handleFetch = async () => {
    if (!botName || !appName) return

    setIsFetching(true)
    try {
      const result = await apiBotPackagesGitFetch({
        name: botName,
        app_name: appName
      })
      message.success(result.message)
      // 使用fetch返回的分支列表更新状态，保留完整的分页信息
      setBranches(prev => {
        const newBranches = {
          ...prev,
          branches: result.branches,
          total: result.branches.length,
          total_page: Math.ceil(result.branches.length / prev.page_size)
        }
        const localBranches = getLocalStoreBranches(localKeyName) ?? {
          branches: [],
          total: 0,
          page: 1,
          page_size: 10,
          total_page: 0
        }
        if (localBranches) {
          const mergedBranches = Array.from(
            new Set([...newBranches.branches, ...localBranches.branches])
          )
          newBranches.branches = mergedBranches
        }
        return newBranches
      })
      setRemoteAnalysis(result)

      // 如果当前没有选中分支，或选中的分支不在新列表中，重新选择
      if (!selectedBranch || !result.branches.includes(selectedBranch)) {
        const branchToSelect =
          currentBranch && result.branches.includes(currentBranch)
            ? currentBranch
            : result.branches.length > 0
              ? result.branches[0]
              : ''

        if (branchToSelect) {
          setSelectedBranch(branchToSelect)
          // 持久化保存选中的分支
          setLocalStoreSelectedBranch(branchToSelect)
        }
      }
    } catch {
      message.error('从远程获取分支信息失败')
    } finally {
      setIsFetching(false)
    }
  }

  // 拉取当前分支的最新代码
  const handlePull = async () => {
    if (!botName || !appName) {
      message.error('缺少必要参数')
      return
    }

    // 使用当前分支而不是选择的分支
    const targetBranch = currentBranch || gitStatus?.current_branch
    if (!targetBranch) {
      message.error('无法确定当前分支')
      return
    }

    setIsPulling(true)
    try {
      await apiBotPackagesPull({
        name: botName,
        repo_name: appName,
        branch_name: targetBranch
      })
      message.success(`成功拉取分支 ${targetBranch} 的最新代码`)
      // 重新加载状态、分支列表和提交记录
      refetchAll()
    } catch (error) {
      const errorMsg =
        error?.response?.data?.msg || error?.message || '拉取失败'
      message.error(`拉取失败: ${errorMsg}`)
    } finally {
      setIsPulling(false)
    }
  }

  // 切换分支/提交
  const handleSwitch = async (commit: BotPackagesGitBranchCommitsInfo) => {
    if (!selectedBranch) {
      message.error('请先选择分支')
      return
    }

    setIsSwitching(true)
    try {
      await apiBotPackagesGitSwitch({
        name: botName,
        app_name: appName,
        branch_name: selectedBranch,
        commit_hash: commit.hash
      })
      message.success('切换成功')
      setSwitchModalVisible(false)
      setSelectedCommit(null)
    } catch {
      message.error('切换失败')
    } finally {
      setIsSwitching(false)
    }
  }

  // 本地分支切换 (git checkout)
  const handleCheckout = async (branchName: string, force = false) => {
    if (!botName || !appName) {
      console.error('botName or appName is empty:', { botName, appName })
      message.error('缺少必要参数：botName 或 appName')
      return
    }

    console.log('Checkout request:', {
      name: botName,
      app_name: appName,
      branch_name: branchName,
      force
    })

    setIsCheckingOut(true)
    try {
      await apiBotPackagesGitCheckout({
        name: botName,
        app_name: appName,
        branch_name: branchName,
        force
      })
      message.success(`成功切换到分支: ${branchName}`)
      // 更新当前分支状态
      setCurrentBranch(branchName)
      // 更新选中的分支为当前分支
      setSelectedBranch(branchName)
      // 持久化保存选中的分支
      setLocalStoreSelectedBranch(branchName)
      // 重新加载状态和提交记录
      loadGitStatus()
      loadCommits(branchName)
    } catch (error) {
      const errorMsg =
        error?.response?.data?.msg || error?.message || '切换分支失败'

      // 检查是否是工作区有未暂存更改的错误
      if (errorMsg.includes('工作区包含未暂存的更改')) {
        Modal.confirm({
          title: '工作区有未暂存的更改',
          content: (
            <div>
              <p>当前工作区包含未暂存的更改，切换分支将会丢失这些更改。</p>
              <p>您可以选择：</p>
              <ul>
                <li>强制切换（丢弃所有未暂存的更改）</li>
                <li>取消操作，先处理未暂存的更改</li>
              </ul>
            </div>
          ),
          okText: '强制切换',
          cancelText: '取消',
          okType: 'danger',
          onOk: () => {
            handleCheckout(branchName, true)
          }
        })
      } else {
        message.error(errorMsg)
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  // 放弃工作区修改
  const handleDiscardChanges = async () => {
    if (!botName || !appName) return

    Modal.confirm({
      title: '确认放弃修改',
      content: (
        <div>
          <p>此操作将放弃工作区的所有未暂存修改，且无法恢复。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认放弃',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setIsDiscarding(true)
        try {
          await apiBotPackagesGitDiscard({
            name: botName,
            app_name: appName
          })
          message.success('已放弃所有修改')
          // 重新加载状态、分支列表和提交记录
          refetchAll()
        } catch (error) {
          const errorMsg =
            error?.response?.data?.msg || error?.message || '放弃修改失败'

          // 如果放弃修改失败，提供强制清理选项
          if (
            errorMsg.includes('仍有修改') ||
            errorMsg.includes('可能需要手动处理')
          ) {
            Modal.confirm({
              title: '放弃修改失败',
              content: (
                <div>
                  <p>常规放弃修改失败，工作区可能仍有修改。</p>
                  <p>是否尝试强制清理仓库？这将清理所有损坏的对象。</p>
                </div>
              ),
              okText: '强制清理',
              cancelText: '取消',
              okType: 'default',
              onOk: async () => {
                try {
                  await apiBotPackagesGitCleanup({
                    name: botName,
                    app_name: appName
                  })
                  message.success('强制清理完成')
                  // 重新加载所有数据
                  refetchAll()
                } catch (cleanupError) {
                  const cleanupMsg =
                    cleanupError?.response?.data?.msg ||
                    cleanupError?.message ||
                    '强制清理失败'
                  message.error(`强制清理失败: ${cleanupMsg}`)
                }
              }
            })
          } else {
            message.error(errorMsg)
          }
        } finally {
          setIsDiscarding(false)
        }
      }
    })
  }

  // Git仓库清理
  const handleCleanup = async () => {
    if (!botName || !appName) return

    Modal.confirm({
      title: '确认清理仓库',
      content: (
        <div>
          <p>此操作将清理损坏的Git对象和引用，尝试修复仓库。</p>
          <p>如果仓库严重损坏，可能需要重新克隆。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认清理',
      cancelText: '取消',
      okType: 'default',
      onOk: async () => {
        setIsCleaning(true)
        try {
          await apiBotPackagesGitCleanup({
            name: botName,
            app_name: appName
          })
          message.success('仓库清理完成')
          // 重新加载状态和分支
          refetchAll()
        } catch (error) {
          const errorMsg =
            error?.response?.data?.msg || error?.message || '清理仓库失败'
          message.error(errorMsg)
        } finally {
          setIsCleaning(false)
        }
      }
    })
  }

  // 取消浅克隆限制
  const handleUnshallow = async () => {
    if (!botName || !appName) return

    Modal.confirm({
      title: '确认取消浅克隆限制',
      content: (
        <div>
          <p>此操作将取消Git仓库的浅克隆限制，获取完整的提交历史。</p>
          <p>这可能需要一些时间，取决于仓库的大小和历史深度。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认取消',
      cancelText: '取消',
      okType: 'default',
      onOk: async () => {
        setIsUnshallowing(true)
        try {
          await apiBotPackagesGitUnshallow({
            name: botName,
            app_name: appName
          })
          message.success('取消浅克隆限制成功')
          // 重新加载状态、分支和提交记录
          refetchAll()
        } catch (error) {
          const errorMsg =
            error?.response?.data?.msg || error?.message || '取消浅克隆限制失败'
          message.error(errorMsg)
        } finally {
          setIsUnshallowing(false)
        }
      }
    })
  }

  // 分支选择变化（仅选择，不切换，不加载提交）
  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch)
    // 持久化保存选中的分支
    setLocalStoreSelectedBranch(branch)
    // 注意：这里不加载提交记录，只有点击"检出"按钮后才会切换并加载
  }

  // 初始化
  useEffect(() => {
    loadBranches()
    loadGitStatus()
  }, [loadBranches, loadGitStatus])

  // 当当前分支变化后加载提交记录
  useEffect(() => {
    if (currentBranch) {
      loadCommits(currentBranch)
    }
  }, [currentBranch, loadCommits])

  // 提交记录表格列定义
  const commitColumns = [
    {
      title: '提交哈希',
      dataIndex: 'hash',
      key: 'hash',
      width: 120,
      render: (hash: string) => (
        <Text code className="text-xs">
          {hash.substring(0, 8)}
        </Text>
      )
    },
    {
      title: '提交信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => <Text className="text-sm">{message}</Text>
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author: string) => (
        <Space>
          <UserOutlined className="text-gray-400" />
          <Text className="text-sm">{author}</Text>
        </Space>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <Text className="text-sm">
            {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: BotPackagesGitBranchCommitsInfo) => (
        <Button
          type="primary"
          size="small"
          icon={<SwapOutlined />}
          onClick={() => {
            setSelectedCommit(record)
            setSwitchModalVisible(true)
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
        >
          切换
        </Button>
      )
    }
  ]

  return (
    <Box>
      <div className="flex-1 gap-6 flex flex-col bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm rounded-xl p-6  border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
          <div className="flex gap-2 items-center ">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BranchesOutlined className="text-blue-500" />
                <Text strong>分支操作：</Text>
              </div>
            </div>
            <Select
              rootClassName="flex-1"
              className="w-full"
              value={selectedBranch}
              onChange={handleBranchChange}
              placeholder="选择要切换的分支"
              loading={isLoadingBranches}
            >
              {branches.branches.map(branch => (
                <Option key={branch} value={branch}>
                  <Space>
                    <BranchesOutlined />
                    <span>{branch}</span>
                  </Space>
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              loading={isCheckingOut}
              onClick={() => selectedBranch && handleCheckout(selectedBranch)}
              disabled={
                !selectedBranch ||
                selectedBranch === (currentBranch || gitStatus?.current_branch)
              }
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0"
            >
              检出
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={handleFetch}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
            >
              Fetch
            </Button>

            <Button
              type="default"
              onClick={() => {
                const next = !useLocalAPI
                setUseLocalAPI(next)
                // 持久化保存模式开关
                setLocalStoreUseLocalAPI(next)
              }}
              className={
                useLocalAPI
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }
            >
              {useLocalAPI ? '本地模式' : '远程模式'}
            </Button>
          </div>
        </div>
        {branches.branches.length === 0 && !isLoadingBranches && (
          <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-700/50 rounded-lg px-4 py-2">
            <Text className="text-yellow-700 dark:text-yellow-300">
              暂无分支，请尝试从远程获取。
            </Text>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleFetch}
            >
              从远程获取
            </Button>
          </div>
        )}
        {/* Git状态信息 */}
        {gitStatus && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BranchesOutlined className="text-blue-500" />
                  <Text strong>当前分支：</Text>
                  <Tag color={gitStatus.is_clean ? 'green' : 'orange'}>
                    {currentBranch || gitStatus.current_branch}
                  </Tag>
                </div>
                <div className="flex items-center space-x-2">
                  {gitStatus.is_clean ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <WarningOutlined className="text-orange-500" />
                  )}
                  <Text
                    className={
                      gitStatus.is_clean ? 'text-green-600' : 'text-orange-600'
                    }
                  >
                    {gitStatus.is_clean
                      ? '工作区干净'
                      : `${gitStatus.modified_files} 个文件已修改`}
                  </Text>
                </div>
              </div>
              <Space>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={isLoadingStatus}
                  onClick={loadGitStatus}
                  size="small"
                >
                  刷新状态
                </Button>
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  loading={isPulling}
                  onClick={handlePull}
                  disabled={!currentBranch && !gitStatus?.current_branch}
                  title={`拉取当前分支 ${currentBranch || gitStatus?.current_branch || ''} 的最新代码`}
                >
                  拉取当前分支
                </Button>
                {!gitStatus.is_clean && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={isDiscarding}
                    onClick={handleDiscardChanges}
                    size="small"
                  >
                    放弃修改
                  </Button>
                )}
                <Button
                  type="text"
                  icon={<ToolOutlined />}
                  loading={isCleaning}
                  onClick={handleCleanup}
                  size="small"
                  title="清理损坏的Git对象"
                >
                  清理仓库
                </Button>
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  loading={isUnshallowing}
                  onClick={handleUnshallow}
                  size="small"
                  title="取消浅克隆限制，获取完整历史"
                >
                  取消浅克隆
                </Button>
              </Space>
            </div>
          </div>
        )}
        {/* 远程分析（仅在远程模式或完成fetch后展示） */}
        {remoteAnalysis && !useLocalAPI && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Text strong>远程分析</Text>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span>当前分支：</span>
                  <Tag color="blue">
                    {remoteAnalysis.current_branch || currentBranch}
                  </Tag>
                  <span className="ml-2">ahead/behind：</span>
                  <Tag color="green">+{remoteAnalysis.ahead}</Tag>
                  <Tag color="red">-{remoteAnalysis.behind}</Tag>
                  {remoteAnalysis.is_shallow && (
                    <Tag color="orange" className="ml-2">
                      浅克隆
                    </Tag>
                  )}
                </div>
              </div>
              <Space>
                {!!remoteAnalysis.added_branches.length && (
                  <Tag color="blue">
                    新增分支 {remoteAnalysis.added_branches.length}
                  </Tag>
                )}
                {!!remoteAnalysis.deleted_branches.length && (
                  <Tag color="default">
                    远端缺失 {remoteAnalysis.deleted_branches.length}
                  </Tag>
                )}
              </Space>
            </div>
          </div>
        )}
        {/* 提交记录 */}
        {currentBranch && (
          <Spin spinning={isLoadingCommits}>
            {commits.commits.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg p-4 mb-4">
                  <Text strong>
                    提交记录（分支：{commitsBranchName || currentBranch}）
                  </Text>
                  {commitsBranchName &&
                    commitsBranchName !==
                      (currentBranch || gitStatus?.current_branch) && (
                      <Tag color="blue">浏览分支</Tag>
                    )}
                </div>
                <Table
                  columns={commitColumns}
                  dataSource={commits.commits}
                  rowKey="hash"
                  pagination={false}
                  size="small"
                  className="mb-4"
                />
                {commits.total > commits.page_size && (
                  <div className="flex justify-center">
                    <Pagination
                      current={commits.page}
                      total={commits.total}
                      pageSize={commits.page_size}
                      onChange={(page, pageSize) =>
                        loadCommits(currentBranch, page, pageSize)
                      }
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) =>
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty description="暂无提交记录" />
            )}
          </Spin>
        )}
      </div>

      {/* 切换确认模态框 */}
      <Modal
        title={
          <Space>
            <SwapOutlined className="text-orange-500" />
            <span>确认切换</span>
          </Space>
        }
        open={switchModalVisible}
        onOk={() => selectedCommit && handleSwitch(selectedCommit)}
        onCancel={() => {
          setSwitchModalVisible(false)
          setSelectedCommit(null)
        }}
        confirmLoading={isSwitching}
        okText="确认切换"
        cancelText="取消"
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
      >
        {selectedCommit && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationCircleOutlined className="text-orange-500" />
                <Text strong className="text-orange-700 dark:text-orange-300">
                  警告
                </Text>
              </div>
              <Text className="text-orange-600 dark:text-orange-400">
                切换提交将会放弃本地所有修改，请确认是否继续？
              </Text>
            </div>

            <div className="space-y-2">
              <div>
                <Text strong>目标分支：</Text>
                <Tag color="blue" className="ml-2">
                  {selectedBranch}
                </Tag>
              </div>
              <div>
                <Text strong>提交哈希：</Text>
                <Text code className="ml-2">
                  {selectedCommit.hash}
                </Text>
              </div>
              <div>
                <Text strong>提交信息：</Text>
                <Text className="ml-2">{selectedCommit.message}</Text>
              </div>
              <div>
                <Text strong>提交作者：</Text>
                <Text className="ml-2">{selectedCommit.author}</Text>
              </div>
              <div>
                <Text strong>提交时间：</Text>
                <Text className="ml-2">
                  {dayjs(selectedCommit.date).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Box>
  )
}

export default GitManager
