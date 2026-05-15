import type { ReactNode } from 'react'
import {
  AppstoreOutlined,
  ClusterOutlined,
  CodeOutlined,
  ConsoleSqlOutlined,
  DesktopOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  MonitorOutlined,
  SettingOutlined,
  StarOutlined
} from '@ant-design/icons'

export type MenuTargetType = 'internal' | 'external' | 'custom'

export type MenuIconKey =
  | 'appstore'
  | 'cluster'
  | 'code'
  | 'console-sql'
  | 'desktop'
  | 'file-text'
  | 'info'
  | 'link'
  | 'monitor'
  | 'setting'
  | 'star'

export interface EditableMenuItem {
  id: string
  key: string
  label: string
  iconKey: MenuIconKey
  targetType: MenuTargetType
  identity?: string
}

export interface MenuItemType extends EditableMenuItem {
  icon: ReactNode
}

export const MENU_STORAGE_KEY = 'alemongo:sidebar-menu-items'
export const LEGACY_SHORTCUT_STORAGE_KEY = 'alemongo:sidebar-shortcuts'

const iconMap: Record<MenuIconKey, ReactNode> = {
  'appstore': <AppstoreOutlined />,
  'cluster': <ClusterOutlined />,
  'code': <CodeOutlined />,
  'console-sql': <ConsoleSqlOutlined />,
  'desktop': <DesktopOutlined />,
  'file-text': <FileTextOutlined />,
  'info': <InfoCircleOutlined />,
  'link': <LinkOutlined />,
  'monitor': <MonitorOutlined />,
  'setting': <SettingOutlined />,
  'star': <StarOutlined />
}

export const defaultMenuItems: EditableMenuItem[] = [
  {
    id: 'apps',
    key: '/',
    iconKey: 'appstore',
    label: '应用中心',
    targetType: 'internal'
  },
  {
    id: 'multibots',
    key: '/multibots',
    iconKey: 'cluster',
    label: '多进程机器',
    targetType: 'internal'
  },
  {
    id: 'configs',
    key: '/configs',
    iconKey: 'file-text',
    label: '配置管理',
    targetType: 'internal'
  },
  {
    id: 'pipeline',
    key: '/pipeline',
    iconKey: 'code',
    label: '流水线',
    targetType: 'internal'
  },
  {
    id: 'ssh',
    key: '/ssh',
    iconKey: 'desktop',
    label: '密钥文件',
    identity: 'admin',
    targetType: 'internal'
  },
  {
    id: 'account',
    key: '/account',
    iconKey: 'setting',
    label: '账户管理',
    identity: 'admin',
    targetType: 'internal'
  },
  {
    id: 'port-monitor',
    key: '/port-monitor',
    iconKey: 'monitor',
    label: '端口监控',
    identity: 'admin',
    targetType: 'internal'
  },
  {
    id: 'system-logs',
    key: '/system-logs',
    iconKey: 'file-text',
    label: '系统日志',
    identity: 'admin',
    targetType: 'internal'
  },
  {
    id: 'system-terminal',
    key: '/system-terminal',
    iconKey: 'console-sql',
    label: '系统终端',
    identity: 'super_admin',
    targetType: 'internal'
  },
  {
    id: 'sftp',
    key: '/sftp',
    iconKey: 'file-text',
    label: '文件管理',
    identity: 'super_admin',
    targetType: 'internal'
  },
  {
    id: 'about',
    key: '/about',
    iconKey: 'info',
    label: '关于',
    identity: 'admin',
    targetType: 'internal'
  }
]

export const FIXED_MENU_ITEM_ID = 'apps'

const fixedMenuItem = defaultMenuItems.find(
  item => item.id === FIXED_MENU_ITEM_ID
)!

export const menuRouteOptions = [
  { label: '应用中心', value: '/' },
  { label: '多进程机器', value: '/multibots' },
  { label: '配置管理', value: '/configs' },
  { label: '流水线', value: '/pipeline' },
  { label: '任务中心', value: '/tasks' },
  { label: '个人中心', value: '/profile' },
  { label: '设置中心', value: '/settings' },
  { label: '账户管理', value: '/account' },
  { label: '密钥文件', value: '/ssh' },
  { label: '端口监控', value: '/port-monitor' },
  { label: '系统日志', value: '/system-logs' },
  { label: '系统终端', value: '/system-terminal' },
  { label: '文件管理', value: '/sftp' },
  { label: '关于', value: '/about' },
  { label: '应用管理', value: '/apps/manage' },
  { label: '应用 Git', value: '/apps/git' },
  { label: '防火墙', value: '/apps/firewall' },
  { label: 'QQ 按钮模板', value: '/apps/qqbot-button-template' },
  { label: 'OneBot', value: '/apps/onebot' }
]

const normalizeInternalPath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeExternalUrl = (value: string): string => value.trim()

const getDefaultIconKey = (targetType: MenuTargetType): MenuIconKey => {
  if (targetType === 'external') {
    return 'link'
  }
  if (targetType === 'custom') {
    return 'code'
  }
  return 'star'
}

export const createMenuItem = (): EditableMenuItem => {
  const suffix = Math.random().toString(36).slice(2, 8)

  return {
    id: `menu-${Date.now()}-${suffix}`,
    key: '/',
    label: '新菜单',
    iconKey: 'star',
    targetType: 'internal'
  }
}

const normalizeMenuItem = (value: unknown): EditableMenuItem | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<EditableMenuItem>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.key !== 'string' ||
    typeof candidate.label !== 'string'
  ) {
    return null
  }

  const targetType =
    candidate.targetType === 'external'
      ? 'external'
      : candidate.targetType === 'custom'
        ? 'custom'
        : 'internal'
  const iconKey =
    typeof candidate.iconKey === 'string' && candidate.iconKey in iconMap
      ? (candidate.iconKey as MenuIconKey)
      : getDefaultIconKey(targetType)

  return {
    id: candidate.id,
    key:
      targetType === 'external'
        ? normalizeExternalUrl(candidate.key)
        : normalizeInternalPath(candidate.key),
    label: candidate.label.trim(),
    iconKey,
    identity:
      typeof candidate.identity === 'string' ? candidate.identity : undefined,
    targetType
  }
}

const readLegacyShortcuts = (): EditableMenuItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(LEGACY_SHORTCUT_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(item => normalizeMenuItem(item))
      .filter((item): item is EditableMenuItem => item !== null)
      .map(item => ({
        ...item,
        iconKey: getDefaultIconKey(item.targetType)
      }))
  } catch {
    return []
  }
}

export const getStoredMenuItems = (): EditableMenuItem[] => {
  if (typeof window === 'undefined') {
    return defaultMenuItems
  }

  const raw = window.localStorage.getItem(MENU_STORAGE_KEY)
  if (!raw) {
    const legacyShortcuts = readLegacyShortcuts()
    return [
      fixedMenuItem,
      ...defaultMenuItems.filter(item => item.id !== FIXED_MENU_ITEM_ID),
      ...legacyShortcuts
    ]
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return defaultMenuItems
    }

    const items = parsed
      .map(item => normalizeMenuItem(item))
      .filter((item): item is EditableMenuItem => item !== null)
      .filter(item => item.id !== FIXED_MENU_ITEM_ID)

    return [
      fixedMenuItem,
      ...(items.length > 0
        ? items
        : defaultMenuItems.filter(item => item.id !== FIXED_MENU_ITEM_ID))
    ]
  } catch {
    return defaultMenuItems
  }
}

export const saveMenuItems = (items: EditableMenuItem[]): void => {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedItems = [
    fixedMenuItem,
    ...items
      .filter(item => item.id !== FIXED_MENU_ITEM_ID)
      .map(item => ({
        ...item
      }))
  ]

  window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(normalizedItems))
  window.localStorage.removeItem(LEGACY_SHORTCUT_STORAGE_KEY)
}

export const materializeMenuItems = (
  items: EditableMenuItem[]
): MenuItemType[] => {
  return items.map(item => ({
    ...item,
    icon: iconMap[item.iconKey]
  }))
}
