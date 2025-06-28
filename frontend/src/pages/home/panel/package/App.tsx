import {apiBotPackage, apiBotPackageUpdate} from "@/api";
import {Spin} from "antd";
import {useEffect, useState} from "react";
import {getBotName} from "../core";
import Box from "@/commom/Box";
import JSONEdit from "@/commom/JSONEdit";

const Package = () => {
  const [pkgData, setPkgData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  /**
   * @param _name
   * @param value
   * @returns
   */
  const onSave = (_name: string, value: string) => {
    if (isLoading) {
      return;
    }
    const name = getBotName();
    setIsLoading(true);
    apiBotPackageUpdate({
      name: name,
      content: value,
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const initBotPackage = (name: string) => {
    apiBotPackage({
      name: name,
    }).then((res) => {
      setPkgData(res);
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

export default Package;
