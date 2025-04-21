import {PropsWithChildren, useEffect, useRef, useState} from "react";
import {apiLogout} from "../api";
import {useNavigate} from "react-router-dom";
import {message} from "antd";

const Icon1 = () => {
  return (
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
  );
};

const Icon2 = () => {
  return (
    <svg
      className="hidden size-6"
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
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};

const Logo = () => {
  return (
    <img
      className="h-8 w-auto"
      src="https://alemonjs.com/img/alemon.png"
      alt="Your Company"
    />
  );
};

// 图标-通知
const IconNotify = () => {
  return (
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
  );
};

// 用户头像
const UserAvatar = () => {
  return (
    <img
      className="size-8 rounded-full"
      src="https://q1.qlogo.cn/g?b=qq&s=0&nk=1715713638"
      alt=""
    />
  );
};

const More = (props: PropsWithChildren) => {
  const [showMore, setShowMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    // 监听点击事件
    document.addEventListener("click", handleClickOutside);
    return () => {
      // 取消订阅
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <div ref={ref}>
      <button
        type="button"
        className="relative cursor-pointer flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
        onClick={() => setShowMore(!showMore)}
      >
        <UserAvatar />
      </button>
      {showMore && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden">
          {props.children}
        </div>
      )}
    </div>
  );
};

const Navbars = () => {
  const menus = [
    {
      id: 1,
      name: "主页",
    },
    // {
    //   id: 2,
    //   name: "文档",
    // },
    // {
    //   id: 3,
    //   name: "源码",
    // },
  ];
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const onMenu = (name: {id: number; name: string}) => {
    if (name.id === 1) {
      navigate("/");
    } else if (name.id === 2) {
      window.open("https://alemonjs.com", "_blank");
    } else if (name.id === 3) {
      window.open("https://github.com/lemonade-lab/alemongo", "_blank");
    }
  };

  const navicate = useNavigate();
  const goLogout = () => {
    apiLogout()
      .then(() => {
        navicate("/login");
      })
      .catch(() => {
        message.error("退出失败");
      });
  };
  const moreMenus = [
    {
      id: 0,
      go: "/settings",
      name: "设置",
    },
    {
      id: 1,
      go: "/update-password",
      name: "改密",
    },
    {
      id: 2,
      go: "/logout",
      name: "退出",
    },
  ];

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Icon1 />
              <Icon2 />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div
              className="flex shrink-0 items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Logo />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {menus.map((item, index) => {
                  return (
                    <span
                      key={index}
                      onClick={() => onMenu(item)}
                      className="rounded-md cursor-pointer px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
            >
              <IconNotify />
            </button>
            <div className="relative ml-3">
              <More>
                {moreMenus.map((item, index) => {
                  return (
                    <div
                      className="block cursor-pointer px-4 py-2 text-sm text-gray-700"
                      key={index}
                      onClick={() => {
                        if (item.id === 2) {
                          goLogout();
                        } else {
                          navigate(item.go);
                        }
                      }}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </More>
            </div>
          </div>
        </div>
      </div>
      {showMenu && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {menus.map((item, index) => {
              return (
                <span
                  key={index}
                  onClick={() => onMenu(item)}
                  className="block cursor-pointer rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbars;
