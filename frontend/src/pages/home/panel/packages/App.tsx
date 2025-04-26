import {useEffect, useState} from "react";
import {
  apiBotInfo,
  apiBotPackageClone,
  apiBotPackagesList,
  apiBotYarnInstall,
  BotInfo,
  BotPackages,
} from "@/api";
import Xterm from "../Xterm";
import {Button, Collapse, Form, Input, message, Modal, Tag} from "antd";
import Markdown from "@/commom/Markdown";

const Panel = () => {
  const [pkgs, setPkgs] = useState<BotPackages[]>([]);
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isInstallLoading, setIsInstallLoading] = useState(false);
  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };

  const onInstall = (name: string) => {
    if (isInstallLoading) {
      message.warning("正在加载中，请稍后");
      return;
    }
    setIsInstallLoading(true);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then((res) => {
        console.log("res", res);
        message.success("安装成功");
      })
      .catch((err) => {
        console.log("err", err);
        message.error("安装失败");
      })
      .finally(() => {
        setIsInstallLoading(false);
      });
  };

  const initPKGNames = (name: string) => {
    apiBotPackagesList({name}).then((res) => {
      setPkgs(res);
    });
  };
  useEffect(() => {
    // 获得参数 /panel/tag
    const path = window.location.pathname;
    const name = path.split("/")[2];
    initBotInfo(name);
    initPKGNames(name);
  }, []);
  const onFinish = (values: {url: string; branch: string}) => {
    if (isLoading) return;
    setIsLoading(true);
    apiBotPackageClone({
      name: info.name,
      repo_url: values.url,
      branch_name: values.branch,
    })
      .then((res) => {
        console.log(res);
        initPKGNames(info.name);
      })
      .finally(() => {
        setIsLoading(false);
        setVisible(false);
      });
  };
  const [form] = Form.useForm();
  return (
    <div className="p-4 flex-1 flex bg-slate-100 gap-2 flex-col xl:flex-row">
      <div className="flex-1 gap-2 flex flex-col bg-white rounded-md p-2">
        <div className="text-2xl flex justify-between items-center">
          <div>GIT扩展列表</div>
          <Button
            onClick={() => {
              setVisible(true);
            }}
          >
            新增
          </Button>
        </div>
        <Collapse
          items={pkgs.map((item) => {
            const pkgJSON = JSON.parse(item.pkg);
            return {
              key: item.name,
              label: (
                <div className="flex justify-between">
                  <div>
                    {item.name} <Tag>{pkgJSON["version"]}</Tag>{" "}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="text"
                      onClick={() => {
                        onInstall(item.name);
                      }}
                    >
                      安装
                    </Button>
                  </div>
                </div>
              ),
              children: (
                <div className="overflow-auto h-[calc(100vh-20rem)]">
                  <Markdown source={item.md}></Markdown>
                </div>
              ),
            };
          })}
          defaultActiveKey={["1"]}
        />
      </div>
      <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
      <Modal
        title="新增扩展"
        open={visible}
        loading={isLoading}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item label="地址" name="url">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item label="分支" name="branch">
            <Input placeholder="请输入分支" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Panel;
