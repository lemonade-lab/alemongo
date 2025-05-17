import {Switch} from "antd";
import {useEffect, useState} from "react";

/**
 * 文件夹名字应该准确的说明了该功能的一般作用
 * @returns
 */
const Response = () => {
  const [list, setList] = useState<
    {
      name: string;
      response: string[];
    }[]
  >([]);
  useEffect(() => {
    setList([
      {
        name: "main",
        response: ["response/help", "response/command", "response/word/start"],
      },
    ]);
  }, []);
  return (
    <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
      
      </div>
      <div className="flex flex-1 flex-col xl:flex-row gap-2">
        <div className="flex-1 flex flex-col  rounded-md p-2">
          {list.map((item, index) => (
            <div
              key={index}
              className="bg-white p-2 rounded-md shadow-md mb-2 flex flex-col"
            >
              <div className="flex flex-col">
                <div>{item.name}</div>
                <div className="flex flex-col gap-2">
                  {item.response.map((res, index) => (
                    <div
                      key={index}
                      className="flex text-sm  text-gray-500 justify-between"
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {res}
                      </div>
                      <Switch></Switch>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Response;
