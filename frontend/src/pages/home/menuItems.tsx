import {
  AppstoreOutlined,
  DesktopOutlined,
  FileTextOutlined,
  RobotOutlined,
  SettingOutlined
} from '@ant-design/icons'
export const menuItems = [
  { key: '/', icon: <AppstoreOutlined />, label: '应用管理' },
  {
    key: '/account',
    icon: <SettingOutlined />,
    label: '账户管理',
    identity: 'admin' // 管理员和超级管理员都可以访问
  },
  { key: '/ssh', icon: <DesktopOutlined />, label: '密钥文件' },
  { key: '/bots', icon: <RobotOutlined />, label: '机器列表' },
  { key: '/configs', icon: <FileTextOutlined />, label: '配置管理' }
]
