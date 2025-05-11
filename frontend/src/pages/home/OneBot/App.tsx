import {Form, message, Modal} from "antd";
import {OneBotClient} from "./sdk/wss";
import {Button, Table, Tag} from "antd";
import type {TableProps, TabsProps} from "antd";
import {useState} from "react";
import {Tabs} from "antd";
import {
  MailOutlined,
} from "@ant-design/icons";
import ConnectForm from "./ConnectFrom";

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
  const [isConnect, setIsConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * @param values
   * @returns
   */
  const onFinish = (values: {host: string; port: string}) => {
    if (window?.wsClient || isConnect) {
      message.error("请先断开连接");
      return;
    }
    if (isLoading) {
      message.error("正在连接中，请稍后");
      return;
    }
    setIsLoading(true);

    const wsClient = new OneBotClient({
      url: `ws://${values.host}:${values.port}`,
    });
    wsClient.connect();
    wsClient.on("META", () => {
      message.success("连接成功");
      setIsConnect(true);
      setShow(false);
      setIsLoading(false);
    });
    wsClient.on("CLOSE", () => {
      message.error("连接已断开");
      window.wsClient = null;
      setIsConnect(false);
      setIsLoading(false);
    });
    wsClient.on("ERROR", (event) => {
      console.error(event);
    });
    // 得到api结果。
    wsClient.on("API_RESULT", (event) => {
      console.log("API_RESULT", event);
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
  const [activeKey, setActiveKey] = useState("request");
  const onChange = (key: string) => {
    console.log("Tab changed to: ", key);
    setActiveKey(key);
  };
  const items: TabsProps["items"] = [
    {
      label: (
        <div className="flex items-center gap-2">
          <MailOutlined />
          <span>请求</span>
        </div>
      ),
      key: "request",
      children: <Table columns={columns} dataSource={data} />,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <MailOutlined />
          <span>通知</span>
        </div>
      ),
      key: "notice",
    }
  ];

  const TabBarExtraContent = ({
    onConnect,
    onClose,
  }: {
    onConnect: () => void;
    onClose: () => void;
  }) => {
    return (
      <div className="flex gap-2">
        {isConnect ? (
          <Button type="primary" onClick={onClose}>
            断开
          </Button>
        ) : (
          <Button type="primary" onClick={onConnect}>
            连接
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex  p-2 md:p-4 flex-col">
      <div className="flex-1 overflow-auto w-full">
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={onChange}
          tabBarExtraContent={
            <TabBarExtraContent
              onConnect={() => {
                setShow(true);
              }}
              onClose={() => {
                if (window?.wsClient) {
                  window.wsClient.close();
                  window.wsClient = null;
                  message.success("断开连接成功");
                }
                setIsConnect(false);
              }}
            />
          }
        />
      </div>
      <Modal
        open={show}
        title="连接"
        loading={isLoading}
        onCancel={() => setShow(false)}
        onOk={() => form.submit()}
      >
        <ConnectForm form={form} onFinish={onFinish} />
      </Modal>
    </div>
  );
};

export default OneBot;
