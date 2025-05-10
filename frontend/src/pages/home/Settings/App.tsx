import {Switch} from "antd";

const Settings = () => {
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          通用设置
        </h2>
      </div>
      <div className="flex gap-2 flex-col bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center">
          <span className="mr-2">注册程序</span>
          <Switch   />
        </div>
        <div className="flex items-center">
          <span className="mr-2">开机自启</span>
          <Switch  />
        </div>
      </div>
    </div>
  );
};

export default Settings;
