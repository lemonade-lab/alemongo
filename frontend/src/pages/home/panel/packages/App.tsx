import {useEffect, useState} from "react";
import {
  apiBotInfo,
  apiBotPackageClone,
  apiBotPackagesDelete,
  apiBotPackagesList,
  apiBotPackagesPull,
  apiBotPackagesPullForce,
  BotInfo,
  BotPackages,
} from "@/api";
import {Button, Form, Input, message, Modal, Popconfirm, Tag} from "antd";
import {getBotName} from "../core";
import Box from "@/commom/Box";
import {useNavigate} from "react-router-dom";
import Xterm from "../Xterm";

const Panel = () => {
  const [pkgs, setPkgs] = useState<BotPackages[]>([]);
  const [info, setInfo] = useState<BotInfo>({
    name: "",
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: "",
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.setFieldsValue({
      url: "",
      branch: "release",
    });
  }, [form, visible]);

  const initBotInfo = (name: string) => {
    apiBotInfo({name}).then((res) => {
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
      .then(() => {
        initPKGNames(info.name);
      })
      .finally(() => {
        setIsLoading(false);
        setVisible(false);
      });
  };

  const onDelete = (name: string) => {
    // 删除扩展
    if (isLoading) return;
    setIsLoading(true);
    apiBotPackagesDelete({
      name: info.name,
      app_name: name,
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const onUpdate = (item: BotPackages | null) => {
    if (!item || isLoading) return;
    setIsLoading(true);
    apiBotPackagesPull({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch,
    })
      .then(() => {
        message.success("更新成功");
        setOpen(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onForceUpdate = (item: BotPackages | null) => {
    if (!item || isLoading) return;
    setIsLoading(true);
    apiBotPackagesPullForce({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch,
    })
      .then(() => {
        message.success("更新成功");
        setOpen(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box>
      <div className="p-2 flex-1 flex bg-slate-100 dark:bg-zinc-900 gap-2 flex-col xl:flex-row transition-colors">
        <div className="flex-1 gap-2 flex flex-col bg-white dark:bg-zinc-800 rounded-md p-4 shadow-md transition-colors">
          <div className="text-2xl flex justify-end items-center mb-2">
            <Button type="primary" onClick={() => setVisible(true)}>
              新增
            </Button>
          </div>
          <div className="flex-1 overflow-auto h-[calc(100vh-22rem)] xl:h-[calc(100vh/2-22rem)]">
            {pkgs.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                暂无扩展，请添加
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pkgs.map((item) => {
                  const pkgJSON = JSON.parse(item.pkg);
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded-md cursor-pointer hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bots/${getBotName()}/packages/${item.name}`);
                      }}
                    >
                      <div className="flex flex-col  md:flex-row flex-wrap gap-2">
                        <Tag color="blue">{item.name}</Tag>
                        <Tag color="blue">{pkgJSON["name"]}</Tag>
                        <Tag color="geekblue">{pkgJSON["description"]}</Tag>
                      </div>
                      <div className="flex flex-col  md:flex-row gap-2 items-center">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/bots/${getBotName()}/packages/${item.name}/package`
                            );
                          }}
                        >
                          配置
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(item);
                          }}
                        >
                          更新
                        </Button>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Popconfirm
                            title="强制更新"
                            description="确定进行强制更新吗，将会放弃本地所有修改?"
                            onConfirm={() => {
                              onForceUpdate(item);
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="primary" className="bg-red-500">
                              强制更新
                            </Button>
                          </Popconfirm>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Popconfirm
                            title="彻底删除"
                            description="你确定删除这个机器人吗?"
                            onConfirm={() => {
                              onDelete(item.name);
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="primary" className="bg-red-500">
                              删除
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
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
          confirmLoading={isLoading}
          onOk={() => {
            form.submit();
          }}
          onCancel={() => {
            setVisible(false);
          }}
          className="dark:bg-zinc-900"
        >
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="地址"
              name="url"
              rules={[{required: true, message: "请输入Git仓库地址"}]}
            >
              <Input placeholder="git@github.com:xiuxianjs/xiuxian-bot.git" />
            </Form.Item>
            <Form.Item
              label="分支"
              name="branch"
              rules={[{required: true, message: "请输入分支名"}]}
            >
              <Input placeholder="release" />
            </Form.Item>
          </Form>
        </Modal>
        {open && (
          <Modal
            open
            title="日志"
            onCancel={() => setOpen(false)}
            footer={null}
          >
            <div className="flex h-[calc(100vh/1.5)]">
              <Xterm info={info} onUpdate={(name) => initBotInfo(name)} />
            </div>
          </Modal>
        )}
      </div>
    </Box>
  );
};

export default Panel;
