import {Button, Input, message} from "antd";
import {useEffect, useState} from "react";
import {Form} from "antd";
import Code from "@/commom/CodeMirror";
import {debounce} from "lodash";
import YAML from "js-yaml";
import EditBox from "./EditBox";

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
  // 初始配置。
  const [curData, setCurData] = useState<YamlDataType>({
    gui: {
      port: 17127,
    },
  });
  // yaml 数据
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
  }, [value]);

  // 更新 YAML 数据
  const updateYaml = debounce(() => {
    const formData = form.getFieldsValue();
    delete formData.name;
    setYamlData(
      YAML.dump({
        ...curData,
        ...formData,
      })
    );
  }, 500);

  // 更新 form 数据
  const updateform = debounce((values) => {
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

  const showError = debounce((errorMessage) => {
    message.error(errorMessage);
  }, 1000);

  const updateKeys = debounce((values) => {
    // 得到所有key
    const keys = Object.keys(values);
    setShowKey((prev) => {
      const newShowKey = [...prev, ...keys];
      const newShowKeys = Array.from(new Set(newShowKey));
      console.log("newShowKeys", newShowKeys);
      return newShowKeys;
    });
  }, 500);

  return (
    <EditBox
      left={
        <Form
          className="flex-1 p-2"
          form={form}
          labelCol={{span: 3}}
          onValuesChange={updateYaml} // 监听表单值变化
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
          <div className="flex flex-col gap-2">
            {showKey.includes("gui") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">GUI</div>
                  <Button onClick={() => onRemoveKey("gui")}>删除</Button>
                </div>
                <Form.Item
                  label="端口"
                  name={["gui", "port"]}
                  rules={[{required: true, message: "请输入端口"}]}
                >
                  <Input placeholder="gui.port: 取1024-49151，但禁用3389|3306|1433|8000-8999" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("gui")}>
                  添加GUI
                </Button>
              </div>
            )}
            {showKey.includes("login") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">login</div>
                  <Button onClick={() => onRemoveKey("login")}>删除</Button>
                </div>
                <Form.Item label="登录" name="login">
                  <Input placeholder="login: 取qq-bot、qq、discord、onebot、kook等" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("login")}>
                  添加登录
                </Button>
              </div>
            )}
            {showKey.includes("platform") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">platform</div>
                  <Button onClick={() => onRemoveKey("platform")}>删除</Button>
                </div>
                <Form.Item label="平台" name="platform">
                  <Input placeholder="platform: 取alemonjs-qq等（强制覆盖login）" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button
                  className="min-w-32"
                  onClick={() => onAddKey("platform")}
                >
                  添加平台
                </Button>
              </div>
            )}
            {showKey.includes("repeated_event_time") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">repeated_event_time</div>
                  <Button onClick={() => onRemoveKey("repeated_event_time")}>
                    删除
                  </Button>
                </div>
                <Form.Item label="事件过滤" name="repeated_event_time">
                  <Input placeholder="repeated_event_time: 多少毫秒内的相同事件消息将丢弃" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button
                  className="min-w-32"
                  onClick={() => onAddKey("repeated_event_time")}
                >
                  添加事件过滤
                </Button>
              </div>
            )}
            {showKey.includes("repeated_user_time") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">repeated_user_time</div>
                  <Button onClick={() => onRemoveKey("repeated_user_time")}>
                    删除
                  </Button>
                </div>
                <Form.Item label="用户过滤" name="repeated_user_time">
                  <Input placeholder="repeated_user_time: 多少毫秒内的相同用户消息将丢弃" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button
                  className="min-w-32"
                  onClick={() => onAddKey("repeated_user_time")}
                >
                  添加用户过滤
                </Button>
              </div>
            )}
            {showKey.includes("redis") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">Redis</div>
                  <Button onClick={() => onRemoveKey("redis")}>删除</Button>
                </div>
                <Form.Item label="地址" name={["redis", "host"]}>
                  <Input placeholder="host: localhost" />
                </Form.Item>
                <Form.Item label="端口" name={["redis", "port"]}>
                  <Input placeholder="port" />
                </Form.Item>
                <Form.Item label="密码" name={["redis", "password"]}>
                  <Input placeholder="password" />
                </Form.Item>
                <Form.Item label="数据" name={["redis", "db"]}>
                  <Input placeholder="db" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("redis")}>
                  添加Redis
                </Button>
              </div>
            )}
            {showKey.includes("mysql") ? (
              <>
                <div className="flex justify-between gap-2 my-2">
                  <div className="text-xl">MySQL</div>
                  <Button onClick={() => onRemoveKey("mysql")}>删除</Button>
                </div>
                <Form.Item label="地址" name={["mysql", "host"]}>
                  <Input placeholder="host: localhost" />
                </Form.Item>
                <Form.Item label="端口" name={["mysql", "port"]}>
                  <Input placeholder="port" />
                </Form.Item>
                <Form.Item label="用户" name={["mysql", "user"]}>
                  <Input placeholder="user" />
                </Form.Item>
                <Form.Item label="密码" name={["mysql", "password"]}>
                  <Input placeholder="password" />
                </Form.Item>
                <Form.Item label="数据" name={["mysql", "database"]}>
                  <Input placeholder="database" />
                </Form.Item>
              </>
            ) : (
              <div className="flex justify-end">
                <Button className="min-w-32" onClick={() => onAddKey("mysql")}>
                  添加MySQL
                </Button>
              </div>
            )}
          </div>
        </Form>
      }
      rightHeader={
        <div className="flex items-center justify-between p-1 bg-slate-400 rounded-t-md">
          <div>alemon.config.yaml</div>
          <Button
            onClick={() => {
              const name = form.getFieldValue("name");
              try {
                onSave(name, YAML.dump(curData));
              } catch {
                message.error("保存失败");
              }
            }}
          >
            保存
          </Button>
        </div>
      }
      right={
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
              updateKeys(values);
              updateform(values);
            } catch {
              showError("yaml格式错误");
            }
          }}
        />
      }
    />
  );
};

export default CommonConfgEdit;
