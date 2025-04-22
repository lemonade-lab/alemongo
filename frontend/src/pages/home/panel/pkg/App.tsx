import {apiBotPackage} from "@/api";
import {message} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Package = () => {
  const [pkgData, setPkgData] = useState<string>("");
  const [list, setList] = useState<string[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      // /panel/:name/pakcage
      const path = window.location.pathname;
      const name = path.split("/")[2];
      apiBotPackage({
        name: name,
      })
        .then((res) => {
          setPkgData(res);
        })
        .catch((err) => {
          console.log("err", err);
          message.error("获取依赖失败");
        });
    } catch (e) {
      console.log("error", e);
      navigate("/");
    }
  }, [navigate]);
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
      <div className="flex flex-col gap-2">
        <div className="flex-1 flex flex-col bg-slate-100 rounded-md p-2">
          {list.map((item, index) => (
            <div key={index} className="bg-white p-2 rounded-md shadow-md mb-2">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Package;
