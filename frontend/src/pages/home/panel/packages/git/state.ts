import type { GitManagerState, GitManagerAction } from './types'
import {
  getLocalStoreBranches,
  getLocalStoreSelectedBranch,
  getLocalStoreUseLocalAPI,
  setLocalStoreBranches,
  setLocalStoreSelectedBranch,
  setLocalStoreUseLocalAPI
} from './localstore'

// 辅助函数：合并分支列表（去重）
const mergeBranchLists = (
  existingBranches: string[],
  newBranches: string[]
): string[] => {
  return Array.from(new Set([...existingBranches, ...newBranches]))
}

// 初始状态
export const createInitialState = (): GitManagerState => ({
  branches: {
    branches: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_page: 0
  },
  commits: {
    commits: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_page: 0
  },
  gitStatus: null,
  remoteAnalysis: null,
  selectedBranch: getLocalStoreSelectedBranch(),
  currentBranch: '',
  commitsBranchName: '',
  selectedCommit: null,
  loading: {
    branches: false,
    commits: false,
    status: false,
    switching: false,
    fetching: false,
    pulling: false,
    checkout: false,
    discarding: false,
    cleaning: false,
    unshallowing: false
  },
  useLocalAPI: getLocalStoreUseLocalAPI(),
  switchModalVisible: false
})

// Reducer 函数
export const gitManagerReducer = (
  state: GitManagerState,
  action: GitManagerAction
): GitManagerState => {
  switch (action.type) {
    case 'SET_BRANCHES':
      return { ...state, branches: action.payload }

    case 'MERGE_BRANCHES': {
      const { newBranches, localKeyName } = action.payload
      const localBranches = getLocalStoreBranches(localKeyName)
      const mergedBranches = mergeBranchLists(
        state.branches.branches,
        localBranches?.branches || []
      )
      const updatedBranches = {
        ...state.branches,
        branches: mergeBranchLists(mergedBranches, newBranches)
      }
      // 持久化存储
      setLocalStoreBranches(localKeyName, updatedBranches)
      return { ...state, branches: updatedBranches }
    }

    case 'SET_COMMITS':
      return {
        ...state,
        commits: action.payload.commits,
        commitsBranchName: action.payload.branchName
      }

    case 'SET_GIT_STATUS':
      return {
        ...state,
        gitStatus: action.payload,
        currentBranch: action.payload.current_branch
      }

    case 'SET_REMOTE_ANALYSIS':
      return { ...state, remoteAnalysis: action.payload }

    case 'SET_SELECTED_BRANCH':
      setLocalStoreSelectedBranch(action.payload)
      return { ...state, selectedBranch: action.payload }

    case 'SET_CURRENT_BRANCH':
      return { ...state, currentBranch: action.payload }

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }

    case 'TOGGLE_API_MODE': {
      const newMode = !state.useLocalAPI
      setLocalStoreUseLocalAPI(newMode)
      return { ...state, useLocalAPI: newMode }
    }

    case 'SHOW_SWITCH_MODAL':
      return {
        ...state,
        selectedCommit: action.payload,
        switchModalVisible: true
      }

    case 'HIDE_SWITCH_MODAL':
      return {
        ...state,
        selectedCommit: null,
        switchModalVisible: false
      }

    default:
      return state
  }
}
