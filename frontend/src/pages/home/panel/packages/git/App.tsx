import { useEffect, useReducer } from 'react'
import { BotPackagesGitBranchCommitsInfo } from '@/api'
import {
  Button,
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
import { useGitOperations } from './useGitOperations'
import { createInitialState, gitManagerReducer } from './state'

const { Text } = Typography
const { Option } = Select

const GitManager = () => {
  // 使用 useReducer 统一管理状态
  const [state, dispatch] = useReducer(gitManagerReducer, createInitialState())

  const botName = getBotName()
  const appName = getGitPackageName()
  const localKeyName = `${botName}:${appName}`

  // 使用自定义 Hook 处理所有 Git 操作
  const gitOps = useGitOperations({
    botName,
    appName,
    localKeyName,
    state,
    dispatch
  })

  // 分支选择变化（仅选择，不切换，不加载提交）
  const handleBranchChange = (branch: string) => {
    dispatch({ type: 'SET_SELECTED_BRANCH', payload: branch })
  }

  // 初始化
  useEffect(() => {
    gitOps.loadBranches()
    gitOps.loadGitStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 当当前分支变化后加载提交记录
  useEffect(() => {
    if (state.currentBranch) {
      gitOps.loadCommits(state.currentBranch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentBranch])

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
            dispatch({ type: 'SHOW_SWITCH_MODAL', payload: record })
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
              value={state.selectedBranch}
              onChange={handleBranchChange}
              placeholder="选择要切换的分支"
              loading={state.loading.branches}
            >
              {state.branches.branches.map(branch => (
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
              loading={state.loading.checkout}
              onClick={() =>
                state.selectedBranch &&
                gitOps.handleCheckout(state.selectedBranch)
              }
              disabled={
                !state.selectedBranch ||
                state.selectedBranch ===
                  (state.currentBranch || state.gitStatus?.current_branch)
              }
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0"
            >
              检出
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={state.loading.fetching}
              onClick={gitOps.handleFetch}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
            >
              Fetch
            </Button>

            <Button
              type="default"
              onClick={() => dispatch({ type: 'TOGGLE_API_MODE' })}
              className={
                state.useLocalAPI
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }
            >
              {state.useLocalAPI ? '本地模式' : '远程模式'}
            </Button>
          </div>
        </div>
        {state.branches.branches?.length === 0 && !state.loading.branches && (
          <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-700/50 rounded-lg px-4 py-2">
            <Text className="text-yellow-700 dark:text-yellow-300">
              暂无分支，请尝试从远程获取。
            </Text>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={gitOps.handleFetch}
            >
              从远程获取
            </Button>
          </div>
        )}
        {/* Git状态信息 */}
        {state.gitStatus && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BranchesOutlined className="text-blue-500" />
                  <Text strong>当前分支：</Text>
                  <Tag color={state.gitStatus.is_clean ? 'green' : 'orange'}>
                    {state.currentBranch || state.gitStatus.current_branch}
                  </Tag>
                </div>
                <div className="flex items-center space-x-2">
                  {state.gitStatus.is_clean ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <WarningOutlined className="text-orange-500" />
                  )}
                  <Text
                    className={
                      state.gitStatus.is_clean
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }
                  >
                    {state.gitStatus.is_clean
                      ? '工作区干净'
                      : `${state.gitStatus.modified_files} 个文件已修改`}
                  </Text>
                </div>
              </div>
              <Space>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={state.loading.status}
                  onClick={gitOps.loadGitStatus}
                  size="small"
                >
                  刷新状态
                </Button>
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  loading={state.loading.pulling}
                  onClick={gitOps.handlePull}
                  disabled={
                    !state.currentBranch && !state.gitStatus?.current_branch
                  }
                  title={`拉取当前分支 ${state.currentBranch || state.gitStatus?.current_branch || ''} 的最新代码`}
                >
                  拉取当前分支
                </Button>
                {!state.gitStatus.is_clean && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={state.loading.discarding}
                    onClick={gitOps.handleDiscardChanges}
                    size="small"
                  >
                    放弃修改
                  </Button>
                )}
                <Button
                  type="text"
                  icon={<ToolOutlined />}
                  loading={state.loading.cleaning}
                  onClick={gitOps.handleCleanup}
                  size="small"
                  title="清理损坏的Git对象"
                >
                  清理仓库
                </Button>
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  loading={state.loading.unshallowing}
                  onClick={gitOps.handleUnshallow}
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
        {state.remoteAnalysis && !state.useLocalAPI && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Text strong>远程分析</Text>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span>当前分支：</span>
                  <Tag color="blue">
                    {state.remoteAnalysis.current_branch || state.currentBranch}
                  </Tag>
                  <span className="ml-2">ahead/behind：</span>
                  <Tag color="green">+{state.remoteAnalysis.ahead}</Tag>
                  <Tag color="red">-{state.remoteAnalysis.behind}</Tag>
                  {state.remoteAnalysis.is_shallow && (
                    <Tag color="orange" className="ml-2">
                      浅克隆
                    </Tag>
                  )}
                </div>
              </div>
              <Space>
                {!!state.remoteAnalysis.added_branches?.length && (
                  <Tag color="blue">
                    新增分支 {state.remoteAnalysis.added_branches?.length}
                  </Tag>
                )}
                {!!state.remoteAnalysis.deleted_branches?.length && (
                  <Tag color="default">
                    远端缺失 {state.remoteAnalysis.deleted_branches?.length}
                  </Tag>
                )}
              </Space>
            </div>
          </div>
        )}
        {/* 提交记录 */}
        {state.currentBranch && (
          <Spin spinning={state.loading.commits}>
            {state.commits.commits?.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg p-4 mb-4">
                  <Text strong>
                    提交记录（分支：
                    {state.commitsBranchName || state.currentBranch}）
                  </Text>
                  {state.commitsBranchName &&
                    state.commitsBranchName !==
                      (state.currentBranch ||
                        state.gitStatus?.current_branch) && (
                      <Tag color="blue">浏览分支</Tag>
                    )}
                </div>
                <Table
                  columns={commitColumns}
                  dataSource={state.commits.commits}
                  rowKey="hash"
                  pagination={false}
                  size="small"
                  className="mb-4"
                />
                {state.commits.total > state.commits.page_size && (
                  <div className="flex justify-center">
                    <Pagination
                      current={state.commits.page}
                      total={state.commits.total}
                      pageSize={state.commits.page_size}
                      onChange={(page, pageSize) =>
                        gitOps.loadCommits(state.currentBranch, page, pageSize)
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
        open={state.switchModalVisible}
        onOk={() =>
          state.selectedCommit && gitOps.handleSwitch(state.selectedCommit)
        }
        onCancel={() => dispatch({ type: 'HIDE_SWITCH_MODAL' })}
        confirmLoading={state.loading.switching}
        okText="确认切换"
        cancelText="取消"
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
      >
        {state.selectedCommit && (
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
                  {state.selectedBranch}
                </Tag>
              </div>
              <div>
                <Text strong>提交哈希：</Text>
                <Text code className="ml-2">
                  {state.selectedCommit.hash}
                </Text>
              </div>
              <div>
                <Text strong>提交信息：</Text>
                <Text className="ml-2">{state.selectedCommit.message}</Text>
              </div>
              <div>
                <Text strong>提交作者：</Text>
                <Text className="ml-2">{state.selectedCommit.author}</Text>
              </div>
              <div>
                <Text strong>提交时间：</Text>
                <Text className="ml-2">
                  {dayjs(state.selectedCommit.date).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
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
