import {
  AppstoreOutlined,
  DesktopOutlined,
  FileTextOutlined,
  SettingOutlined,
  ConsoleSqlOutlined,
  MonitorOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  ClusterOutlined
} from '@ant-design/icons'

export const menuItems = [
  { key: '/', icon: <AppstoreOutlined />, label: '应用中心' },
  { key: '/multibots', icon: <ClusterOutlined />, label: '多进程机器' },
  { key: '/configs', icon: <FileTextOutlined />, label: '配置管理' },
  {
    key: '/pipeline',
    icon: <CodeOutlined />,
    label: '流水线'
  },
  {
    key: '/ssh',
    icon: <DesktopOutlined />,
    label: '密钥文件',
    identity: 'admin' // 管理员和超级管理员都可以访问
  },
  {
    key: '/account',
    icon: <SettingOutlined />,
    label: '账户管理',
    identity: 'admin' // 管理员和超级管理员都可以访问
  },
  {
    key: '/port-monitor',
    icon: <MonitorOutlined />,
    label: '端口监控',
    identity: 'admin' // 管理员和超级管理员都可以访问
  },
  {
    key: '/system-logs',
    icon: <FileTextOutlined />,
    label: '系统日志',
    identity: 'admin'
  },
  {
    key: '/system-terminal',
    icon: <ConsoleSqlOutlined />,
    label: '系统终端',
    identity: 'super_admin' // 仅超级管理员可访问
  },
  {
    key: '/sftp',
    icon: <FileTextOutlined />,
    label: '文件管理',
    identity: 'super_admin'
  },
  {
    key: '/about',
    icon: <InfoCircleOutlined />,
    label: '关于',
    identity: 'admin' // 管理员和超级管理员都可以访问
  }
]
