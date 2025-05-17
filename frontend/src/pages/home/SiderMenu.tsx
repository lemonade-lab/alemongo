import { Menu } from "antd";
import { useEffect, useState } from "react";
import lodash from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "./menuItems";
import { useSelector } from "react-redux";
import { RootState } from "@/redux";

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
    if (menuItem?.key && typeof menuItem?.key === "string") {
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

  const storeMe = useSelector((state: RootState) => state.me);
  // 过滤得到 item
  const curMenuItems = menuItems.filter((item) => {
    if (item?.identity) {
      if (item?.identity !== storeMe.identity) {
        // console.log("没有权限", item?.identity, storeMe);
        return false;
      }
    }
    return true;
  });

  return (
    <>
      {/* 增加 dark 适配与过渡 */}
      {!collapsed && (
        <Menu
          rootClassName="bg-gray-700 dark:bg-zinc-800 h-full py-2 transition-colors"
          selectedKeys={selectedKeys}
          onSelect={(e) => navigate(e.key)}
          mode="inline"
          theme="dark"
          items={curMenuItems}
        />
      )}
    </>
  );
};

export default SiderMenu;