import {
  AppstoreOutlined,
  DesktopOutlined,
  FileTextOutlined,
  RobotOutlined,
  SettingOutlined,
  ConsoleSqlOutlined,
  MonitorOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
export const menuItems = [
  { key: '/', icon: <AppstoreOutlined />, label: '应用管理' },
  { key: '/bots', icon: <RobotOutlined />, label: '机器列表' },
  { key: '/configs', icon: <FileTextOutlined />, label: '配置管理' },
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
    key: '/system-terminal',
    icon: <ConsoleSqlOutlined />,
    label: '系统终端',
    identity: 'super_admin' // 仅超级管理员可访问
  },
  {
    key: '/port-monitor',
    icon: <MonitorOutlined />,
    label: '端口监控',
    identity: 'admin' // 管理员和超级管理员都可以访问
  },
  {
    key: '/about',
    icon: <InfoCircleOutlined />,
    label: '关于',
    identity: 'admin' // 管理员和超级管理员都可以访问
  }
]
