import { Button, Input, message, Dropdown, Space, MenuProps, Switch } from "antd";
import { useState } from "react";
import { Form } from "antd";
import classNames from "classnames";

type BaseType = string | number | string[] | number[];
type ObjectType = {
  [key: string]: BaseType | ObjectType;
};
type InputDataType = "string" | "object" | "array" | "boolean";

const JSONForm = ({
  data,
  map,
  handleAddChild,
  handleDelChild,
}: {
  data: ObjectType;
  map: { [key: string]: string };
  handleAddChild: (keyPath: string[], type: InputDataType) => void;
  handleDelChild: (keyPath: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState<{
    [key: string]: string;
  }>({});
  const [mainInputValue, setMainInputValue] = useState<string>("");

  const items: MenuProps["items"] = [
    {
      key: "add",
      type: "group",
      label: "添加",
      children: [
        { key: "string", label: "字符串" },
        { key: "object", label: "对象" },
        { key: "array", label: "数组" },
        { key: "boolean", label: "布尔值" },
      ],
    },
    {
      key: "delete",
      label: "删除",
      danger: true,
    },
  ];
  const baseItems: MenuProps["items"] = [
    { key: "string", label: "字符串" },
    { key: "object", label: "对象" },
    { key: "array", label: "数组" },
    { key: "boolean", label: "布尔值" },
  ];

  const createConfigForm = (data: ObjectType, parentKey: string[] = []) => {
    return Object.keys(data).map((key) => {
      const currentKey = [...parentKey, key];
      const domKey = currentKey.join(".");
      const isChild = parentKey.length > 0;

      // 数组类型
      if (Array.isArray(data[key])) {
        return (
          <div
            key={domKey}
            className={classNames({
              "flex flex-col gap-2 rounded-md shadow-inner border p-2 mb-6": !isChild,
            })}
          >
            <Form.List name={currentKey}>
              {(fields, { add, remove }) => (
                <div key={domKey} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div
                      className={classNames("text-sm flex gap-2 items-center", {
                        "font-bold": !isChild,
                      })}
                    >
                      {map[key] || key} {isChild && ":"}
                    </div>
                    <Button
                      onClick={() => handleDelChild([...currentKey])}
                      danger
                      className="w-20"
                    >
                      删除
                    </Button>
                  </div>
                  {fields.map(({ key: fieldKey, name, ...restField }) => (
                    <Form.Item
                      key={fieldKey}
                      {...restField}
                      name={name}
                      className="mb-0"
                      rules={[{ required: true, message: "请输入值" }]}
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
                          onClick={() => handleAddChild([...currentKey], "array")}
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
                    <Button type="dashed" className="w-full" onClick={() => add()}>
                      添加 {map[key] || key}
                    </Button>
                  </div>
                </div>
              )}
            </Form.List>
          </div>
        );
      } else if (typeof data[key] === "object" && data[key] !== null) {
        // 对象类型
        return (
          <div
            key={domKey}
            className={classNames({
              "flex flex-col gap-2 rounded-md shadow-inner border p-1 mb-6": !isChild,
            })}
          >
            <div className="flex items-center justify-between">
              <div
                className={classNames("text-sm flex gap-2 items-center", {
                  "font-bold": !isChild,
                })}
              >
                {map[key] || key}
              </div>
              <Space.Compact>
                <Input
                  className="w-20"
                  placeholder="key"
                  value={inputValue[domKey]}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, [domKey]: e.target.value })
                  }
                />
                <Dropdown
                  menu={{
                    items,
                    onClick: ({ key }) => {
                      if (key === "delete") {
                        handleDelChild([...currentKey]);
                        return;
                      }
                      if (!inputValue[domKey]) {
                        message.error("请输入key");
                        return;
                      }
                      handleAddChild([...currentKey, inputValue[domKey]], key as InputDataType);
                    },
                  }}
                  trigger={["click"]}
                >
                  <Button
                    onClick={(e) => e.stopPropagation()}
                    type="primary"
                    className="w-20"
                  >
                    操作
                  </Button>
                </Dropdown>
              </Space.Compact>
            </div>
            {createConfigForm(data[key] as ObjectType, currentKey)}
          </div>
        );
      } else if (typeof data[key] === "boolean") {
        // 布尔值类型
        return (
          <div
            key={domKey}
            className={classNames("flex flex-row gap-2", {
              " rounded-md shadow-inner border p-2": !isChild,
            })}
          >
            <div className="flex-1">
              <Form.Item
                label={map[key] || key}
                name={currentKey}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
            <Button
              onClick={() => handleDelChild([...currentKey])}
              danger
              className="w-20"
            >
              删除
            </Button>
          </div>
        );
      }
      // 基本类型
      return (
        <div
          key={domKey}
          className={classNames("flex flex-row gap-2 ", {
            "rounded-md shadow-inner border p-2": !isChild,
          })}
        >
          <div className="flex-1">
            <Form.Item label={map[key] || key} name={currentKey}>
              <Input placeholder={key} />
            </Form.Item>
          </div>
          <Button
            onClick={() => handleDelChild([...currentKey])}
            danger
            className="w-20"
          >
            删除
          </Button>
        </div>
      );
    });
  };

  return (
    <>
      <Space.Compact className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-md transition-colors">
        <Input
          placeholder="main key"
          value={mainInputValue}
          onChange={(e) => {
            setMainInputValue(e.target.value);
          }}
        />
        <Dropdown
          menu={{
            items: baseItems,
            onClick: ({ key }) => {
              if (!mainInputValue) {
                message.error("请输入key");
                return;
              }
              handleAddChild([mainInputValue], key as InputDataType);
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

export default JSONForm;