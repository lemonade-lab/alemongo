import {Button, Input, message, Form} from "antd";
import {useEffect, useState, useCallback, useRef} from "react";
import YAML from "js-yaml";
import JSONForm from "./JSONForm";
import {nameMap} from "./NameMap";
import MonacoEditor from "@monaco-editor/react";
import cloneDeep from "lodash/cloneDeep";
import useCodeTheme from "@/hook/useCodeTheme";

type BaseType = string | number | string[] | number[];
type ObjectType = {
  [key: string]: BaseType | ObjectType;
};
type InputDataType = "string" | "object" | "array" | "boolean";

const safeDecode = (val: string, type: "json" | "yaml"): ObjectType => {
  let obj;
  if (type === "yaml") {
    obj = YAML.load(val);
  } else {
    obj = JSON.parse(val);
  }
  if (typeof obj !== "object" || obj == null) obj = {};
  return obj as ObjectType;
};

const safeEncode = (val: ObjectType, type: "json" | "yaml"): string => {
  if (type === "yaml") {
    return YAML.dump(val);
  } else {
    return JSON.stringify(val, null, 2);
  }
};

const JSONEdit = ({
  name,
  value,
  onSave,
  onChange: onChangeProp,
  disabledName = false,
  type = "json",
  rightHeader = null,
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
  onChange?: (value: string) => void;
  disabledName?: boolean;
  type?: "json" | "yaml";
  rightHeader?: React.ReactNode;
}) => {
  const [jsonData, setJsonData] = useState<ObjectType>({});
  const [strData, setStrData] = useState<string>("");
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [nameValue, setNameValue] = useState<string>("");
  const [activeKey, setActiveKey] = useState<"form" | "code">("form");
  const theme = useCodeTheme();

  // 防止循环 set
  const lastStrData = useRef<string>(null);
  const lastJsonData = useRef<ObjectType>(null);

  useEffect(() => {
    try {
      const values = value ? safeDecode(value, type) : {};
      form.resetFields();
      setJsonData(values);
      setStrData(safeEncode(values, type));
      form.setFieldsValue(values);
      setDisabled(false);
      lastStrData.current = safeEncode(values, type);
      lastJsonData.current = cloneDeep(values);
    } catch (e: any) {
      setDisabled(true);
    }
  }, [value, type, form]);

  const updateStrData = useCallback(() => {
    const formData = form.getFieldsValue();
    if (JSON.stringify(formData) === JSON.stringify(lastJsonData.current))
      return;
    setJsonData(formData);
    const str = safeEncode(formData, type);
    setStrData(str);
    setDisabled(false);
    lastStrData.current = str;
    lastJsonData.current = cloneDeep(formData);
    onChangeProp?.(str);
  }, [form, type, onChangeProp]);

  const handleCodeChange = useCallback(
    (val: string | undefined) => {
      const value = val ?? "";
      if (value === lastStrData.current) return;
      setStrData(value); // 只更新本地状态，不格式化

      try {
        const json = safeDecode(value, type);
        setJsonData(json);
        form.setFieldsValue(json);
        setDisabled(false);
        lastStrData.current = value; // 只记录原始字符串
        lastJsonData.current = cloneDeep(json);
        onChangeProp?.(value);
      } catch (e: any) {
        setDisabled(true);
        message.error(`格式错误: ${e?.message || ""}`);
      }
    },
    [type, form, onChangeProp]
  );

  const handleAddChild = useCallback(
    (keyPath: string[], dataType: InputDataType) => {
      if (!Array.isArray(keyPath) || keyPath.length === 0) {
        message.error("非法路径");
        return;
      }
      const newData = cloneDeep(jsonData);
      let status = true;
      const updateNestedObject = (
        obj: any,
        keys: string[],
        value: ObjectType
      ) => {
        const [currentKey, ...restKeys] = keys;
        if (restKeys.length === 0) {
          if (obj[currentKey] !== undefined) {
            message.warning(`key ${currentKey} 已存在，请使用其他名称`);
            status = false;
            return;
          }
          obj[currentKey] = value;
        } else {
          if (!obj[currentKey] || typeof obj[currentKey] !== "object") {
            obj[currentKey] = {};
          }
          updateNestedObject(obj[currentKey], restKeys, value);
        }
      };
      const newValue = () => {
        switch (dataType) {
          case "array":
            return [];
          case "object":
            return {};
          case "string":
            return "";
          case "boolean":
            return false;
          default:
            return "";
        }
      };
      updateNestedObject(newData, keyPath, newValue());
      if (!status) return;
      message.info("修改成功");
      setJsonData(newData);
      setStrData(safeEncode(newData, type));
      form.setFieldsValue(newData);
      setDisabled(false);
      lastStrData.current = safeEncode(newData, type);
      lastJsonData.current = cloneDeep(newData);
      onChangeProp?.(safeEncode(newData, type));
    },
    [jsonData, type, form, onChangeProp]
  );

  const handleDelChild = useCallback(
    (keyPath: string[]) => {
      if (!Array.isArray(keyPath) || keyPath.length === 0) {
        message.error("非法路径");
        return;
      }
      const newData = cloneDeep(jsonData);
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
      setJsonData(newData);
      setStrData(safeEncode(newData, type));
      form.setFieldsValue(newData);
      setDisabled(false);
      lastStrData.current = safeEncode(newData, type);
      lastJsonData.current = cloneDeep(newData);
      onChangeProp?.(safeEncode(newData, type));
    },
    [jsonData, type, form, onChangeProp]
  );

  const handleSave = useCallback(() => {
    if (!nameValue) {
      message.error("名称不能为空");
      return;
    }
    try {
      onSave(nameValue, safeEncode(jsonData, type));
    } catch {
      message.error("保存失败，请重试");
    }
  }, [jsonData, nameValue, onSave, type]);

  useEffect(() => {
    if (name) setNameValue(name);
  }, [name]);

  // ---------- 自定义Tab ----------
  const tabList = [
    {key: "form", label: "表单模式"},
    {key: "code", label: "源码模式"},
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-1 bg-slate-300 dark:bg-zinc-800 dark:text-white rounded-t-md border border-b-0 border-slate-300 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          {!disabledName && (
            <Input
              value={nameValue}
              placeholder="name"
              allowClear
              onChange={(e) => setNameValue(e.target.value)}
              style={{minWidth: 120}}
            />
          )}
          {disabledName && (
            <span className="px-2 min-w-[120px] inline-block">{nameValue}</span>
          )}
          {disabled && (
            <span className="text-red-500 align-middle ml-2 min-w-[64px] inline-block">
              格式错误
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 justify-end">
          {rightHeader || null}
          <Button disabled={disabled} onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
      {/* 自定义Tab导航 */}
      <div className="flex border-x border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={
              "px-6 py-2 focus:outline-none " +
              (activeKey === tab.key
                ? "border-b-2 border-blue-500 bg-white dark:bg-zinc-900 font-bold"
                : "text-gray-500 dark:text-gray-300")
            }
            onClick={() => setActiveKey(tab.key as "form" | "code")}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 内容区 必须flex-1+h-full+min-h-0 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-900 border border-t-0 border-slate-300 dark:border-zinc-700 rounded-b-md">
        {activeKey === "form" && (
          <Form
            className="flex-1 p-3"
            form={form}
            labelCol={{flex: "80px"}}
            onValuesChange={updateStrData}
          >
            <div className="flex flex-col gap-2">
              <JSONForm
                data={jsonData}
                map={nameMap}
                handleAddChild={handleAddChild}
                handleDelChild={handleDelChild}
              />
            </div>
          </Form>
        )}
        {activeKey === "code" && (
          <div className="flex-1 flex flex-col min-h-0">
            <MonacoEditor
              value={strData}
              language={type === "yaml" ? "yaml" : "json"}
              width="100%"
              height="100%"
              options={{
                fontSize: 14,
                lineNumbers: "on",
                minimap: {enabled: false},
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "off",
                formatOnPaste: false,
                formatOnType: false,
              }}
              onChange={handleCodeChange}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONEdit;
