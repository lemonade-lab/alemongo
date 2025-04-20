import {Form, Input, message, Modal} from "antd";
import {OneBotClient} from "./sdk/wss";
import {Button, Table, Tag} from "antd";
import type {TableProps} from "antd";
import {useState} from "react";
import Menu from "./views/Menu";

// 扩展window对象的类型
declare global {
  interface Window {
    wsClient: OneBotClient | null;
  }
}

interface DataType {
  group_id: string;
  flag: string;
  user_id: string;
  request_type: string;
  sub_type: string;
}

const OneBot = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [form] = Form.useForm();
  const [show, setShow] = useState(false);

  /**
   * @param values
   * @returns
   */
  const onFinish = (values: {host: string; port: string}) => {
    if (window?.wsClient) {
      message.error("请先断开连接");
      return;
    }
    const wsClient = new OneBotClient({
      url: `ws://${values.host}:${values.port}`,
    });
    wsClient.connect();
    wsClient.on("META", () => {});
    wsClient.on("ERROR", (event) => {
      console.error(event);
      window.wsClient = null;
    });
    // 得到api结果。
    wsClient.on("API_RESULT", (event) => {
      console.log("API_RESULT", event);
    });
    wsClient.on("CLOSE", () => {
      window.wsClient = null;
      message.error("连接已断开");
    });
    wsClient.on("REQUEST_ADD_GROUP", (event) => {
      console.log("REQUEST_ADD_GROUP", event);
      const db = [
        ...data,
        {
          group_id: event.group_id,
          flag: event.flag,
          user_id: event.user_id,
          sub_type: event.sub_type,
          request_type: event.request_type,
        },
      ];
      setData(db);
    });
    wsClient.on("REQUEST_ADD_FRIEND", (event) => {
      console.log("REQUEST_ADD_FRIEND", event);
      const db = [
        ...data,
        {
          group_id: event.group_id,
          flag: event.flag,
          user_id: event.user_id,
          sub_type: event.sub_type,
          request_type: event.request_type,
        },
      ];
      setData(db);
    });
    window.wsClient = wsClient;
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "group_id",
      dataIndex: "group_id",
      key: "group_id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "flag",
      dataIndex: "flag",
      key: "flag",
    },
    {
      title: "user_id",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "request_type",
      key: "request_type",
      dataIndex: "request_type",
      render: (_, {request_type}) => (
        <>
          {request_type === "group" ? (
            <Tag color="volcano">群</Tag>
          ) : (
            <Tag color="green">好友</Tag>
          )}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => {
              console.log(record);
              if (record.request_type === "group") {
                window.wsClient?.setGroupAddRequest({
                  flag: record.flag,
                  sub_type: record.sub_type,
                  approve: true,
                });
              }
              if (record.request_type === "friend") {
                window.wsClient?.setFriendAddRequest({
                  flag: record.flag,
                  approve: true,
                });
              }
            }}
          >
            通过
          </Button>
          <Button>拒绝</Button>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col">
      <Menu />
      <Table columns={columns} dataSource={data} />
      <Modal
        open={show}
        title="连接"
        onCancel={() => setShow(false)}
        onOk={() => form.submit()}
      >
        <Form name="basic" form={form} labelCol={{span: 4}} onFinish={onFinish}>
          <Form.Item
            label="host"
            name="host"
            initialValue="gz.xhh.pw"
            rules={[{required: true, message: "Please input your host!"}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="port"
            name="port"
            initialValue="6700"
            rules={[{required: true, message: "Please input your port!"}]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OneBot;
