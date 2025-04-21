import {Switch} from "antd";
const Settings = () => {
  return (
    <div className="flex bg-slate-100 justify-center flex-1 p-4">
      <div className="w-full max-w-2xl p-4 flex flex-col gap-4 bg-white rounded-md shadow-md">
        <div className="flex gap-2">
          <div>注册程序</div>
          <Switch />
        </div>
        <div className="flex gap-2">
          <div>开机自启</div>
          <Switch />
        </div>
      </div>
    </div>
  );
};

export default Settings;
