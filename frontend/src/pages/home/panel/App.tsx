import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiBotInfo, apiBotLog, BotInfo} from "../../../api";
import {Button, Descriptions, DescriptionsProps} from "antd";
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
  useEffect(() => {
    try {
      // 获得参数 /panel/tag
      const path = window.location.pathname;
      const name = path.split("/")[2];
      apiBotInfo({
        name,
      }).then((res) => {
        setInfo(res);
      });
    } catch (e) {
      console.log("error", e);
      navigate("/");
    }
  }, [navigate]);
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

  const [data, setData] = useState<string[]>([]);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const length = useRef(0);
  const logRef = useRef(null);

  // 开始轮训
  const startPolling = (name: string) => {
    clearTimeout(pollingRef.current!);
    pollingRef.current = setTimeout(() => {
      apiBotLog({name})
        .then((res) => {
          // 根据换行符分割
          const lines = res.split("\n");
          // 过滤掉空行
          const filteredLines = lines.filter((line) => line.trim() !== "");
          setData(filteredLines);
        })
        .catch((err) => {
          console.log("err", err);
        })
        .finally(() => {
          startPolling(name);
        });
    }, 1000);
  };

  useEffect(() => {
    if (!info.name) return;
    startPolling(info.name);

    return () => {
      // 清除轮训
      clearTimeout(pollingRef.current!);
    };
  }, [info]);

  useEffect(() => {
    // 长度增加时，滚动到底部
    if (length.current < data.length) {
      // 滚动到底部
      if (logRef.current) {
        const element = logRef.current as HTMLDivElement;
        element.scrollTop = element.scrollHeight;
      }
    }
    length.current = data.length;
  }, [data]);

  return (
    <div className="p-4 flex-1 flex flex-col">
      <Descriptions className="flex-1" bordered items={items} />
      <div
        ref={logRef}
        className="overflow-auto flex-1 max-h-80 bg-slate-500 rounded-md p-1 text-white"
      >
        {data.map((item, index) => (
          <div key={index} className="flex justify-between px-1 bg-slate-600">
            <div className="flex">
              <span>{item}</span>
            </div>
            <div className="flex">
              <Button type="text">删除</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Panel;
