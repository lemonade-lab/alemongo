import {useState} from "react";
import {EditOutlined, SettingOutlined} from "@ant-design/icons";
import {Card, message, Modal} from "antd";
import CreateForm, { CreateFormValues } from "./CreateForm";
import {useForm} from "antd/es/form/Form";
 
const Configs = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<CreateFormValues[]>([]);
  const onCreateConfig = () => {
    setVisible(true);
  };
  // 添加
  const onFinishAdd = (values: CreateFormValues) => {
    // 可取1024-49151，但禁用3389|3306|1433|8000-8999
    // 检查端口
    const port = String(values.port);
    if (
      !/^[0-9]{1,5}$/.test(port) ||
      /^(3389|3306|1433)$/.test(port) ||
      /^(8[0-9]{3})$/.test(port) ||
      values.port < 1024 ||
      values.port > 49151
    ) {
      message.error("端口不合法");
      return;
    }
    setData((prev) => [...prev, values]);
    setVisible(false);
  };

  const [form] = useForm();

  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md p-1 flex justify-between items-center text-white">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置管理
        </h2>
        <button
          type="button"
          onClick={onCreateConfig}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg
            className="mr-1.5 -ml-0.5 size-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          新建
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {data.map((item, index) => (
          <Card
            key={index}
            variant="borderless"
            actions={[
              <div>
                <EditOutlined key="edit" />
              </div>,
              <div onClick={() => message.info("待支持")}>
                <SettingOutlined key="setting" />
              </div>,
            ]}
            style={{minWidth: 300}}
          >
            <Card.Meta
              title={item.name}
              description={
                <div className="flex flex-col">
                  <div className="flex gap-2">端口：{item.port}</div>
                </div>
              }
            />
          </Card>
        ))}
      </div>
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        title="新建配置"
        onOk={() => form.submit()}
        okText="确认"
        cancelText="取消"
      >
        <CreateForm form={form} onFinish={onFinishAdd} />
      </Modal>
    </div>
  );
};

export default Configs;
