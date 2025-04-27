import {apiBotPackage} from "@/api";
import Code from "@/commom/CodeMirror";
import EditBox from "@/commom/EditBox";
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
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          依赖列表
        </h2>
      </div>
      <EditBox
        left={
          <div className="flex-1 flex flex-col p-2">
            {list.map((item, index) => (
              <div
                key={index}
                className="bg-white p-2 rounded-md shadow-md mb-2"
              >
                {item}
              </div>
            ))}
          </div>
        }
        rightHeader={
          <div className="text-xl px-2 py-1 bg-slate-400">package.json</div>
        }
        right={<Code mode={"json"} value={pkgData} />}
      />
    </div>
  );
};

export default Package;
