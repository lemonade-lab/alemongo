import {useNavigate} from "react-router-dom";
import {Button, message} from "antd";
import {useEffect, useState} from "react";
import {apiSSHList, apiSSHRead, apiSSHUpdate} from "@/api/ssh";
import FileEdit from "@/commom/FileEdit";
import Box from "@/commom/Box";
const SSHUpdate = () => {
  const navigate = useNavigate();
  const [concifgNames, setConfigNames] = useState<string[]>([]);
  const [data, setData] = useState<string>("");
  // 是否是创建配置
  const isCreate = window.location.pathname.includes("update");
  // 获取当前配置名称
  const getName = () => {
    if (isCreate) {
      const names = window.location.pathname.split("/");
      // 获取倒数第二个元素
      const name = names[names.length - 2];
      return name || "id_rsa.pub";
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
      apiSSHRead({
        name: name,
      }).then((res) => {
        setData(res);
      });
    } else {
      apiSSHList().then((res) => {
        setConfigNames(res);
      });
    }
  }, [isCreate]);

  const updateContent = (name: string, value: string) => {
    apiSSHUpdate({
      name: name,
      content: value,
    })
      .then(() => {
        if (!isCreate) {
          message.success("更新成功");
          return;
        }
        navigate("/ssh");
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
    <Box>
      <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
        <div className="flex  justify-end">
          <Button type="primary" onClick={() => navigate("/ssh")}>
            列表
          </Button>
        </div>
        <FileEdit onSave={onSave} name={getName()} value={data} />
      </div>
    </Box>
  );
};

export default SSHUpdate;
