import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {Button, Dropdown, MenuProps, Space, Tooltip} from "antd";
import Tags from "@/commom/Tags";
import useBot from "@/hook/useBot";
import {DownOutlined} from "@ant-design/icons";
import {useCallback, useMemo} from "react";

const Panel = () => {
  const [bot] = useBot();
  const info = bot.info;
  const navigate = useNavigate();
  const location = useLocation();

  // 判断是否是显示 在线日志
  const isOnlineLog = useMemo(() => {
    // 不是日志页面 或者 当前是日志页面
    return !location.pathname.includes("logs")
  }, [location.pathname]);

  const onLog = useCallback(() => {
    if (isOnlineLog) {
      navigate(`/bots/${info.name}/logs`);
    } else {
      navigate(`/bots/${info.name}/xterm-date`);
    }
  }, [info.name, isOnlineLog, navigate]);

  const items: MenuProps["items"] = useMemo(() => {
    const i: MenuProps["items"] = [
      {
        key: "2",
        label: (
          <div
            onClick={() => {
              navigate(`/bots/${info.name}/config`);
            }}
          >
            配置
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            onClick={() => {
              navigate(`/bots/${info.name}/packages`);
            }}
          >
            应用
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <div
            onClick={() => {
              navigate(`/bots/${info.name}/env`);
            }}
          >
            环境
          </div>
        ),
      },
      {
        key: "1",
        label: (
          <div onClick={onLog}>
            {isOnlineLog ? "在线日志" : "查询日志"}
          </div>
        ),
      },
      {
        type: "divider",
      },
      {
        key: "5",
        label: (
          <div
            onClick={() => {
              bot.onInstall(info.name);
            }}
          >
            重载
          </div>
        ),
      },
    ];

    if (info.node_modules && info.status) {
      i.push({
        key: "6",
        label: (
          <div
            onClick={() => {
              bot.onStop(info.name);
            }}
          >
            停止
          </div>
        ),
      });
    }

    if (info.node_modules && !info.status) {
      i.push({
        key: "7",
        label: (
          <div
            onClick={() => {
              // 运行机器人
              bot.onRun(info.name);
            }}
          >
            运行
          </div>
        ),
      });
    }

    if (!info.node_modules) {
      i.push({
        key: "8",
        label: (
          <div
            onClick={() => {
              // 加载依赖
              bot.onInstall(info.name);
            }}
          >
            加载
          </div>
        ),
      });
    }

    return i;
  }, [onLog, isOnlineLog, info.node_modules, info.status, info.name, navigate, bot]);

  return (
    <div className="flex flex-col h-[calc(100vh-5.4rem)]">
      <div className="flex flex-col lg:flex-row gap-2  justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Bot 信息 */}
        <div className="flex flex-wrap gap-3 items-center ">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Name:
            </span>
            <Tags type="purple">{info.name}</Tags>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status:
            </span>
            {info.status ? (
              <Tags type="green">running</Tags>
            ) : (
              <Tags type="yellow">stopped</Tags>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Modules:
            </span>
            {info.node_modules ? (
              <Tags type="green">true</Tags>
            ) : (
              <Tags type="red">fasle</Tags>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Port:
            </span>
            <Tags type="indigo">{info.port}</Tags>
          </div>
        </div>

        {/* sm 以下：仅显示更多按钮 */}
        <div className="sm:hidden w-full flex justify-end">
          <Dropdown menu={{items}} trigger={["click"]}>
            <Button size="small" type="text">
              <Space>
                更多
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>

        {/* sm 以上：显示所有按钮 */}
        <div className="hidden sm:flex  ">
          <div className="flex flex-wrap gap-2 items-center w-full justify-end">
            {/* 导航按钮 */}
            <div className="flex gap-1">
              <Button
                type="text"
                size="small"
                onClick={() => navigate(`/bots/${info.name}/config`)}
              >
                配置
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => navigate(`/bots/${info.name}/package`)}
              >
                包管理
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => navigate(`/bots/${info.name}/env`)}
              >
                环境
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => navigate(`/bots/${info.name}/packages`)}
              >
                应用
              </Button>
              <Button type="text" size="small" onClick={onLog}>
                {isOnlineLog
                  ? "在线日志"
                  : "查询日志"}
              </Button>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 items-center">
              {info.node_modules && (
                <Tooltip title="重新加载依赖">
                  <Button
                    size="small"
                    className="text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800 border-amber-300 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-700"
                    onClick={() => {
                      bot.onInstall(info.name);
                    }}
                  >
                    重载
                  </Button>
                </Tooltip>
              )}

              {info.node_modules && info.status ? (
                <Button
                  type="primary"
                  size="small"
                  danger
                  onClick={() => bot.onStop(info.name)}
                >
                  停止
                </Button>
              ) : null}

              {info.node_modules && !info.status ? (
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                  onClick={() => {
                    bot.onRun(info.name);
                  }}
                >
                  运行
                </Button>
              ) : null}

              {!info.node_modules && (
                <Button
                  type="primary"
                  size="small"
                  className="bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600"
                  onClick={() => {
                    bot.onInstall(info.name);
                  }}
                >
                  加载依赖
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Panel;
