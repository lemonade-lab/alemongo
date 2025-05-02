import {useNavigate} from "react-router-dom";
import CommonConfgEdit from "../../../../commom/ConfgEdit";
import {Button, message} from "antd";
import {apiBotConfigs, apiBotConfigsList, apiBotConfigsUpdate} from "@/api";
import {useEffect, useState} from "react";
const ConfigEdit = () => {
  const navigate = useNavigate();
  const [concifgNames, setConfigNames] = useState<string[]>([]);
  const [data, setData] = useState<string>("");
  // 是否是创建配置
  const isCreate = window.location.pathname.includes("create");
  // 获取当前配置名称
  const getName = () => {
    if (isCreate) {
      const names = window.location.pathname.split("/");
      // 获取倒数第二个元素
      const name = names[names.length - 2];
      return name || "alemon.config";
    }
    const path = window.location.pathname;
    const name = path.split("/").pop();
    return name;
  };

  useEffect(() => {
    if (!isCreate) {
      // 获取当前配置数据
      const name = getName();
      if (!name) {
        message.error("错误访问");
        return;
      }
      apiBotConfigs({
        name: name,
      })
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.log("err", err);
        });
    } else {
      apiBotConfigsList().then((res) => {
        setConfigNames(res);
      });
    }
  }, [isCreate]);

  const updateContent = (name: string, value: string) => {
    apiBotConfigsUpdate({
      name: name,
      content: value,
    })
      .then((res) => {
        console.log("res", res);
        if (!isCreate) {
          message.success("更新成功");
          return;
        }
        navigate("/configs");
      })
      .catch((err) => {
        console.log("err", err);
        message.error("保存失败");
      });
  };

  const onSave = (name: string, value: string) => {
    if (!isCreate) {
      const path = window.location.pathname;
      const name = path.split("/").pop();
      if (!name) {
        message.error("错误访问");
        return;
      }
      updateContent(name, value);
      return;
    }
    if (concifgNames.includes(name)) {
      message.error("配置名称已存在");
      return;
    }
    updateContent(name, value);
  };
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="rounded-md flex justify-between items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置编辑
        </h2>
        <Button
          type="primary"
          onClick={() => navigate("/configs")}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
          列表
        </Button>
      </div>
      <CommonConfgEdit onSave={onSave} name={getName()} value={data} />
    </div>
  );
};

export default ConfigEdit;
