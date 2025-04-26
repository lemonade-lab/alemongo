import {Button, Input, message} from "antd";
import {useEffect, useState} from "react";
import {Form} from "antd";
import Code from "@/commom/CodeMirror";
import {throttle} from "lodash";
import YAML from "js-yaml";

type YamlDataType = {
  gui: {
    port: number;
  };
  login: string;
  platform: string;
  repeated_event_time: number;
  repeated_user_time: number;
};

/**
 *
 * @param param0
 * @returns
 */
const CommonConfgEdit = ({
  name,
  value,
  onSave,
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
}) => {
  const [curData, setCurData] = useState<YamlDataType>({
    gui: {
      port: 0,
    },
    login: "",
    platform: "",
    repeated_event_time: 0,
    repeated_user_time: 0,
  });
  const [yamlData, setYamlData] = useState<string>("");
  const [form] = Form.useForm();
  useEffect(() => {
    if (!value) {
      form.setFieldsValue({
        name: name,
      });
      return;
    }
    const values = YAML.load(value) as YamlDataType;
    setCurData(values);
    setYamlData(YAML.dump(values));
    form.setFieldsValue({
      name: name,
      ...values,
    });
  }, [form, name, value]);

  // 节流更新 YAML 数据
  const throttledUpdateYaml = throttle(() => {
    const formData = form.getFieldsValue();
    delete formData.name;
    setYamlData(
      YAML.dump({
        ...curData,
        ...formData,
      })
    );
  }, 500);

  // 节流更新 form 数据
  const throttledUpdateform = throttle((values) => {
    const formData = form.getFieldsValue();
    form.setFieldsValue({
      ...formData,
      ...values,
    });
  }, 500);
  return (
    <div className="flex flex-1 flex-col xl:flex-row gap-2">
      <div className="flex-1 flex flex-col rounded-md px-4 py-2 bg-white">
        <Form
          form={form}
          labelCol={{span: 3}}
          onValuesChange={throttledUpdateYaml} // 监听表单值变化
        >
          {name && (
            <Form.Item
              label="名称"
              name="name"
              rules={[{required: true, message: "请输入名称"}]}
            >
              <Input placeholder="name" />
            </Form.Item>
          )}
          <Form.Item
            label="端口"
            name={["gui", "port"]}
            rules={[{required: true, message: "请输入端口"}]}
          >
            <Input
              type="number"
              placeholder="gui.port: 取1024-49151，但禁用3389|3306|1433|8000-8999"
            />
          </Form.Item>
          <Form.Item label="登录" name="login">
            <Input placeholder="login: 取qq-bot、qq、discord、onebot、kook等" />
          </Form.Item>
          <Form.Item label="平台" name="platform">
            <Input placeholder="platform: 取alemonjs-qq等（强制覆盖login）" />
          </Form.Item>
          <Form.Item label="事件过滤" name="">
            <Input placeholder="repeated_event_time: 多少毫秒内的相同事件消息将丢弃" />
          </Form.Item>
          <Form.Item label="用户过滤" name="">
            <Input placeholder="repeated_user_time: 多少毫秒内的相同用户消息将丢弃" />
          </Form.Item>
        </Form>
      </div>
      <div className="flex-1 flex flex-col rounded-md bg-white">
        <div className="flex items-center justify-between p-1 bg-slate-400 rounded-t-md">
          <div>alemon.config.yaml</div>
          <Button
            onClick={() => {
              const name = form.getFieldValue("name");
              try {
                onSave(name, YAML.dump(curData));
              } catch {
                message.error("yaml格式错误");
              }
            }}
          >
            保存
          </Button>
        </div>
        <div
          className="
        overflow-x-auto
        h-[calc(100vh/2-8rem)] 
        w-[calc(100vw-2rem)]
        sm:w-[calc(100vw-10rem)]
        xl:w-[calc(100vw/2-6rem)]
        xl:h-[calc(100vh-11rem)]
        "
        >
          <Code
            mode="yaml"
            value={yamlData}
            onChange={(_editor, _data, value) => {
              try {
                const values = YAML.load(value) as YamlDataType;
                setCurData({
                  ...curData,
                  ...values,
                });
                throttledUpdateform(values);
              } catch {
                console.log("yaml格式错误");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CommonConfgEdit;
