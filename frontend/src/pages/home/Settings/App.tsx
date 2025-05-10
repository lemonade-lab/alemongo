import {SettingOutlined} from "@ant-design/icons";

/**
 * @returns
 */
const Settings = () => {
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="flex gap-2 flex-col bg-slate-50 p-4 rounded-md border">
        <div className="flex flex-col gap-2 items-center justify-center">
          <SettingOutlined className="text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl" />
        </div>
        <div className="flex flex-col gap-2 items-center">
          
        </div>
      </div>
    </div>
  );
};

export default Settings;
