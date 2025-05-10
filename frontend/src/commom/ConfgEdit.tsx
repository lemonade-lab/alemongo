import {Button, Input, message, Dropdown, Space} from "antd";
import {useEffect, useState, useCallback} from "react";
import {Form} from "antd";
import Code from "@/commom/CodeMirror";
import {debounce} from "lodash";
import YAML from "js-yaml";
import EditBox from "./EditBox";

type BaseType = string | number | string[] | number[];
type ObjectType = {
  [key: string]: BaseType | ObjectType;
};

const map: {[key: string]: string} = {
  gui: "测试",
  port: "端口",
  master_id: "主人ID",
  master_key: "主人KEY",
  redis: "Redis",
  mysql: "MySQL",
  name: "名称",
  config: "配置",
  packages: "包",
  plugins: "插件",
  plugins_dir: "插件目录",
  node_modules: "node_modules",
  node_modules_dir: "node_modules目录",
  create_at: "创建时间",
  status: "状态",
  pid: "进程ID",
  token: "Token",
  password: "密码",
  host: "主机",
  db: "数据库",
  database: "数据库",
  user: "用户",
  proxy: "代理",
  id: "编号",
  app_id: "编号",
  secret: "密钥",
  ws: "WebSocket",
  url: "地址",
  channel_id: "频道ID",
  device: "设备",
  ver: "版本",
  sign_api_addr: "签名地址",
  apps: "应用",
  onebot: "OneBot",
  "qq-bot": "QQBot",
  discord: "DC",
  telegram: "TG",
  wechat: "微信",
  kook: "Kook",
};

const ConfigForm = ({
  data,
  map,
  inputValue,
  setInputValue,
  handleAddChild,
  handleDelChild,
}: {
  data: ObjectType;
  map: {[key: string]: string};
  inputValue: {[key: string]: string};
  setInputValue: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  handleAddChild: (
    keyPath: string[],
    type: "string" | "object" | "array"
  ) => void;
  handleDelChild: (keyPath: string[]) => void;
}) => {
  const createConfigForm = useCallback(
    (data: ObjectType, parentKey: string[] = []) => {
      return Object.keys(data).map((key) => {
        const currentKey = [...parentKey, key];
        const domKey = currentKey.join(".");
        if (Array.isArray(data[key])) {
          return (
            <div key={domKey} className="  p-1 ">
              <Form.List name={currentKey}>
                {(fields, {add, remove}) => (
                  <div key={domKey} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold flex gap-2 items-center">
                        {map[key] || key}
                        <Button
                          type="text"
                          className="font-light"
                          onClick={() => handleDelChild([...currentKey])}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    {fields.map(({key: fieldKey, name, ...restField}) => (
                      <Form.Item
                        key={fieldKey}
                        {...restField}
                        name={name}
                        className="mb-0"
                        rules={[{required: true, message: "请输入值"}]}
                      >
                        <Input placeholder={`请输入 ${map[key] || key}`} />
                      </Form.Item>
                    ))}
                    <div className="flex items-center justify-end gap-2 flex-1">
                      {fields.length > 0 && (
                        <>
                          <Button
                            type="dashed"
                            danger
                            onClick={() =>
                              handleAddChild([...currentKey], "array")
                            }
                          >
                            清空
                          </Button>
                          <Button
                            type="dashed"
                            danger
                            onClick={() => remove(fields.length - 1)}
                          >
                            删除最后一项
                          </Button>
                        </>
                      )}
                      <Button
                        type="dashed"
                        className="w-full"
                        onClick={() => add()}
                      >
                        添加 {map[key] || key}
                      </Button>
                    </div>
                  </div>
                )}
              </Form.List>
            </div>
          );
        } else if (typeof data[key] === "object" && data[key] !== null) {
          return (
            <div
              key={domKey}
              className="flex flex-col gap-2 rounded-md shadow-inner border p-1"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold flex gap-2 items-center">
                  {map[key] || key}
                  <Button
                    type="text"
                    className="font-light"
                    onClick={() => handleDelChild([...currentKey])}
                  >
                    删除
                  </Button>
                </div>
                <Space.Compact>
                  <Input
                    className="w-20"
                    placeholder="key"
                    value={inputValue[domKey]}
                    onChange={(e) =>
                      setInputValue({...inputValue, [domKey]: e.target.value})
                    }
                  />
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "string",
                          label: "字符串",
                        },
                        {
                          key: "object",
                          label: "对象",
                        },
                        {
                          key: "array",
                          label: "数组",
                        },
                      ],
                      onClick: ({key}) => {
                        if (!inputValue[domKey]) {
                          message.error("请输入key");
                          return;
                        }
                        handleAddChild(
                          [...currentKey, inputValue[domKey]],
                          key as "string" | "object" | "array"
                        );
                      },
                    }}
                    trigger={["click"]}
                  >
                    <Button type="primary" className="w-20">
                      添加
                    </Button>
                  </Dropdown>
                </Space.Compact>
              </div>
              {createConfigForm(data[key] as ObjectType, currentKey)}
            </div>
          );
        }
        return (
          <Form.Item
            className="mb-0"
            key={domKey}
            label={map[key] || key}
            name={currentKey}
          >
            <Input placeholder={key} />
          </Form.Item>
        );
      });
    },
    [handleAddChild, handleDelChild, inputValue, map, setInputValue]
  );

  const [mainInputValue, setMainInputValue] = useState<string>("");

  return (
    <>
      <Space.Compact className="bg-slate-100 p-1 rounded-md">
        <Input
          placeholder="main key"
          value={mainInputValue}
          onChange={(e) => {
            const value = e.target.value;
            setMainInputValue(value);
          }}
        />
        <Dropdown
          menu={{
            items: [
              {
                key: "string",
                label: "字符串",
              },
              {
                key: "object",
                label: "对象",
              },
              {
                key: "array",
                label: "数组",
              },
            ],
            onClick: ({key: type}) => {
              if (!mainInputValue) {
                message.error("请输入key");
                return;
              }
              handleAddChild(
                [mainInputValue],
                type as "string" | "object" | "array"
              );
            },
          }}
          trigger={["click"]}
        >
          <Button type="primary">添加</Button>
        </Dropdown>
      </Space.Compact>
      {createConfigForm(data)}
    </>
  );
};

const ConfgEdit = ({
  name,
  value,
  onSave,
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
}) => {
  const [jsonData, setJsonData] = useState<ObjectType>({});
  const [yamlData, setYamlData] = useState<string>("");
  const [form] = Form.useForm();

  // 通用的防抖函数
  const debounceFn = useCallback(
    debounce((fn: () => void) => fn(), 500),
    []
  );

  useEffect(() => {
    if (!value) {
      form.setFieldsValue({name});
      return;
    }
    try {
      const values = YAML.load(value) as ObjectType;
      const mergedData = {...jsonData, ...values};
      setJsonData(mergedData);
      setYamlData(YAML.dump(mergedData));
      form.setFieldsValue({name, ...mergedData});
    } catch {
      message.error("加载配置失败，请检查 YAML 格式");
    }
  }, [value]);

  const updateYaml = useCallback(() => {
    debounceFn(() => {
      const formData = form.getFieldsValue();
      delete formData.name;
      setYamlData(YAML.dump({...jsonData, ...formData}));
    });
  }, [jsonData, form]);

  const updateForm = useCallback(
    (values: ObjectType) => {
      debounceFn(() => {
        const formData = form.getFieldsValue();
        form.setFieldsValue({...formData, ...values});
      });
    },
    [form]
  );

  const handleYamlChange = useCallback(
    (_editor: unknown, _data: unknown, value: string) => {
      try {
        const values = YAML.load(value) as ObjectType;
        setJsonData({...jsonData, ...values});
        updateForm(values);
      } catch {
        message.error("YAML 格式错误，请检查输入");
      }
    },
    [jsonData, updateForm]
  );

  const [inputValue, setInputValue] = useState<{
    [key: string]: string;
  }>({});

  const handleAddChild = useCallback(
    (keyPath: string[], type: "string" | "object" | "array") => {
      const newData = {...jsonData};

      let status = true;

      // 递归函数，用于根据 keyPath 更新嵌套对象
      const updateNestedObject = (obj: any, keys: string[], value: ObjectType) => {
        const [currentKey, ...restKeys] = keys;
        if (restKeys.length === 0) {
          if (obj[currentKey]) {
            message.warning(`key ${currentKey} 已存在，请使用其他名称`);
            status = false;
            return;
          }
          obj[currentKey] = value;
        } else {
          if (!obj[currentKey] || typeof obj[currentKey] !== "object") {
            obj[currentKey] = {}; // 如果路径不存在，则初始化为对象
          }
          updateNestedObject(obj[currentKey], restKeys, value);
        }
      };

      // 根据类型设置新值
      const newValue = type === "array" ? [] : type === "object" ? {} : "";
      updateNestedObject(newData, keyPath, newValue);

      if (!status) {
        return;
      }

      message.info("修改成功");

      // 更新状态
      setJsonData(newData);
      setYamlData(YAML.dump(newData));
      form.setFieldsValue(newData);
    },
    [jsonData, form]
  );

  const handleDelChild = useCallback(
    (keyPath: string[]) => {
      const newData = {...jsonData};

      // 递归函数，用于根据 keyPath 删除嵌套对象
      const deleteNestedObject = (obj: any, keys: string[]) => {
        const [currentKey, ...restKeys] = keys;
        if (restKeys.length === 0) {
          delete obj[currentKey];
        } else {
          if (obj[currentKey] && typeof obj[currentKey] === "object") {
            deleteNestedObject(obj[currentKey], restKeys);
          }
        }
      };

      deleteNestedObject(newData, keyPath);

      // 更新状态
      setJsonData(newData);
      setYamlData(YAML.dump(newData));
      form.setFieldsValue(newData);
    },
    [jsonData, form]
  );

  const handleSave = useCallback(() => {
    const name = form.getFieldValue("name");
    try {
      onSave(name, YAML.dump(jsonData));
    } catch {
      message.error("保存失败，请重试");
    }
  }, [form, jsonData, onSave]);

  return (
    <EditBox
      left={
        <Form
          className="flex-1 p-2"
          form={form}
          labelCol={{span: 3}}
          onValuesChange={updateYaml}
        >
          {name && (
            <Form.Item
              label="名称"
              name="name"
              className="mb-0"
              rules={[{required: true, message: "请输入名称"}]}
            >
              <Input placeholder="name" />
            </Form.Item>
          )}
          <div className="flex flex-col gap-2">
            <ConfigForm
              data={jsonData}
              map={map}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleAddChild={handleAddChild}
              handleDelChild={handleDelChild}
            />
          </div>
        </Form>
      }
      rightHeader={
        <div className="flex items-center justify-between p-1 bg-slate-400 rounded-t-md">
          <div className="px-2">alemon.config.yaml</div>
          <Button onClick={handleSave}>保存</Button>
        </div>
      }
      right={<Code mode="yaml" value={yamlData} onChange={handleYamlChange} />}
    />
  );
};

export default ConfgEdit;
