import { Button, Input, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { Form } from "antd";
import Code from "@/commom/CodeMirror";
import { debounce } from "lodash";
import YAML from "js-yaml";
import EditBox from "./EditBox";
import JSONForm from "./JSONForm";
import { nameMap } from "./NameMap";

type BaseType = string | number | string[] | number[];
type ObjectType = {
  [key: string]: BaseType | ObjectType;
};
type InputDataType = "string" | "object" | "array" | "boolean";

const JSONEdit = ({
  name,
  value,
  onSave,
  disabledName = false,
  type = "json",
  mode = "json",
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
  disabledName?: boolean;
  type?: "json" | "yaml";
  mode?: "json" | "yaml";
}) => {
  const [jsonData, setJsonData] = useState<ObjectType>({});
  const [strData, setStrData] = useState<string>("");
  const [form] = Form.useForm();

  const [disabled, setDisabled] = useState(false);

  const [nameValue, setNameValue] = useState<string>("");
  useEffect(() => {
    if (name) {
      setNameValue(name);
    }
  }, [name]);

  // 通用的防抖函数
  const debounceFn = useCallback(
    debounce((fn: () => void) => fn(), 500),
    []
  );

  // 2个函数。解码和编码
  const decode = (value: string) => {
    if (type === "yaml") {
      return YAML.load(value) as ObjectType;
    } else {
      return JSON.parse(value) as ObjectType;
    }
  };
  const encode = (value: ObjectType) => {
    if (type === "yaml") {
      return YAML.dump(value);
    } else {
      return JSON.stringify(value, null, 2);
    }
  };

  useEffect(() => {
    if (!value) {
      return;
    }
    try {
      const values = decode(value);
      setJsonData(values);
      setStrData(encode(values));
      form.setFieldsValue({ ...values });
      setDisabled(false);
    } catch {
      setDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateStrData = useCallback(() => {
    debounceFn(() => {
      const formData = form.getFieldsValue();
      setStrData(encode({ ...jsonData, ...formData }));
    });
  }, [jsonData, form, encode, debounceFn]);

  const updateForm = useCallback(
    (values: ObjectType) => {
      debounceFn(() => {
        const formData = form.getFieldsValue();
        form.setFieldsValue({ ...formData, ...values });
      });
    },
    [form, debounceFn]
  );

  const onChange = useCallback(
    (_editor: unknown, _data: unknown, value: string) => {
      try {
        const values = decode(value);
        setJsonData({ ...values });
        updateForm(values);
        setDisabled(false);
      } catch {
        setDisabled(true);
      }
    },
    [updateForm, decode]
  );

  const handleAddChild = useCallback(
    (keyPath: string[], dataType: InputDataType) => {
      const newData = { ...jsonData };
      let status = true;
      // 递归函数，用于根据 keyPath 更新嵌套对象
      const updateNestedObject = (obj, keys: string[], value: ObjectType) => {
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
      if (!status) {
        return;
      }
      message.info("修改成功");
      setJsonData(newData);
      setStrData(encode(newData));
      form.setFieldsValue(newData);
    },
    [jsonData, encode, form]
  );

  const handleDelChild = useCallback(
    (keyPath: string[]) => {
      const newData = { ...jsonData };
      const deleteNestedObject = (obj, keys: string[]) => {
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
      setStrData(encode(newData));
      form.setFieldsValue(newData);
    },
    [jsonData, encode, form]
  );

  const handleSave = useCallback(() => {
    try {
      onSave(nameValue, encode(jsonData));
    } catch {
      message.error("保存失败，请重试");
    }
  }, [jsonData, nameValue, onSave, encode]);

  return (
    <EditBox
      left={
        <Form
          className="flex-1 p-2"
          form={form}
          labelCol={{ span: 6 }}
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
      }
      rightHeader={
        <div className="flex items-center justify-between p-1 bg-slate-400 dark:bg-zinc-800 dark:text-white rounded-t-md">
          <div>
            {!disabledName && <Input value={nameValue} placeholder="name" onChange={e => setNameValue(e.target.value)} />}
            {disabledName && <span className="px-2">{nameValue}</span>}
          </div>
          {disabled && (
            <div>
              <span className="text-red-500">格式错误</span>
            </div>
          )}
          <Button disabled={disabled} onClick={handleSave}>
            保存
          </Button>
        </div>
      }
      right={<Code mode={mode} value={strData} onChange={onChange} />}
    />
  );
};

export default JSONEdit;