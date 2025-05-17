import Box from "@/commom/Box";
import {RootState} from "@/redux";
import {SettingOutlined} from "@ant-design/icons";
import {useSelector} from "react-redux";

/**
 * @returns
 */
const Settings = () => {
  const info = useSelector((state: RootState) => state.info);

  const tools = [
    {name: "NodeJS", data: info.node},
    {name: "NVM", data: info.nvm},
    {name: "Git", data: info.git},
    {name: "Browser", data: info.browser},
  ];

  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 transition-colors flex-1">
        <div className="flex flex-col gap-6 items-center bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-lg transition-colors max-w-xl mx-auto w-full">
          <div className="flex flex-col gap-2 items-center">
            <SettingOutlined className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-indigo-500 dark:text-indigo-400 drop-shadow" />
            <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 dark:text-gray-100">
              通用设置
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
        </div>
      </div>
    </Box>
  );
};

export default Settings;
