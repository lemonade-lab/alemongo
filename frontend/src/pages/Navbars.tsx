import {useState} from "react";
import {apiLogout} from "../api";
import {useNavigate} from "react-router-dom";
import {Button, Drawer, Dropdown, MenuProps, message} from "antd";
import {menuItems} from "./home/menuItems";
import {useSelector} from "react-redux";
import {RootState} from "@/redux";
import ThemeToggle from "@/commom/ThemeToggle";

const Navbars = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const goLogout = () => {
    apiLogout()
      .then(() => {
        navigate("/login");
      })
      .catch(() => {
        message.error("退出失败");
      });
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <div onClick={() => navigate("/settings")}>通用设置</div>,
    },
    {
      key: "2",
      label: <div onClick={() => navigate("/update-password")}>更改密码</div>,
    },
    {
      key: "3",
      label: <div onClick={() => navigate("/update-email")}>更改邮箱</div>,
    },
    {
      key: "3",
      label: <div onClick={goLogout}>退出账户</div>,
    },
  ];

  const storeMe = useSelector((state: RootState) => state.me.info);
  // 过滤得到 item
  const curMenuItems = menuItems.filter((item) => {
    if (item?.identity) {
      if (item?.identity !== storeMe.identity) {
        return false;
      }
    }
    return true;
  });

  const MenuItems: MenuProps["items"] = curMenuItems.map((item, index) => {
    return {
      key: index,
      label: <div onClick={() => navigate(item.key)}>{item.label}</div>,
    };
  });

  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-gray-800 dark:bg-zinc-900 transition-colors">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Dropdown
              menu={{items: MenuItems}}
              placement="bottomLeft"
              arrow={{pointAtCenter: true}}
            >
              <Button
                type="text"
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-zinc-800 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg
                  className="block size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>
            </Dropdown>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Button
              onClick={() => navigate("/bots")}
              type="text"
              className="flex shrink-0 items-center cursor-pointer"
            >
              <img
                className="h-8 w-auto"
                src="https://alemonjs.com/img/alemon.png"
                alt="Your Company"
              />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="">
              <ThemeToggle />
            </div>
            <Button
              type="text"
              onClick={() => setOpen(true)}
              className="relative ml-3 rounded-full bg-gray-800 dark:bg-zinc-900 p-1 text-gray-400 dark:text-gray-300 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 dark:focus:ring-offset-zinc-900 focus:outline-hidden"
            >
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </Button>
            <div className="relative ml-3">
              <Dropdown
                menu={{items}}
                placement="bottomRight"
                arrow={{pointAtCenter: true}}
              >
                <button className="flex items-center">
                  <img
                    className="size-8 rounded-full"
                    src="https://q1.qlogo.cn/g?b=qq&s=0&nk=1715713638"
                    alt=""
                  />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
      <Drawer
        title="重要通知"
        closable={{"aria-label": "Close Button"}}
        onClose={() => setOpen(false)}
        open={open}
        className="dark:[&>.ant-drawer-content]:bg-zinc-900 dark:[&>.ant-drawer-header]:bg-zinc-900"
      >
        <div className="mb-4">
          <div
            className="flex items-center bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded"
            role="alert"
          >
            <svg
              className="w-5 h-5 mr-2 text-yellow-700 dark:text-yellow-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01"
              ></path>
            </svg>
            <span className="font-medium">系统通知：</span>
            <span className="ml-2">待更新</span>
          </div>
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbars;
