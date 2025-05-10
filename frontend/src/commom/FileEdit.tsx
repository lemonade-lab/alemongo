import {Button, Form, Input} from "antd";
import {useEffect, useState} from "react";
import EditBox from "./EditBox";
import Code from "@/commom/CodeMirror";

const FileEdit = ({
  name,
  value,
  onSave,
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
}) => {
  const [fileData, setFileData] = useState<string>(value || "");
  const [form] = Form.useForm();

  useEffect(() => {
    setFileData(value || "");
    if (name) {
      form.setFieldsValue({name});
    }
  }, [form, name, value]);

  const handleCodeChange = (_editor: unknown, _data: unknown, val: string) => {
    setFileData(val);
  };

  const handleSave = () => {
    const name = form.getFieldValue("name");
    onSave(name, fileData);
  };

  return (
    <EditBox
      left={
        <Form className="flex-1 p-2" form={form} labelCol={{span: 3}}>
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
        </Form>
      }
      rightHeader={
        <div className="flex items-center justify-between p-1 bg-slate-400 rounded-t-md">
          <div className="px-2">{name}</div>
          <Button onClick={handleSave}>保存</Button>
        </div>
      }
      right={<Code mode="text" value={fileData} onChange={handleCodeChange} />}
    />
  );
};

export default FileEdit;
