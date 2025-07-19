import {
  EditOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Select,
} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  apiSSHAuthorize,
  apiSSHDelete,
  apiSSHGenerate,
  apiSSHList,
} from "@/api/ssh";
import Box from "@/commom/Box";
const Configs = () => {
  const navigate = useNavigate();
  const [sshNames, setSSHName] = useState<string[]>([]);
  useEffect(() => {
    apiSSHList().then((res) => {
      setSSHName(res);
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
        apiSSHDelete({name}).then(() => {
          setSSHName((prev) => prev.filter((item) => item !== name));
        });
      },
      okText: "确认",
      cancelText: "取消",
    });
  };

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = (values) => {
    if (loading) return;
    setLoading(true);
    apiSSHGenerate(values)
      .then(() => {
        message.success("密钥生成成功");
        setOpen(false);
        form.resetFields();
        // 刷新
        apiSSHList().then((res) => {
          setSSHName(res);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinish = (values) => {
    Modal.confirm({
      title: "确认生成密钥",
      content: (
        <div>
          确定生成吗？若存在<span className="text-red-600">{values.name}</span>
          将直接覆盖！！！
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okType: "primary",
      onOk: () => onSubmit(values),
      okText: "确认",
      cancelText: "取消",
    });
  };

  const [openAuthorize, setOpenAuthorize] = useState(false);
  const [formAuthorize] = Form.useForm();
  const [isLoadingAuthorize, setIsLoadingAuthorize] = useState(false);

  /**
   *
   * @param values
   */
  const onFinishAuthorize = (values: {address: string}) => {
    setIsLoadingAuthorize(true);
    apiSSHAuthorize(values)
      .then(() => {
        setOpenAuthorize(false);
        formAuthorize.resetFields();
        message.success("授权成功,请检查 known_hosts 文件");
      })
      .catch((error) => {
        console.error("授权失败:", error);
      })
      .finally(() => {
        setIsLoadingAuthorize(false);
      });
  };

  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 flex-1 00 dark:bg-zinc-900 transition-colors">
        <div className="flex justify-end gap-2">
          <Button
            type="primary"
            onClick={() => {
              setOpen(true);
              form.resetFields();
              form.setFieldsValue({
                key_type: "rsa",
                bit_size: 2048,
                name: "id_rsa",
                comment: "your@gmail.com",
                hash_algo: "",
                key_format: "",
              });
            }}
          >
            生产密钥
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setOpenAuthorize(true);
            }}
          >
            授权
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/ssh/id_rsa.pub/update")}
          >
            新增
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sshNames.map((name, index) => (
            <Card
              key={index}
              variant="borderless"
              actions={[
                <div onClick={() => navigate(`/ssh/${name}`)}>
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
      <Modal
        open={open}
        title="生产密钥"
        onCancel={() => setOpen(false)}
        onOk={() => {
          form.submit();
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            label="配置名"
            name="name"
            rules={[
              {
                required: true,
                message: "请输入配置名",
              },
              {
                message: "配置名只能包含字母、数字、下划线",
                pattern: /^[a-zA-Z0-9_]+$/,
              },
            ]}
          >
            <Input placeholder="-f ~/.ssh/${name}" />
          </Form.Item>
          <Form.Item
            label="密钥类型"
            name="key_type"
            rules={[{required: true, message: "请选择密钥类型"}]}
          >
            <Select
              placeholder="请选择密钥类型"
              options={[
                {label: "RSA", value: "rsa"},
                {label: "ED25519", value: "ed25519"},
                {label: "ECDSA", value: "ecdsa"},
                {label: "DSA", value: "dsa"},
                {label: "X25519", value: "x25519"},
                {label: "X448", value: "x448"},
                {label: "Curve25519", value: "curve25519"},
                {label: "Curve448", value: "curve448"},
              ]}
            />
          </Form.Item>
          <Form.Item
            label="密钥长度"
            name="bit_size"
            rules={[{required: true, message: "请选择密钥长度"}]}
          >
            <Select
              placeholder="指定密钥长度(仅对rsa/dsa有效)"
              options={[
                {label: "1024", value: 1024},
                {label: "2048", value: 2048},
                {label: "4096", value: 4096},
              ]}
            />
          </Form.Item>
          <Form.Item
            label="私钥密码"
            name="passphrase"
            rules={[{message: "请输入私钥密码"}]}
          >
            <Input.Password placeholder="-N 设置私钥密钥" />
          </Form.Item>
          <Form.Item
            label="指纹哈希算法"
            name="hash_algo"
            rules={[{message: "请选择指纹哈希算法"}]}
          >
            <Select
              placeholder="-E 使用特定的哈希算法生成指纹"
              options={[
                {label: "SHA-256", value: "sha256"},
                {label: "SHA-1", value: "sha1"},
                {label: "MD5", value: "md5"},
              ]}
            />
          </Form.Item>
          <Form.Item
            label="密钥格式"
            name="key_format"
            rules={[{message: "请选择密钥格式"}]}
          >
            <Select
              placeholder="-m 指定密钥格式：如PEM、EFC4716等"
              options={[
                {label: "OpenSSH", value: "OpenSSH"},
                {label: "PEM", value: "PEM"},
                {label: "PKCS#8", value: "PKCS8"},
                {label: "RFC4716", value: "RFC4716"},
              ]}
            />
          </Form.Item>
          <Form.Item
            label="注释"
            name="comment"
            rules={[{required: true, message: "请输入注释"}]}
          >
            <Input placeholder="-C 添加注释" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="授权"
        open={openAuthorize}
        loading={isLoadingAuthorize}
        onCancel={() => setOpenAuthorize(false)}
        onOk={() => {
          formAuthorize.submit();
        }}
      >
        <Form form={formAuthorize} onFinish={onFinishAuthorize}>
          <Form.Item label="授权地址" name="address">
            <Input placeholder="github.com" />
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  );
};

export default Configs;
