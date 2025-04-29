import {
  apiBotPackage,
  apiBotPackageUpdate,
  apiBotYarnInstall,
} from "@/api";
import PackageEdit from "@/commom/PackageEdit";
import {Button, message, Spin} from "antd";
import {useEffect, useState} from "react";

const Package = () => {
  const [pkgData, setPkgData] = useState<string>("");
  useEffect(() => {
    const name = window.location.pathname.split("/")[2];
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
    const name = window.location.pathname.split("/")[2];
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
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          依赖文件
        </h2>
        <div className="flex gap-2">
          <Button
            loading={isInstallLoading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              const name = window.location.pathname.split("/")[2];
              onInstall(name);
            }}
          >
            <svg
              className="mr-1.5 -ml-0.5 size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            重载
          </Button>
        </div>
      </div>
      <Spin spinning={isLoading}>
        <PackageEdit onSave={onSave} name={""} value={pkgData} />
      </Spin>
    </div>
  );
};

export default Package;
