import {useEffect, useRef, useState} from "react";
import {apiBotLog} from "@/api";
import {getBotName} from "./core";
import Box from "@/commom/Box";

const Logs = () => {
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
        .finally(() => {
          startPolling(name);
        });
    }, 1000);
  };

  useEffect(() => {
    const botName = getBotName();
    startPolling(botName);
    return () => {
      clearTimeout(pollingRef.current!);
    };
  }, []);

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

  // 只是渲染最新的100条数据
  const renderData = data.slice(-100);

  return (
    <Box boxRef={logRef}>
      <div className="p-2 flex-1 flex bg-slate-100 dark:bg-zinc-900 flex-col transition-colors rounded-md">
        {renderData.map((item, index) => (
          <div
            key={index}
            className="
            flex
            w-full 
            px-1
            bg-slate-300
            dark:bg-zinc-800
            dark:text-zinc-400
            text-slate-800
           "
          >
            <div className="flex flex-row">
              <span>{item}</span>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default Logs;
