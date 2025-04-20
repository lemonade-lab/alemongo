import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiBotInfo, BotInfo} from "../../../api";
import {Descriptions, DescriptionsProps} from "antd";
import Tags from "../../../commom/Tags";

const Panel = () => {
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const navigate = useNavigate();
  const getInfo = async () => {
    try {
      // 获得参数 /panel/tag
      const path = window.location.pathname;
      const name = path.split("/")[2];
      await apiBotInfo({
        name,
      }).then((res) => {
        setInfo(res);
      });
    } catch (e) {
      console.log("error", e);
      navigate("/");
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  const items: DescriptionsProps["items"] = [
    {
      label: "名称",
      children: info.name,
    },
    {
      label: "状态",
      children: info.status ? (
        <Tags type="green">running</Tags>
      ) : (
        <Tags type="yellow">stop</Tags>
      ),
    },
    {
      label: "PID",
      children: info.pid,
    },
    {
      label: "创建",
      children: info.create_at,
    },
    {
      label: "依赖",
      children: info.node_modules ? "已安装" : "未安装",
    },
    {
      label: "运行",
      children: "2025-04-19 15:17:50",
    },
    {
      label: "配置",
      children: <>alemon.config.yaml</>,
    },
  ];

  return (
    <div className="p-4 flex-1 flex flex-col">
      <Descriptions className="flex-1" bordered items={items} />
      <div className="flex-1 h-full w-full bg-slate-500 rounded-md p-2 text-white">
        执行记录x x x s
      </div>
    </div>
  );
};

export default Panel;
