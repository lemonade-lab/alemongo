import {RootState} from "@/redux";
import {SettingOutlined} from "@ant-design/icons";
import {useSelector} from "react-redux";

/**
 * @returns
 */
const Settings = () => {
  const info = useSelector((state: RootState) => state.info);
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="flex gap-2 flex-col bg-slate-50 p-4 rounded-md border">
        <div className="flex flex-col gap-2 items-center justify-center">
          <SettingOutlined className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl" />
          <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
            通用设置
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          {info.node.installed && (
            <div className="flex gap-2">
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                NodeJS
              </div>
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                {info.node.version}
              </div>
            </div>
          )}
          {info.nvm.installed && (
            <div className="flex gap-2">
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                NVM
              </div>
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                {info.nvm.version}
              </div>
            </div>
          )}
          {info.git.installed && (
            <div className="flex gap-2">
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                Git
              </div>
              <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                {info.git.version}
              </div>
            </div>
          )}
          {
            info.browser.installed && (
              <div className="flex gap-2">
                <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                  Browser
                </div>
                <div className="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                  {info.browser.version}
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Settings;
