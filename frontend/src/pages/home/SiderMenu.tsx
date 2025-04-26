import {Menu} from "antd";
import {useEffect, useState} from "react";
import lodash from "lodash";
import {useLocation, useNavigate} from "react-router-dom";
import {menuItems} from "./menuItems";
/**
 *
 * @returns
 */
const SiderMenu = () => {
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
      if (window.innerWidth <= 639) {
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
    <>
      {!collapsed && (
        <Menu
          rootClassName="bg-gray-800 border-t"
          className="flex-1"
          selectedKeys={selectedKeys}
          onSelect={(e) => navigate(e.key)}
          mode="inline"
          theme="dark"
          items={menuItems}
        />
      )}
    </>
  );
};

export default SiderMenu;
