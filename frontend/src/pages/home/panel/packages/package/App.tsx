import {
  apiBotInfo,
  apiBotPackagesGitPackageUpdate,
  apiBotPackagesInfo,
  apiBotYarnInstall,
  BotInfo,
  BotPackages,
} from "@/api";
import {Button, message, Modal, Spin} from "antd";
import {useEffect, useState} from "react";
import {getBotName, getGitPackageName} from "../../core";
import Box from "@/commom/Box";
import JSONEdit from "@/commom/JSONEdit";
import Xterm from "../../Xterm";

const GitPackage = () => {
  const [pkgData, setPkgData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const [open, setOpen] = useState(false);
  const [isInstallLoading, setIsInstallLoadin] = useState(false);

  const initBotInfo = (name: string) => {
    apiBotInfo({name}).then((res) => {
      setInfo(res);
    });
  };

  const initBotPackage = (name: string) => {
    const pkgName = getGitPackageName();
    apiBotPackagesInfo({
      name,
      app_name: pkgName,
    }).then((res: BotPackages) => {
      if (res.pkg) {
        setPkgData(res.pkg);
      }
    });
  };
  /**
   * @param _name
   * @param value
   * @returns
   */
  const onSave = (_name: string, value: string) => {
    if (isLoading) {
      message.warning("正在加载中，请稍后");
      return;
    }
    const name = getBotName();
    const pkgName = getGitPackageName();
    apiBotPackagesGitPackageUpdate({
      name: name,
      app_name: pkgName,
      content: value,
    }).finally(() => {
      setIsLoading(false);
    });
  };

  /**
   *
   * @param name
   * @returns
   */
  const onInstall = (name: string) => {
    if (isLoading) {
      message.warning("进行中，请稍后");
      return;
    }
    setIsInstallLoadin(true);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then(() => {
        setOpen(true);
      })
      .catch((err) => {
        console.log("err", err);
        message.error("失败");
      })
      .finally(() => {
        setIsInstallLoadin(false);
      });
  };

  useEffect(() => {
    const name = getBotName();
    initBotInfo(name);
    initBotPackage(name);
  }, []);
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 flex-1">
        <div className="flex justify-between">
          <div className="flex gap-2 dark:text-slate-300">
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
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              控制台
            </Button>
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
      {open && (
        <Modal
          open
          title="控制台"
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <div className="flex h-[calc(100vh/1.5)]">
            <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
          </div>
        </Modal>
      )}
    </Box>
  );
};

export default GitPackage;
