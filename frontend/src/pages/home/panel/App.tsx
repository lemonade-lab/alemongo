import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  apiBotInfo,
  apiBotLog,
  apiBotRun,
  apiBotStop,
  apiBotYarnInstall,
  BotInfo,
} from "../../../api";
import {Button, message, Spin} from "antd";
import Tags from "../../../commom/Tags";
import {FullscreenOutlined} from "@ant-design/icons";

const Panel = () => {
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const navigate = useNavigate();

  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };

  useEffect(() => {
    // 获得参数 /panel/tag
    const path = window.location.pathname;
    const name = path.split("/")[2];
    initBotInfo(name);
  }, []);

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

  const [isLoading, setLoading] = useState(false);

  const onRun = (name: string) => {
    console.log(name);
    apiBotRun({
      name,
    }).then((res) => {
      console.log("res", res);
      initBotInfo(name);
    });
  };

  const onStop = (name: string) => {
    console.log(name);
    apiBotStop({
      name,
    }).then((res) => {
      console.log("res", res);
      initBotInfo(name);
    });
  };

  // 开始轮训
  const startPollingInstall = (name: string) => {
    setTimeout(() => {
      apiBotInfo({name})
        .then((res) => {
          if (!res.node_modules) {
            // 继续轮训。
            startPolling(name);
            return;
          }
          // 去掉loading
          setLoading(false);
          // 更新数据
          initBotInfo(info.name);
        })
        .catch((err) => {
          console.log("err", err);
          message.error("安装失败");
        });
    }, 1000);
  };

  const onInstall = (name: string) => {
    if (isLoading) {
      message.warning("正在安装中，请稍后");
      return;
    }
    setLoading(true);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then((res) => {
        console.log("res", res);
        startPollingInstall(name);
      })
      .catch((err) => {
        console.log("err", err);
        message.error("安装失败");
      });
  };

  return (
    <div className="p-4 flex-1 flex bg-slate-100 gap-2 flex-col xl:flex-row">
      <div className="flex-1 gap-2 flex flex-col bg-white rounded-md p-2">
        <div className="text-2xl">信息</div>
        <div className="flex gap-2">
          <div className="min-w-20">名称:</div>
          <Tags type='purple'>{info.name}</Tags>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">状态:</div>
          <div>
            {info.status ? (
              <Tags type="green">running</Tags>
            ) : (
              <Tags type="yellow">stop</Tags>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">依赖:</div>
          <div>
            {info.node_modules ? (
              <Tags type="green">true</Tags>
            ) : (
              <Tags type="red">false</Tags>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">包:</div>
          <Button
            type="text"
            onClick={() => {
              if (!info.node_modules) {
                message.warning("请先安装依赖");
                return;
              }
              navigate(`/panel/${info.name}/package`);
            }}
          >
            package.json
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">配置:</div>
          <Button
            type="text"
            onClick={() => {
              if (!info.node_modules) {
                message.warning("请先安装依赖");
                return;
              }
              navigate(`/panel/${info.name}/config`);
            }}
          >
            alemon.config.yaml
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">功能:</div>
          <Button
            type="text"
            onClick={() => {
              navigate(`/panel/${info.name}/response`);
            }}
          >
            response && middleware
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="min-w-20">创建时间:</div>
          <Tags type='indigo'>{info.create_at}</Tags>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-600 p-1 rounded-t-md flex justify-between items-center">
          <div className="text-white flex gap-2   items-center">
            <div>控制台</div>
            {info.status ? (
              <Tags type="green">running</Tags>
            ) : (
              <Tags type="yellow">stop</Tags>
            )}
          </div>
          {info.pid ? <div className="text-white">PID: {info.pid}</div> : null}
          <div className="flex gap-2">
            <div
              className=" right-2 bottom-2 cursor-pointer  bg-slate-700 text-white py-1 px-2 rounded-md"
              onClick={() => {
                navigate(`/panel/${info.name}/xterm-date`);
              }}
            >
              <FullscreenOutlined />
            </div>
            <Spin spinning={isLoading} size="small">
              {info.node_modules && info.status ? (
                <Button
                  type="primary"
                  className="bg-red-500 "
                  onClick={() => onStop(info.name)}
                >
                  停止
                </Button>
              ) : null}
              {info.node_modules && !info.status ? (
                <Button
                  type="primary"
                  className=""
                  onClick={() => onRun(info.name)}
                >
                  运行
                </Button>
              ) : null}
              {!info.node_modules ? (
                <Button
                  type="primary"
                  className="text-black bg-yellow-500"
                  onClick={() => onInstall(info.name)}
                >
                  加载依赖
                </Button>
              ) : null}
            </Spin>
          </div>
        </div>
        <div
          ref={logRef}
          className="overflow-auto max-h-80 flex-1 min-h-20  bg-slate-500 rounded-b-md p-1 text-white"
        >
          {data.map((item, index) => (
            <div key={index} className="flex justify-between px-1 ">
              <div className="flex">
                <span>{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Panel;
