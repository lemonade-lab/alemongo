import {
  DesktopOutlined,
  FileTextOutlined,
  QqOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
export const menuItems = [
  {key: "/bots", icon: <DesktopOutlined />, label: "机器列表"},
  {key: "/configs", icon: <FileTextOutlined />, label: "配置管理"},
  {
    key: "/account",
    icon: <UserOutlined />,
    label: "账户管理",
    identity: "admin",
  },
  {key: "/button-template", icon: <QqOutlined />, label: "QQ按钮"},
  {key: "/ssh", icon: <RobotOutlined />, label: "SSH"},
  {key: "/onebot", icon: <RobotOutlined />, label: "OneBot"},
];
