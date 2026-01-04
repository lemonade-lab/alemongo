import { useCallback } from 'react'
import { message } from 'antd'
import {
  apiBotPackagesGitBranches,
  apiBotPackagesGitCommits,
  apiBotPackagesGitStatus,
  apiBotPackagesGitFetch,
  apiBotPackagesPull,
  apiBotPackagesGitCheckout,
  apiBotPackagesGitSwitch,
  apiBotPackagesGitDiscard,
  apiBotPackagesGitCleanup,
  apiBotPackagesGitUnshallow,
  apiBotPackagesGitBranchesLocal,
  apiBotPackagesGitCommitsLocal,
  BotPackagesGitBranches,
  BotPackagesGitBranchCommitsInfo
} from '@/api'
import type { GitManagerState, GitManagerAction } from './types'
import { showConfirmModal } from './ConfirmModal'

interface UseGitOperationsProps {
  botName: string
  appName: string
  localKeyName: string
  state: GitManagerState
  dispatch: React.Dispatch<GitManagerAction>
}

/**
 * Git 操作自定义 Hook
 * 封装所有 Git API 调用逻辑，统一处理加载状态和错误
 */
export const useGitOperations = ({
  botName,
  appName,
  localKeyName,
  state,
  dispatch
}: UseGitOperationsProps) => {
  /**
   * 通用 API 调用包装器
   * 自动处理 loading 状态和错误提示
   */
  const withLoading = useCallback(
    async <T,>(
      loadingKey: keyof GitManagerState['loading'],
      apiCall: () => Promise<T>,
      errorMsg: string
    ): Promise<T | null> => {
      dispatch({
        type: 'SET_LOADING',
        payload: { key: loadingKey, value: true }
      })
      try {
        const result = await apiCall()
        return result
      } catch (error: any) {
        const msg = error?.response?.data?.msg || error?.message || errorMsg
        message.error(msg)
        return null
      } finally {
        dispatch({
          type: 'SET_LOADING',
          payload: { key: loadingKey, value: false }
        })
      }
    },
    [dispatch]
  )

  /**
   * 获取分支列表
   */
  const loadBranches = useCallback(
    async (page = 1, pageSize = 10) => {
      if (!botName || !appName) return

      const data = await withLoading(
        'branches',
        () =>
          state.useLocalAPI
            ? apiBotPackagesGitBranchesLocal({
                name: botName,
                app_name: appName,
                page,
                page_size: pageSize
              })
            : apiBotPackagesGitBranches({
                name: botName,
                app_name: appName,
                page,
                page_size: pageSize
              }),
        '获取分支列表失败'
      )

      if (data) {
        const newBranches: BotPackagesGitBranches = {
          branches: data?.branches ?? [],
          total: data?.total ?? 0,
          page: data?.page ?? 1,
          page_size: data?.page_size ?? 10,
          total_page: data?.total_page ?? 0
        }

        dispatch({ type: 'SET_BRANCHES', payload: newBranches })
        dispatch({
          type: 'MERGE_BRANCHES',
          payload: { newBranches: data?.branches ?? [], localKeyName }
        })

        // 如果还没有选择分支，自动选择
        if (!state.selectedBranch && data.branches?.length > 0) {
          const branchToSelect =
            state.currentBranch && data.branches.includes(state.currentBranch)
              ? state.currentBranch
              : data.branches[0]
          dispatch({ type: 'SET_SELECTED_BRANCH', payload: branchToSelect })
        }
      }
    },
    [
      botName,
      appName,
      state.selectedBranch,
      state.useLocalAPI,
      state.currentBranch,
      localKeyName,
      dispatch,
      withLoading
    ]
  )

  /**
   * 获取提交记录
   */
  const loadCommits = useCallback(
    async (branchName: string, page = 1, pageSize = 10) => {
      if (!botName || !appName || !branchName) return

      const data = await withLoading(
        'commits',
        () =>
          state.useLocalAPI
            ? apiBotPackagesGitCommitsLocal({
                name: botName,
                app_name: appName,
                branch_name: branchName,
                page,
                page_size: pageSize
              })
            : apiBotPackagesGitCommits({
                name: botName,
                app_name: appName,
                branch_name: branchName,
                page,
                page_size: pageSize
              }),
        '获取提交记录失败'
      )

      if (data) {
        dispatch({
          type: 'SET_COMMITS',
          payload: { commits: data, branchName }
        })
      }
    },
    [botName, appName, state.useLocalAPI, dispatch, withLoading]
  )

  /**
   * 获取 Git 状态
   */
  const loadGitStatus = useCallback(async () => {
    if (!botName || !appName) return

    const status = await withLoading(
      'status',
      () => apiBotPackagesGitStatus({ name: botName, app_name: appName }),
      '获取Git状态失败'
    )

    if (status) {
      dispatch({ type: 'SET_GIT_STATUS', payload: status })
    }
  }, [botName, appName, dispatch, withLoading])

  /**
   * 统一刷新所有数据
   */
  const refetchAll = useCallback(() => {
    loadGitStatus()
    loadBranches()
    if (state.commitsBranchName) {
      loadCommits(state.commitsBranchName)
    } else if (state.currentBranch) {
      loadCommits(state.currentBranch)
    }
  }, [
    loadGitStatus,
    loadBranches,
    loadCommits,
    state.commitsBranchName,
    state.currentBranch
  ])

  /**
   * 从远程获取分支信息
   */
  const handleFetch = useCallback(async () => {
    if (!botName || !appName) return

    const result = await withLoading(
      'fetching',
      () => apiBotPackagesGitFetch({ name: botName, app_name: appName }),
      '从远程获取分支信息失败'
    )

    if (result) {
      message.success(result.message)

      const updatedBranches: BotPackagesGitBranches = {
        ...state.branches,
        branches: result.branches,
        total: result.branches?.length ?? 0,
        total_page: Math.ceil(
          (result.branches?.length ?? 0) / state.branches.page_size
        )
      }

      dispatch({ type: 'SET_BRANCHES', payload: updatedBranches })
      dispatch({
        type: 'MERGE_BRANCHES',
        payload: { newBranches: result.branches, localKeyName }
      })
      dispatch({ type: 'SET_REMOTE_ANALYSIS', payload: result })

      // 重新选择分支
      if (
        !state.selectedBranch ||
        !result.branches.includes(state.selectedBranch)
      ) {
        const branchToSelect =
          state.currentBranch && result.branches.includes(state.currentBranch)
            ? state.currentBranch
            : result.branches?.length > 0
              ? result.branches[0]
              : ''

        if (branchToSelect) {
          dispatch({ type: 'SET_SELECTED_BRANCH', payload: branchToSelect })
        }
      }
    }
  }, [
    botName,
    appName,
    state.branches,
    state.selectedBranch,
    state.currentBranch,
    localKeyName,
    dispatch,
    withLoading
  ])

  /**
   * 拉取当前分支代码
   */
  const handlePull = useCallback(async () => {
    if (!botName || !appName) {
      message.error('缺少必要参数')
      return
    }

    const targetBranch = state.currentBranch || state.gitStatus?.current_branch
    if (!targetBranch) {
      message.error('无法确定当前分支')
      return
    }

    const result = await withLoading(
      'pulling',
      () =>
        apiBotPackagesPull({
          name: botName,
          repo_name: appName,
          branch_name: targetBranch
        }),
      '拉取失败'
    )

    if (result) {
      message.success(`成功拉取分支 ${targetBranch} 的最新代码`)
      refetchAll()
    }
  }, [
    botName,
    appName,
    state.currentBranch,
    state.gitStatus,
    refetchAll,
    withLoading
  ])

  /**
   * 切换到指定提交
   */
  const handleSwitch = useCallback(
    async (commit: BotPackagesGitBranchCommitsInfo) => {
      if (!state.selectedBranch) {
        message.error('请先选择分支')
        return
      }

      const result = await withLoading(
        'switching',
        () =>
          apiBotPackagesGitSwitch({
            name: botName,
            app_name: appName,
            branch_name: state.selectedBranch,
            commit_hash: commit.hash
          }),
        '切换失败'
      )

      if (result) {
        message.success('切换成功')
        dispatch({ type: 'HIDE_SWITCH_MODAL' })
      }
    },
    [botName, appName, state.selectedBranch, dispatch, withLoading]
  )

  /**
   * 本地分支切换 (git checkout)
   */
  const handleCheckout = useCallback(
    async (branchName: string, force = false) => {
      if (!botName || !appName) {
        message.error('缺少必要参数：botName 或 appName')
        return
      }

      const result = await withLoading(
        'checkout',
        () =>
          apiBotPackagesGitCheckout({
            name: botName,
            app_name: appName,
            branch_name: branchName,
            force
          }),
        '切换分支失败'
      )

      if (result) {
        message.success(`成功切换到分支: ${branchName}`)
        dispatch({ type: 'SET_CURRENT_BRANCH', payload: branchName })
        dispatch({ type: 'SET_SELECTED_BRANCH', payload: branchName })
        loadGitStatus()
        loadCommits(branchName)
      } else if (!force) {
        // 如果失败且不是强制模式，显示确认对话框
        showConfirmModal({
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
          type: 'danger',
          onOk: () => handleCheckout(branchName, true)
        })
      }
    },
    [botName, appName, loadGitStatus, loadCommits, dispatch, withLoading]
  )

  /**
   * 放弃工作区修改
   */
  const handleDiscardChanges = useCallback(async () => {
    if (!botName || !appName) return

    showConfirmModal({
      title: '确认放弃修改',
      content: (
        <div>
          <p>此操作将放弃工作区的所有未暂存修改，且无法恢复。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认放弃',
      type: 'danger',
      onOk: async () => {
        const result = await withLoading(
          'discarding',
          () => apiBotPackagesGitDiscard({ name: botName, app_name: appName }),
          '放弃修改失败'
        )

        if (result) {
          message.success('已放弃所有修改')
          refetchAll()
        } else {
          // 如果失败，提供强制清理选项
          showConfirmModal({
            title: '放弃修改失败',
            content: (
              <div>
                <p>常规放弃修改失败，工作区可能仍有修改。</p>
                <p>是否尝试强制清理仓库？这将清理所有损坏的对象。</p>
              </div>
            ),
            okText: '强制清理',
            onOk: async () => {
              const cleanupResult = await withLoading(
                'cleaning',
                () =>
                  apiBotPackagesGitCleanup({
                    name: botName,
                    app_name: appName
                  }),
                '强制清理失败'
              )
              if (cleanupResult) {
                message.success('强制清理完成')
                refetchAll()
              }
            }
          })
        }
      }
    })
  }, [botName, appName, refetchAll, withLoading])

  /**
   * Git 仓库清理
   */
  const handleCleanup = useCallback(async () => {
    if (!botName || !appName) return

    showConfirmModal({
      title: '确认清理仓库',
      content: (
        <div>
          <p>此操作将清理损坏的Git对象和引用，尝试修复仓库。</p>
          <p>如果仓库严重损坏，可能需要重新克隆。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认清理',
      onOk: async () => {
        const result = await withLoading(
          'cleaning',
          () => apiBotPackagesGitCleanup({ name: botName, app_name: appName }),
          '清理仓库失败'
        )
        if (result) {
          message.success('仓库清理完成')
          refetchAll()
        }
      }
    })
  }, [botName, appName, refetchAll, withLoading])

  /**
   * 取消浅克隆限制
   */
  const handleUnshallow = useCallback(async () => {
    if (!botName || !appName) return

    showConfirmModal({
      title: '确认取消浅克隆限制',
      content: (
        <div>
          <p>此操作将取消Git仓库的浅克隆限制，获取完整的提交历史。</p>
          <p>这可能需要一些时间，取决于仓库的大小和历史深度。</p>
          <p>请确认是否继续？</p>
        </div>
      ),
      okText: '确认取消',
      onOk: async () => {
        const result = await withLoading(
          'unshallowing',
          () =>
            apiBotPackagesGitUnshallow({ name: botName, app_name: appName }),
          '取消浅克隆限制失败'
        )
        if (result) {
          message.success('取消浅克隆限制成功')
          refetchAll()
        }
      }
    })
  }, [botName, appName, refetchAll, withLoading])

  return {
    loadBranches,
    loadCommits,
    loadGitStatus,
    refetchAll,
    handleFetch,
    handlePull,
    handleSwitch,
    handleCheckout,
    handleDiscardChanges,
    handleCleanup,
    handleUnshallow
  }
}
