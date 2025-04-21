import {Menu} from "antd";
import {useEffect, useState} from "react";
import {DesktopOutlined, PieChartOutlined} from "@ant-design/icons";
import type {MenuProps} from "antd";
import lodash from "lodash";
import {Outlet, useNavigate} from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];
const menuItems: MenuItem[] = [
  {key: "/", icon: <PieChartOutlined />, label: "机器列表"},
  {key: "/config/list", icon: <DesktopOutlined />, label: "配置管理"},
  {key: "/button-template", icon: <DesktopOutlined />, label: "QQ按钮"},
  {key: "/onebot", icon: <DesktopOutlined />, label: "OneBot"},
];

/**
 *
 * @returns
 */
const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    // 使用节流
    const reSize = lodash.throttle(() => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    }, 100);
    reSize();
    window.addEventListener("resize", reSize);
    return () => {
      window.removeEventListener("resize", reSize);
    };
  }, []);
  const navigate = useNavigate();
  return (
    <section className="flex flex-1">
      <aside className="flex">
        <Menu
          className="flex-1"
          defaultSelectedKeys={["1"]}
          // defaultOpenKeys={["sub1"]}
          mode="inline"
          theme="dark"
          onSelect={(e) => navigate(e.key)}
          // 要根据屏幕大小来设置
          inlineCollapsed={collapsed}
          items={menuItems}
          rootClassName="bg-gray-800 border-t border-gray-500"
        />
      </aside>
      <article className="flex-1 flex flex-col">
        <Outlet />
      </article>
    </section>
  );
};

export default Home;
