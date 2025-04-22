import {apiBotPackage} from "@/api";
import {useEffect, useState} from "react";

const Package = () => {
  const [pkgData, setPkgData] = useState<string>("");
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    // /panel/:name/pakcage
    const path = window.location.pathname;
    const name = path.split("/")[2];
    apiBotPackage({
      name: name,
    }).then((res) => {
      setPkgData(res);
    });
  }, []);
  useEffect(() => {
    if (!pkgData) {
      return;
    }
    const pkg = JSON.parse(pkgData);
    // 获取dependencies 和 devDependencies
    const dependencies = pkg.dependencies || {};
    const devDependencies = pkg.devDependencies || {};
    const allDependencies = {...dependencies, ...devDependencies};
    const list = Object.entries(allDependencies).map(([key, value]) => {
      return `${key}: ${value}`;
    });
    setList(list);
  }, [pkgData]);
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md p-1 flex justify-between items-center text-white">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          依赖列表
        </h2>
      </div>
      <div className="flex flex-1 flex-col xl:flex-row gap-2">
        <div className="flex-1 flex flex-col  rounded-md p-2">
          {list.map((item, index) => (
            <div key={index} className="bg-white p-2 rounded-md shadow-md mb-2">
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 flex bg-white rounded-md">
          <textarea
            className="flex-1  outline-none resize-none bg-white p-2 rounded-md shadow-md"
            value={pkgData}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Package;
