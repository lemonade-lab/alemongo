import { BotPackagesGitBranches } from '@/api'

export const setLocalStoreBranches = (
  localKeyName: string,
  branches: BotPackagesGitBranches
) => {
  localStorage.setItem(`${localKeyName}:branches`, JSON.stringify(branches))
}

export const getLocalStoreBranches = (
  localKeyName: string
): BotPackagesGitBranches | null => {
  const branches = localStorage.getItem(`${localKeyName}:branches`)
  return branches ? JSON.parse(branches) : null
}

export const setLocalStoreSelectedBranch = (branch: string) => {
  localStorage.setItem('gitManager:selectedBranch', branch)
}

export const getLocalStoreSelectedBranch = (): string => {
  return localStorage.getItem('gitManager:selectedBranch') || ''
}

// gitManager:useLocalAPI
export const setLocalStoreUseLocalAPI = (useLocal: boolean) => {
  localStorage.setItem('gitManager:useLocalAPI', useLocal ? '1' : '0')
}

export const getLocalStoreUseLocalAPI = (): boolean => {
  return localStorage.getItem('gitManager:useLocalAPI') === '1'
}
