import {apiBotLog} from "@/api";
import {DatePicker, DatePickerProps} from "antd";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {getBotName} from "../core";
import Box from "@/commom/Box";

const XtermDate = () => {
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    const name = getBotName();
    apiBotLog({name, timestamp: timestamp}).then((res) => {
      // 根据换行符分割
      const lines = res.split("\n");
      // 过滤掉空行
      const filteredLines = lines.filter((line) => line.trim() !== "");
      setData(filteredLines);
    });
  }, [timestamp]);
  const [data, setData] = useState<string[]>([]);
  const onChange: DatePickerProps["onChange"] = (date) => {
    if (!date) {
      return;
    }
    // 获取时间戳
    const timestamp = date.valueOf();
    setTimestamp(timestamp);
  };
  return (
    <Box>
      <div className="p-2 flex-1 flex bg-slate-100 dark:bg-zinc-900 flex-col transition-colors rounded-md">
        <div className="bg-slate-600 dark:bg-zinc-900 p-1 rounded-t-md flex justify-between items-center transition-colors">
          <div className="text-white flex gap-2 items-center">
            <div>日志</div>
          </div>
          <div className="">
            <DatePicker defaultValue={dayjs()} onChange={onChange} />
          </div>
        </div>
      </div>
      <div className="px-2 flex-1 flex bg-slate-100 dark:bg-zinc-900 flex-col transition-colors rounded-md">
        {data.map((item, index) => (
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

export default XtermDate;
