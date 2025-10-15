import {
  BotPackagesGitBranches,
  BotPackagesGitCommits,
  BotPackagesGitBranchCommitsInfo,
  BotPackagesGitStatus,
  GitRemoteAnalysis
} from '@/api'

// 状态类型定义
export type GitManagerState = {
  // 数据状态
  branches: BotPackagesGitBranches
  commits: BotPackagesGitCommits
  gitStatus: BotPackagesGitStatus | null
  remoteAnalysis: GitRemoteAnalysis | null

  // UI 状态
  selectedBranch: string
  currentBranch: string
  commitsBranchName: string
  selectedCommit: BotPackagesGitBranchCommitsInfo | null

  // 加载状态
  loading: {
    branches: boolean
    commits: boolean
    status: boolean
    switching: boolean
    fetching: boolean
    pulling: boolean
    checkout: boolean
    discarding: boolean
    cleaning: boolean
    unshallowing: boolean
  }

  // 配置
  useLocalAPI: boolean
  switchModalVisible: boolean
}

// Action 类型定义
export type GitManagerAction =
  | { type: 'SET_BRANCHES'; payload: BotPackagesGitBranches }
  | {
      type: 'MERGE_BRANCHES'
      payload: { newBranches: string[]; localKeyName: string }
    }
  | {
      type: 'SET_COMMITS'
      payload: { commits: BotPackagesGitCommits; branchName: string }
    }
  | { type: 'SET_GIT_STATUS'; payload: BotPackagesGitStatus }
  | { type: 'SET_REMOTE_ANALYSIS'; payload: GitRemoteAnalysis }
  | { type: 'SET_SELECTED_BRANCH'; payload: string }
  | { type: 'SET_CURRENT_BRANCH'; payload: string }
  | {
      type: 'SET_LOADING'
      payload: { key: keyof GitManagerState['loading']; value: boolean }
    }
  | { type: 'TOGGLE_API_MODE' }
  | { type: 'SHOW_SWITCH_MODAL'; payload: BotPackagesGitBranchCommitsInfo }
  | { type: 'HIDE_SWITCH_MODAL' }

// 确认对话框类型
export type ConfirmModalType = 'danger' | 'warning' | 'info'

// 确认对话框配置
export interface ConfirmModalConfig {
  title: string
  content: React.ReactNode
  okText?: string
  cancelText?: string
  type?: ConfirmModalType
  onOk: () => void | Promise<void>
  onCancel?: () => void
}
