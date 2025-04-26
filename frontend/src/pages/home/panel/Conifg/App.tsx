import {apiBotConfig, apiBotConfigUpdate} from "@/api";
import {useEffect, useState} from "react";
import CommonConfgEdit from "../CommonConfgEdit";
import {message} from "antd";

const Conifg = () => {
  const [yamlData, setYamlData] = useState<string>("");
  useEffect(() => {
    const name = window.location.pathname.split("/")[2];
    apiBotConfig({
      name: name,
    }).then((res) => {
      console.log("res", res);
      setYamlData(res);
    });
  }, []);
  const onSave = (_name: string, value: string) => {
    const name = window.location.pathname.split("/")[2];
    apiBotConfigUpdate({
      name: name,
      content: value,
    })
      .then((res) => {
        console.log("res", res);
        message.success("保存成功");
        setYamlData(value);
      })
      .catch((err) => {
        message.error("保存失败");
        console.log("err", err);
      });
  };
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11 rounded-md flex justify-between text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置文件
        </h2>
      </div>
      <CommonConfgEdit value={yamlData} onSave={onSave} />
    </div>
  );
};

export default Conifg;
