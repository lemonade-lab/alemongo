import {apiBotPackage, apiBotPackageUpdate, apiBotYarnInstall} from "@/api";
import {Button, message, Spin} from "antd";
import {useEffect, useState} from "react";
import {getBotName} from "../core";
import Box from "@/commom/Box";
import JSONEdit from "@/commom/JSONEdit";

const Package = () => {
  const [pkgData, setPkgData] = useState<string>("");
  useEffect(() => {
    const name = getBotName();
    apiBotPackage({
      name: name,
    }).then((res) => {
      setPkgData(res);
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const onSave = (_name: string, value: string) => {
    if (isLoading) {
      return;
    }
    const name = getBotName();
    setIsLoading(true);
    apiBotPackageUpdate({
      name: name,
      content: value,
    })
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const [isInstallLoading, setIsInstallLoadin] = useState(false);
  const onInstall = (name: string) => {
    if (isLoading) {
      message.warning("正在安装中，请稍后");
      return;
    }
    setIsInstallLoadin(true);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then((res) => {
        console.log("res", res);
        message.success("执行成功，请返回至控制台阅读日志");
      })
      .catch((err) => {
        console.log("err", err);
        message.error("安装失败");
      })
      .finally(() => {
        setIsInstallLoadin(false);
      });
  };
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 flex-1">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div>打开</div>
            <div
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => {
                window.open("https://www.npmjs.com");
              }}
            >
              https://www.npmjs.com
            </div>
            <div>搜索 dependencies 版本</div>
          </div>
          <Button
            loading={isInstallLoading}
            type="primary"
            onClick={() => {
              const name = getBotName();
              onInstall(name);
            }}
          >
            重载
          </Button>
        </div>
        <Spin spinning={isLoading}>
          <JSONEdit
            onSave={onSave}
            disabledName
            name="package.json"
            value={pkgData}
          />
        </Spin>
      </div>
    </Box>
  );
};

export default Package;
