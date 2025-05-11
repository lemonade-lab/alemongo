import {apiBotPackage, apiBotPackageUpdate, apiBotYarnInstall} from "@/api";
import PackageEdit from "@/commom/PackageEdit";
import {Button, message, Spin} from "antd";
import {useEffect, useState} from "react";
import {getBotName} from "../core";
import Box from "@/commom/Box";

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
      <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
        <div className="flex justify-end">
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
          <PackageEdit onSave={onSave} name={""} value={pkgData} />
        </Spin>
      </div>
    </Box>
  );
};

export default Package;
