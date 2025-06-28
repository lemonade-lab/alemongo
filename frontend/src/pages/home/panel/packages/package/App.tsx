import {
  apiBotPackagesGitPackageUpdate,
  apiBotPackagesInfo,
  BotPackages,
} from "@/api";
import {message, Spin} from "antd";
import {useEffect, useState} from "react";
import {getBotName, getGitPackageName} from "../../core";
import Box from "@/commom/Box";
import JSONEdit from "@/commom/JSONEdit";

const GitPackage = () => {
  const [pkgData, setPkgData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const name = getBotName();
    initBotPackage(name);
  }, []);
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 flex-1">
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

export default GitPackage;
