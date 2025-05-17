import {useEffect, useState} from "react";
import {
  apiBotInfo,
  apiBotPackagesInfo,
  apiBotPackagesPull,
  apiBotYarnInstall,
  BotInfo,
  BotPackages,
} from "@/api";
import {Button, message, Tag} from "antd";
import Box from "@/commom/Box";
import {getBotName} from "../../core";
import Markdown from "@/commom/Markdown";
import Xterm from "../../Xterm";
import dayjs from "dayjs";

const PackagesMessage = () => {
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState<BotPackages | null>(null);
  const [isInstallLoading, setIsInstallLoading] = useState(false);

  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };

  const onInstall = (name: string) => {
    if (isInstallLoading) {
      message.warning("正在加载中，请稍后");
      return;
    }
    setIsInstallLoading(true);
    apiBotYarnInstall({
      name,
    })
      .then(() => {
        message.success("加载成功");
      })
      .finally(() => {
        setIsInstallLoading(false);
      });
  };

  const initPKGNames = (name: string) => {
    const pkaName = window.location.pathname.split("/").pop();
    apiBotPackagesInfo({
      name,
      app_name: pkaName,
    }).then((res) => {
      setItem(res);
    });
  };

  useEffect(() => {
    const name = getBotName();
    initBotInfo(name);
    initPKGNames(name);
    // eslint-disable-next-line
  }, []);

  const onUpdate = (item: BotPackages | null) => {
    if (!item || isLoading) return;
    setIsLoading(true);
    apiBotPackagesPull({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch,
    })
      .then(() => {
        message.success("更新成功");
        initPKGNames(info.name);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const pkgJSON = JSON.parse(item?.pkg || "{}");

  return (
    <Box>
      <div className="p-2 flex-1 flex flex-col bg-slate-100 dark:bg-zinc-900 gap-2 xl:flex-row transition-colors">
        <div className="flex-1 gap-2 flex flex-col bg-white dark:bg-zinc-800 rounded-md p-4 shadow-md transition-colors">
          <div className="text-2xl flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Tag color="blue">{pkgJSON["name"]}</Tag>
              <Tag color="geekblue">{pkgJSON["description"]}</Tag>
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Button
                type="primary"
                loading={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(item);
                }}
              >
                尝试更新
              </Button>
              <Button
                type="primary"
                loading={isInstallLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onInstall(info.name);
                }}
              >
                加载依赖
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag color="purple">{pkgJSON["version"]}</Tag>
            <Tag color="cyan">{item?.git.branch}</Tag>
            <Tag color="default">
              {item?.git.date
                ? dayjs(item.git.date).format("YYYY-MM-DD HH:mm:ss")
                : ""}
            </Tag>
          </div>
          <Box>
            <Markdown source={item?.md || ""} />
          </Box>
        </div>
        <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
      </div>
    </Box>
  );
};

export default PackagesMessage;
