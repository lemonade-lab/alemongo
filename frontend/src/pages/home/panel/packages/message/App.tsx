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
  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };

  const [item, setItem] = useState<BotPackages | null>(null);

  const [isInstallLoading, setIsInstallLoading] = useState(false);
  const onInstall = (name: string) => {
    if (isInstallLoading) {
      message.warning("正在加载中，请稍后");
      return;
    }
    setIsInstallLoading(true);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then((res) => {
        console.log("res", res);
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
  }, []);

  const onUpdate = (item: BotPackages) => {
    if (isLoading) return;
    setIsLoading(true);
    apiBotPackagesPull({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch,
    })
      .then((res) => {
        console.log(res);
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
      <div className="p-2 flex-1 flex flex-col bg-slate-100 gap-2  xl:flex-row">
        <div className="flex-1 gap-2 flex flex-col bg-white rounded-md p-1">
          <div className="text-2xl flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Tag>{pkgJSON["name"]}</Tag>
              <Tag>{pkgJSON["description"]}</Tag>
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Button
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(item);
                }}
              >
                尝试更新
              </Button>
              <Button
                type="primary"
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
            <Tag>{pkgJSON["version"]}</Tag>
            <Tag>{item?.git.branch}</Tag>
            <Tag>{dayjs(item?.git.date).format("YYYY-MM-DD HH:mm:ss")}</Tag>
          </div>
          <Markdown source={item?.md || ""}></Markdown>
        </div>
        <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
      </div>
    </Box>
  );
};

export default PackagesMessage;
