import {apiResetTemplate} from "@/api/settings/template";
import Box from "@/commom/Box";
import {useCommon} from "@/hook/useCommon";
import {SettingOutlined} from "@ant-design/icons";
import {message} from "antd";
import {useState} from "react";

/**
 * @returns
 */
const Settings = () => {
  const [common] = useCommon();

  const tools = [
    {
      name: "IP",
      data: {
        installed: true,
        version: common.info.location || "N/A",
      },
    },
    {name: "NodeJS", data: common.info.node},
    {name: "NVM", data: common.info.nvm},
    {name: "Git", data: common.info.git},
    {name: "Browser", data: common.info.browser},
  ];

  const [loading, setLoading] = useState(false);

  const onResetTemplate = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    apiResetTemplate()
      .then(() => {
        message.success("模板重置成功");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 transition-colors flex-1">
        <div className="flex flex-1 flex-col gap-6 items-center bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-lg transition-colors max-w-xl mx-auto w-full">
          <div className="flex flex-col gap-2 items-center">
            <SettingOutlined className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-indigo-500 dark:text-indigo-400 drop-shadow" />
            <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 dark:text-gray-100">
              通用设置
            </div>
            <div className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              {common.info.base.version}
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center w-full">
            {tools.map(
              (tool) =>
                tool.data?.installed && (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between w-full bg-slate-50 dark:bg-zinc-700 rounded-lg px-4 py-3 shadow border border-gray-100 dark:border-zinc-600"
                  >
                    <span className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-200">
                      {tool.name}
                    </span>
                    <span className="text-lg md:text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {tool.data.version}
                    </span>
                  </div>
                )
            )}
          </div>
          <div className="flex items-center justify-between w-full bg-red-50 dark:bg-zinc-800 rounded-lg px-4 py-3 shadow border border-red-100 dark:border-zinc-600">
            <div className="text-lg md:text-xl font-medium text-red-600 dark:text-red-400">
              重置模板
              {
                // 这里可以添加更多的描述信息
              }
              <span className="text-sm text-gray-500 dark:text-gray-400">
                （用于替换旧版本的基础机器人模板）
              </span>
            </div>
            <button
              onClick={onResetTemplate}
              className="text-lg md:text-xl font-semibold text-red-600 dark:text-red-400 hover:underline focus:outline-none"
            >
              重置
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Settings;
