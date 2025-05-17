import React from "react";
import Box from "@/commom/Box";
import {useNavigate} from "react-router-dom";
import {RobotOutlined} from "@ant-design/icons";

/**
 * @returns
 */
const Apps: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <div className="flex-1 dark:bg-zinc-900 bg-white transition-colors p-4 min-h-[300px]">
        <div className="flex flex-wrap gap-4">
          <div
            className="border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 rounded-xl cursor-pointer flex flex-col items-center ustify-between  gap-2 shadow hover:shadow-lg transition hover:scale-105"
            onClick={() => navigate("/apps/qqbot-button-template")}
          >
            <img
              className="w-20 h-20 object-contain"
              src="https://qq-web.cdn-go.cn/im.qq.com_new/863ecfe8/img/qq9logo.2a076d03.png"
              alt="QQ按钮模板生成器"
            />
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              QQ按钮模板生成器
            </div>
          </div>
          <div
            className="border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-between gap-2 shadow hover:shadow-lg transition hover:scale-105"
            onClick={() => navigate("/apps/onebot")}
          >
            <div className="text-3xl text-indigo-600 dark:text-indigo-400">
              <RobotOutlined />
            </div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              OneBot
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Apps;
