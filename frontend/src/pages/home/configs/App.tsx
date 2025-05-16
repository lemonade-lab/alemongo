import {
  EditOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {Button, Card, Dropdown, MenuProps, Modal} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiBotConfigsDelete, apiBotConfigsList} from "@/api";
import Box from "@/commom/Box";
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
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 flex-1">
        <div className=" flex justify-end">
          <Button
            type="primary"
            onClick={() => navigate("/configs/alemon.config/create")}
          >
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
    </Box>
  );
};

export default Configs;
