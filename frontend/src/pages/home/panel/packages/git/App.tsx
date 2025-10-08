import { useEffect, useState, useCallback } from 'react'
import {
  apiBotPackagesGitBranches,
  apiBotPackagesGitCommits,
  apiBotPackagesGitSwitch,
  apiBotPackagesGitFetch,
  apiBotPackagesPull,
  BotPackagesGitBranches,
  BotPackagesGitCommits,
  BotPackagesGitBranchCommitsInfo
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
  DownloadOutlined
} from '@ant-design/icons'
import { getBotName, getGitPackageName } from '../../core'
import Box from '@/commom/layout/Box'
import dayjs from 'dayjs'

const { Text } = Typography
const { Option } = Select

const GitManager = () => {
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
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [isLoadingCommits, setIsLoadingCommits] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [switchModalVisible, setSwitchModalVisible] = useState(false)
  const [selectedCommit, setSelectedCommit] =
    useState<BotPackagesGitBranchCommitsInfo | null>(null)

  const botName = getBotName()
  const appName = getGitPackageName()

  // 获取分支列表
  const loadBranches = useCallback(
    async (page = 1, pageSize = 10) => {
      if (!botName || !appName) return

      setIsLoadingBranches(true)
      try {
        const data = await apiBotPackagesGitBranches({
          name: botName,
          app_name: appName,
          page,
          page_size: pageSize
        })
        setBranches(data)
        // 如果还没有选择分支，选择第一个
        if (!selectedBranch && data.branches.length > 0) {
          setSelectedBranch(data.branches[0])
        }
      } catch {
        message.error('获取分支列表失败')
      } finally {
        setIsLoadingBranches(false)
      }
    },
    [botName, appName, selectedBranch]
  )

  // 获取提交记录
  const loadCommits = useCallback(
    async (branchName: string, page = 1, pageSize = 10) => {
      if (!botName || !appName || !branchName) return

      setIsLoadingCommits(true)
      try {
        const data = await apiBotPackagesGitCommits({
          name: botName,
          app_name: appName,
          branch_name: branchName,
          page,
          page_size: pageSize
        })
        setCommits(data)
      } catch {
        message.error('获取提交记录失败')
      } finally {
        setIsLoadingCommits(false)
      }
    },
    [botName, appName]
  )

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
      // 使用fetch返回的分支列表更新状态
      setBranches(prev => ({
        ...prev,
        branches: result.branches,
        total: result.branches.length
      }))
    } catch {
      message.error('从远程获取分支信息失败')
    } finally {
      setIsFetching(false)
    }
  }

  // 拉取当前分支的最新代码
  const handlePull = async () => {
    if (!botName || !appName || !selectedBranch) {
      message.error('请先选择分支')
      return
    }

    setIsPulling(true)
    try {
      await apiBotPackagesPull({
        name: botName,
        repo_name: appName,
        branch_name: selectedBranch
      })
      message.success('拉取成功')
      // 重新加载分支列表和提交记录
      loadBranches()
      if (selectedBranch) {
        loadCommits(selectedBranch)
      }
    } catch {
      message.error('拉取失败')
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

  // 分支选择变化
  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch)
    setCommits({
      commits: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_page: 0
    })
  }

  // 初始化
  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  // 当选择分支后加载提交记录
  useEffect(() => {
    if (selectedBranch) {
      loadCommits(selectedBranch)
    }
  }, [selectedBranch, loadCommits])

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
        <div className="flex items-center justify-between">
          <div></div>
          <Space>
            <BranchesOutlined className="text-blue-500" />
            <Space>
              <Text strong>当前分支：</Text>
              <Select
                value={selectedBranch}
                onChange={handleBranchChange}
                placeholder="选择分支"
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
                icon={<ReloadOutlined />}
                loading={isFetching}
                onClick={handleFetch}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
              >
                从远程获取
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isPulling}
                onClick={handlePull}
                disabled={!selectedBranch}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0"
              >
                拉取代码
              </Button>
            </Space>
          </Space>
        </div>

        {/* 提交记录 */}
        {selectedBranch && (
          <Spin spinning={isLoadingCommits}>
            {commits.commits.length > 0 ? (
              <>
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
                        loadCommits(selectedBranch, page, pageSize)
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
