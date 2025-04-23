import {apiBotConfig} from "@/api";
import {Input} from "antd";
import {useEffect, useState} from "react";
import {Form} from "antd";
const Config = () => {
  const [yamlData, setYamlData] = useState<string>("");
  useEffect(() => {
    const path = window.location.pathname;
    const name = path.split("/")[2];
    apiBotConfig({
      name: name,
    }).then((res) => {
      setYamlData(res);
    });
  }, []);
  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置文件
        </h2>
      </div>
      <div className="flex flex-1 flex-col xl:flex-row gap-2">
        <div className="flex-1 flex flex-col  rounded-md p-2 bg-white">
          <Form
            labelCol={{span: 4}}
            // form={props.form}
            // onFinish={props.onFinish}
          >
            <Form.Item
              label="名称name"
              name="name"
              rules={[{required: true, message: "请输入名称"}]}
            >
              <Input></Input>
            </Form.Item>
            <Form.Item
              label="端口port"
              name="port"
              rules={[{required: true, message: "请输入端口"}]}
            >
              <Input
                type="number"
                placeholder="取1024-49151，但禁用3389|3306|1433|8000-8999"
              ></Input>
            </Form.Item>
            <Form.Item label="登录login" name="login">
              <Input placeholder="取qq-bot、qq、discord、onebot、kook等"></Input>
            </Form.Item>
            <Form.Item label="平台platform" name="platform">
              <Input placeholder="取alemonjs-qq等（强制覆盖login）"></Input>
            </Form.Item>
            <Form.Item label="事件过滤" name="repeated_event_time">
              <Input placeholder="多少毫秒内的相同事件消息将丢弃"></Input>
            </Form.Item>
            <Form.Item label="用户过滤" name="repeated_user_time">
              <Input placeholder="多少毫秒内的相同用户消息将丢弃"></Input>
            </Form.Item>
          </Form>
        </div>
        <div className="flex-1 flex flex-col rounded-md bg-white">
          <div className="p-1 bg-slate-400 rounded-t-md">
            alemon.config.yaml
          </div>
          <div className="p-2 flex-1">
            <textarea
              className="w-full h-full outline-none resize-none "
              value={yamlData}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
