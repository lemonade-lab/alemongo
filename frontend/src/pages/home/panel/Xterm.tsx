import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  apiBotInfo,
  apiBotLog,
  apiBotRun,
  apiBotStop,
  apiBotYarnInstall,
  BotInfo,
} from "@/api";
import {Button, message, Spin} from "antd";
import Tags from "@/commom/Tags";
import {FullscreenOutlined} from "@ant-design/icons";

const Xterm = ({
  info,
  onUpdate,
}: {
  info: BotInfo;
  onUpdate: (name: string) => void;
}) => {
  const navigate = useNavigate();
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
    apiBotRun({
      name,
    }).then(() => {
      onUpdate(name);
    });
  };

  const onStop = (name: string) => {
    apiBotStop({
      name,
    }).then(() => {
      onUpdate(name);
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
          onUpdate(info.name);
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
      .then(() => {
        startPollingInstall(name);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 只是渲染最新的100条数据
  const renderData = data.slice(-100);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-slate-600 dark:bg-zinc-900 p-1 rounded-t-md flex justify-between items-center transition-colors">
        <div className="text-white flex gap-2 items-center">
          <div>控制台</div>
          {info.status ? (
            <Tags type="green">running</Tags>
          ) : (
            <Tags type="yellow">stop</Tags>
          )}
        </div>
        {info.pid ? (
          <div className="text-white dark:text-gray-200">PID: {info.pid}</div>
        ) : null}
        <div className="flex gap-2">
          <div
            className="right-2 bottom-2 cursor-pointer bg-slate-700 dark:bg-zinc-800 text-white dark:text-gray-200 py-1 px-2 rounded-md transition-colors"
            onClick={() => {
              navigate(`/bots/${info.name}/xterm-date`);
            }}
            title="全屏模式"
          >
            <FullscreenOutlined />
          </div>
          <Spin spinning={isLoading} size="small">
            {info.node_modules && info.status ? (
              <Button
                type="primary"
                className="bg-red-500 dark:bg-red-700 border-none"
                onClick={() => onStop(info.name)}
              >
                停止
              </Button>
            ) : null}
            {info.node_modules && !info.status ? (
              <Button
                type="primary"
                className="bg-green-600 dark:bg-green-700 border-none"
                onClick={() => onRun(info.name)}
              >
                运行
              </Button>
            ) : null}
            {!info.node_modules ? (
              <Button
                type="primary"
                className="text-black dark:text-yellow-100 bg-yellow-500 dark:bg-yellow-700 border-none"
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
        className="
        overflow-auto
        bg-slate-500 dark:bg-zinc-800
        rounded-b-md
        text-white dark:text-gray-100
        p-1
        w-[calc(100vw-2rem)]
        sm:w-[calc(100vw-10rem)]
        xl:w-full
        h-[calc(100vh/2-6rem)]
        xl:h-[calc(100vh-10rem)]
        transition-colors
        "
      >
        {renderData.map((item, index) => (
          <div key={index} className="flex justify-between px-1">
            <div className="flex">
              <span>{item}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Xterm;
