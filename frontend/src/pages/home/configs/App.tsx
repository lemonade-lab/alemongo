import {
  EditOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {Button, Card, Dropdown, MenuProps, Modal} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiBotConfigsDelete, apiBotConfigsList} from "@/api";
const Configs = () => {
  const navigate = useNavigate();
  const [concifgNames, setConfigNames] = useState<string[]>([]);
  useEffect(() => {
    apiBotConfigsList().then((res) => {
      setConfigNames(res);
    });
  }, []);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <div>删除</div>,
    },
  ];

  const onDelete = (name: string) => {
    Modal.confirm({
      title: "删除配置",
      content: `确定删除配置 ${name} 吗？`,
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      onOk: () => {
        apiBotConfigsDelete({name}).then(() => {
          setConfigNames((prev) => prev.filter((item) => item !== name));
        });
      },
      okText: "确认",
      cancelText: "取消",
    });
  };

  return (
    <div className="p-4 flex gap-4 flex-col bg-slate-100 flex-1">
      <div className="h-11  rounded-md flex justify-between   text-white items-start">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          配置管理
        </h2>
        <Button
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => navigate("/configs/alemon.config/create")}
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
          新增
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {concifgNames.map((name, index) => (
          <Card
            key={index}
            variant="borderless"
            actions={[
              <div onClick={() => navigate(`/configs/${name}`)}>
                <EditOutlined key="edit" />
              </div>,
              <Dropdown
                menu={{
                  items: items.map((item) => {
                    return {
                      ...item,
                      onClick: () => onDelete(name),
                    };
                  }),
                }}
                placement="bottom"
                arrow
              >
                <div>
                  <SettingOutlined key="setting" />
                </div>
              </Dropdown>,
            ]}
          >
            <Card.Meta title={name} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Configs;
