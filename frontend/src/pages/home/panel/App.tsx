import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiBotInfo, BotInfo} from "@/api";
import {Button, message} from "antd";
import Tags from "@/commom/Tags";
import Xterm from "./Xterm";
import {getBotName} from "./core";
import Box from "@/commom/Box";

const Panel = () => {
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const navigate = useNavigate();
  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };
  useEffect(() => {
    const name = getBotName();
    initBotInfo(name);
  }, []);
  return (
    <Box>
      <div className="p-4 flex-1 flex bg-slate-100 dark:bg-zinc-900 gap-2 flex-col xl:flex-row transition-colors">
        <div className="flex-1 gap-2 flex flex-col bg-white dark:bg-zinc-800 rounded-md p-4 shadow-md transition-colors">
          <div className="text-2xl text-gray-900 dark:text-gray-100 font-semibold mb-2">
            机器人信息
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              名称:
            </div>
            <Tags type="purple">{info.name}</Tags>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              状态:
            </div>
            <div>
              {info.status ? (
                <Tags type="green">running</Tags>
              ) : (
                <Tags type="yellow">stop</Tags>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              依赖:
            </div>
            <div>
              {info.node_modules ? (
                <Tags type="green">true</Tags>
              ) : (
                <Tags type="red">false</Tags>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">环境:</div>
            <Button
              type="text"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => {
                navigate(`/bots/${info.name}/env`);
              }}
            >
              .env
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">包:</div>
            <Button
              type="text"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => {
                if (!info.node_modules) {
                  message.warning("请先安装依赖");
                  return;
                }
                navigate(`/bots/${info.name}/package`);
              }}
            >
              package.json
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              配置:
            </div>
            <Button
              type="text"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => {
                if (!info.node_modules) {
                  message.warning("请先安装依赖");
                  return;
                }
                navigate(`/bots/${info.name}/config`);
              }}
            >
              alemon.config.yaml
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              GIT扩展:
            </div>
            <Button
              type="text"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => {
                navigate(`/bots/${info.name}/packages`);
              }}
            >
              packages
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="min-w-20 text-gray-700 dark:text-gray-300">
              创建时间:
            </div>
            <Tags type="indigo">{info.create_at}</Tags>
          </div>
        </div>
        <div className="flex-1">
          <div className="xl:max-w-[calc(100vw/2-3rem)]">
            <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Panel;
