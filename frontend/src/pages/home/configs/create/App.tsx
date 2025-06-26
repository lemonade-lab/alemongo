import {useNavigate} from "react-router-dom";
import {message} from "antd";
import {apiBotConfigs, apiBotConfigsList, apiBotConfigsUpdate} from "@/api";
import {useEffect, useState} from "react";
import Box from "@/commom/Box";
import JSONEdit from "@/commom/JSONEdit";
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
      }).then((res) => {
        setData(res);
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
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 transition-colors flex-1">
        <JSONEdit
          disabledName={!isCreate}
          onSave={onSave}
          name={getName()}
          value={data}
          type="yaml"
          mode="yaml"
        />
      </div>
    </Box>
  );
};

export default ConfigEdit;
