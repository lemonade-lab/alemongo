import {apiBotLog} from "@/api";
import {DatePicker, DatePickerProps} from "antd";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {getBotName} from "../core";

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
    <div className="flex-1 p-2 bg-slate-100 dark:bg-zinc-900 ">
      <div className="bg-slate-600 dark:bg-zinc-900 p-1 rounded-t-md flex justify-between items-center transition-colors">
          <div className="text-white flex gap-2 items-center">
          <div>日志</div>
        </div>
        <div className="">
          <DatePicker defaultValue={dayjs()} onChange={onChange} />
        </div>
      </div>
      <div
      className="flex-1 bg-slate-500 dark:bg-zinc-800 rounded-b-md p-1 text-white dark:text-gray-100
            overflow-auto 
         w-[calc(100vw-2rem)] 
         sm:w-[calc(100vw-10rem)]
         h-[calc(100vh-10rem)]
      "
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
  );
};

export default XtermDate;
