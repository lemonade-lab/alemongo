import {Menu} from "antd";
import {useEffect, useState} from "react";
import {DesktopOutlined, PieChartOutlined} from "@ant-design/icons";
import type {MenuProps} from "antd";
import lodash from "lodash";
import {Outlet, useLocation, useNavigate} from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["/"]);
  useEffect(() => {
    const path = location.pathname;
    const menuItem = menuItems.find((item) => item?.key === path);
    if (menuItem?.key && typeof menuItem?.key == "string") {
      setSelectedKeys([menuItem.key]);
    } else {
      setSelectedKeys([]);
    }
  }, [location]);

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
  return (
    <section className="flex flex-1">
      <aside className="flex">
        <Menu
          rootClassName="bg-gray-800 border-t border-gray-500"
          className="flex-1"
          selectedKeys={selectedKeys}
          onSelect={(e) => navigate(e.key)}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={menuItems}
        />
      </aside>
      <article className="flex-1 flex flex-col">
        <Outlet />
      </article>
    </section>
  );
};

export default Home;
