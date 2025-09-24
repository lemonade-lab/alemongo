import {
  AppstoreOutlined,
  DesktopOutlined,
  FileTextOutlined,
  RobotOutlined,
  SettingOutlined,
  ConsoleSqlOutlined,
  MonitorOutlined,
  InfoCircleOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons'

// eslint-disable-next-line react-refresh/only-export-components
const TaskIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
)

export const menuItems = [
  { key: '/', icon: <AppstoreOutlined />, label: '应用中心' },
  { key: '/apps/manage', icon: <AppstoreAddOutlined />, label: '应用管理' },
  { key: '/tasks', icon: <TaskIcon />, label: '任务中心' },
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
