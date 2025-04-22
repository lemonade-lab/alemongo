import {apiBotLog} from "@/api";
import {DatePicker, DatePickerProps} from "antd";
import {useEffect, useState} from "react";

const XtermDate = () => {
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    // 获得参数 /panel/tag
    const path = window.location.pathname;
    const name = path.split("/")[2];
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
    console.log("timestamp", timestamp);
    // 转为日期
    const dateString = date.format("YYYY-MM-DD HH:mm:ss");
    console.log("dateString", dateString);
    setTimestamp(timestamp);
  };
  return (
    <div className="p-4 bg-slate-100 flex-1">
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-600 p-1 rounded-t-md flex justify-between items-center">
          <div className="text-white flex gap-2   items-center">
            <div>控制台日志</div>
          </div>
          <div className="">
            <DatePicker onChange={onChange} />
          </div>
        </div>
        <div className="overflow-auto max-h-80 relative flex-1 min-h-20  bg-slate-500 rounded-b-md p-1 text-white">
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

export default XtermDate;
