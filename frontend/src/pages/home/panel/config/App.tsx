import {apiBotConfig} from "@/api";
import {useEffect, useState} from "react";
const Config = () => {
  const [yamlData, setYamlData] = useState<string>("");
  useEffect(() => {
    const path = window.location.pathname;
    const name = path.split("/")[2];
    apiBotConfig({
      name: name,
    }).then((res) => {
      setYamlData(res);
    });
  }, []);
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md p-1 flex justify-between items-center text-white">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置文件
        </h2>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <textarea
          value={yamlData}
          readOnly
          className="flex-1  outline-none resize-none bg-white p-2 rounded-md shadow-md"
        />
      </div>
    </div>
  );
};

export default Config;
