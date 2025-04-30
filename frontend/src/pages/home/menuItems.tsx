import {
  DesktopOutlined,
  FileTextOutlined,
  QqOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
export const menuItems = [
  {key: "/", icon: <DesktopOutlined />, label: "机器列表"},
  {key: "/configs/list", icon: <FileTextOutlined />, label: "配置管理"},
  {
    key: "/account/list",
    icon: <UserOutlined />,
    label: "账户管理",
    identity: "admin",
  },
  {key: "/button-template", icon: <QqOutlined />, label: "QQ按钮"},
  {key: "/onebot", icon: <RobotOutlined />, label: "OneBot"},
];
