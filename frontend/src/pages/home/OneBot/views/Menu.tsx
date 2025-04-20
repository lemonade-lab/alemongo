import React, {useState} from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type {MenuProps} from "antd";
import {Menu} from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: "请求",
    key: "request",
    icon: <MailOutlined />,
  },
  {
    label: "通知",
    key: "notice",
    icon: <AppstoreOutlined />,
  },
  {
    label: "通讯",
    key: "list",
    icon: <SettingOutlined />,
    children: [
      {
        type: "group",
        label: "群",
        children: [
          {label: "Option 1", key: "setting:1"},
          {label: "Option 2", key: "setting:2"},
        ],
      },
      {
        type: "group",
        label: "好友",
        children: [
          {label: "Option 3", key: "setting:3"},
          {label: "Option 4", key: "setting:4"},
        ],
      },
    ],
  },
];

const App: React.FC = () => {
  const [current, setCurrent] = useState("mail");
  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };
  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default App;
