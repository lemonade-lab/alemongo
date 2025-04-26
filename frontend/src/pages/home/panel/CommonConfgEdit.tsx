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
  [key: string]: unknown;
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
      port: 17127,
    },
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
    const DB = {
      ...curData,
      ...values,
    };
    setCurData(DB);
    setYamlData(YAML.dump(DB));
    form.setFieldsValue({
      name: name,
      ...DB,
    });
  }, [curData, form, name, value]);

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
  const [showKey, setShowKey] = useState<string[]>([]);
  const onAddKey = (key: string) => {
    setShowKey((prev) => [key, ...prev]);
  };
  const onRemoveKey = (key: string) => {
    setShowKey((prev) => prev.filter((item) => item !== key));
  };
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

          <div className="flex flex-col gap-2">
            {showKey.includes("Login") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div>登录选择</div>
                  <Button onClick={() => onRemoveKey("Login")}>删除</Button>
                </div>

                <Form.Item label="登录" name="login">
                  <Input placeholder="login: 取qq-bot、qq、discord、onebot、kook等" />
                </Form.Item>
                <Form.Item label="平台" name="platform">
                  <Input placeholder="platform: 取alemonjs-qq等（强制覆盖login）" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("Login")}>
                  添加登录
                </Button>
              </div>
            )}
            {showKey.includes("Event") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div>过滤</div>
                  <Button onClick={() => onRemoveKey("Event")}>删除</Button>
                </div>
                <Form.Item label="事件过滤" name="repeated_event_time">
                  <Input
                    type="number"
                    placeholder="repeated_event_time: 多少毫秒内的相同事件消息将丢弃"
                  />
                </Form.Item>
                <Form.Item label="用户过滤" name="repeated_user_time">
                  <Input
                    type="number"
                    placeholder="repeated_user_time: 多少毫秒内的相同用户消息将丢弃"
                  />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("Event")}>
                  添加框架过滤
                </Button>
              </div>
            )}
            {showKey.includes("Redis") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div>Redis</div>
                  <Button onClick={() => onRemoveKey("Redis")}>删除</Button>
                </div>
                <Form.Item label="地址" name={["redis", "host"]}>
                  <Input placeholder="host: localhost" />
                </Form.Item>
                <Form.Item label="端口" name={["redis", "port"]}>
                  <Input type="number" placeholder="port" />
                </Form.Item>
                <Form.Item label="用户" name={["redis", "user"]}>
                  <Input placeholder="user" />
                </Form.Item>
                <Form.Item label="密码" name={["redis", "password"]}>
                  <Input placeholder="password" />
                </Form.Item>
                <Form.Item label="数据" name={["reids", "db"]}>
                  <Input type="number" placeholder="db" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("Redis")}>
                  添加Redis
                </Button>
              </div>
            )}
            {showKey.includes("MySQL") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div>MySQL</div>
                  <Button onClick={() => onRemoveKey("MySQL")}>删除</Button>
                </div>
                <Form.Item label="地址" name={["mysql", "host"]}>
                  <Input placeholder="host: localhost" />
                </Form.Item>
                <Form.Item label="端口" name={["mysql", "port"]}>
                  <Input type="number" placeholder="port" />
                </Form.Item>
                <Form.Item label="用户" name={["mysql", "user"]}>
                  <Input placeholder="user" />
                </Form.Item>
                <Form.Item label="密码" name={["mysql", "password"]}>
                  <Input placeholder="password" />
                </Form.Item>
                <Form.Item label="数据" name={["reids", "db"]}>
                  <Input type="number" placeholder="db" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("MySQL")}>
                  添加MySQL
                </Button>
              </div>
            )}
          </div>
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
