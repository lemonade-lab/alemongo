import {useEffect, useState} from "react";
import {apiBotPackagesInfo, BotPackages} from "@/api";
import {Button, Tag} from "antd";
import Box from "@/commom/Box";
import {getBotName, getGitPackageName} from "../../core";
import Markdown from "@/commom/Markdown";
import dayjs from "dayjs";

const PackagesMessage = () => {
  const [item, setItem] = useState<BotPackages | null>(null);
  const pkgJSON = JSON.parse(item?.pkg || "{}");

  /**
   * 初始化
   * @param name
   */
  const initPKGNames = (name: string) => {
    const pkaName = getGitPackageName();
    apiBotPackagesInfo({
      name,
      app_name: pkaName,
    }).then((res) => {
      setItem(res);
    });
  };

  useEffect(() => {
    const name = getBotName();
    initPKGNames(name);
  }, []);

  return (
    <Box>
      <div className="p-2 flex-1 flex flex-col bg-slate-100 dark:bg-zinc-900 gap-2 xl:flex-row transition-colors">
        <div className="flex-1 gap-2 flex flex-col bg-white dark:bg-zinc-800 rounded-md p-4 shadow-md transition-colors">
          <div className="text-2xl flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Tag color="blue">{pkgJSON["name"]}</Tag>
              <Tag color="geekblue">{pkgJSON["description"]}</Tag>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Tag color="purple">{pkgJSON["version"]}</Tag>
              <Tag color="cyan">{item?.git.branch}</Tag>
              <Tag color="default">
                {item?.git.date
                  ? dayjs(item.git.date).format("YYYY-MM-DD HH:mm:ss")
                  : ""}
              </Tag>
            </div>
            <div>
              <Button type="primary">强制更新</Button>
            </div>
          </div>
          <Box>
            <Markdown source={item?.md || ""} />
          </Box>
        </div>
      </div>
    </Box>
  );
};

export default PackagesMessage;
