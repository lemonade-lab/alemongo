import {useEffect, useState} from "react";
import {
  apiBotInfo,
  apiBotPackageClone,
  apiBotPackagesList,
  BotInfo,
  BotPackages,
} from "@/api";
import {Button, Form, Input, Modal, Tag} from "antd";
import {getBotName} from "../core";
import Box from "@/commom/Box";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";

const Panel = () => {
  const [pkgs, setPkgs] = useState<BotPackages[]>([]);
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const navicate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if(!visible){
      return;
    }
    form.setFieldsValue({
      url: "",
      branch: "release",
    });
  }, [form, visible]);

  const initBotInfo = (name: string) => {
    apiBotInfo({
      name,
    }).then((res) => {
      setInfo(res);
    });
  };
  const initPKGNames = (name: string) => {
    apiBotPackagesList({name}).then((res) => {
      setPkgs(res);
    });
  };

  useEffect(() => {
    const name = getBotName();
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
  return (
    <Box>
      <div className="p-2 flex-1 flex bg-slate-100 gap-2 flex-col xl:flex-row">
        <div className="flex-1 gap-2 flex flex-col bg-white rounded-md p-1">
          <div className="text-2xl flex justify-end items-center">
            <Button type="primary" onClick={() => setVisible(true)}>
              新增
            </Button>
          </div>
          <div className="flex-1 overflow-auto h-[calc(100vh-22rem)] xl:h-[calc(100vh/2-22rem)]">
            {pkgs.length === 0 ? (
              <div className="text-center text-gray-500">暂无扩展，请添加</div>
            ) : (
              <div className="flex flex-col gap-2">
                {pkgs.map((item) => {
                  const pkgJSON = JSON.parse(item.pkg);
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center border p-1 rounded-md cursor-pointer hover:border-slate-300 hover:bg-slate-50"
                      onClick={() => {
                        navicate(`/bots/${getBotName()}/packages/${item.name}`);
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        <Tag>{pkgJSON["name"]}</Tag>
                        {/* <Tag>{pkgJSON["version"]}</Tag> */}
                        <Tag>{pkgJSON["description"]}</Tag>
                        {/* <Tag>{item.git.branch}</Tag>   */}
                        <Tag>
                          {dayjs(item.git.date).format("YYYY-MM-DD HH:mm:ss")}
                        </Tag>
                      </div>
                      {/* <div className="flex gap-2 items-center justify-center">
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(item);
                          }}
                        >
                          更新
                        </Button>
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInstall(info.name);
                          }}
                        >
                          安装
                        </Button>
                      </div> */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
              <Input placeholder="git@github.com:xiuxianjs/xiuxian-bot.git" />
            </Form.Item>
            <Form.Item label="分支" name="branch">
              <Input placeholder="release" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Box>
  );
};

export default Panel;
