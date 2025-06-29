import {useState} from "react";
import {apiUserCreate} from "@/api/users/admin";
import {Button, message, Modal} from "antd";
import {Form, Input, Select} from "antd";
/**
 *
 * @param param0
 * @returns
 */
const Headings = ({
  onUpdate = () => {},
  selects = [],
}: {
  onUpdate: () => void;
  selects: string[];
}) => {
  const [visible, setVisible] = useState(false);
  const onCreateAccount = () => {
    setVisible(true);
  };

  /**
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // 检查密码是否一致
    const username = values.username.trim();
    const password = values.password.trim();
    const confirm_password = values.confirm_password.trim();
    if (password !== confirm_password) {
      message.error("密码不一致");
      return;
    }
    apiUserCreate({
      username: username,
      password: password,
      identity: values.identity,
    }).then(() => {
      onUpdate();
      setVisible(false);
    });
  };
  const [form] = Form.useForm();
  return (
    <header className="lg:flex lg:items-center lg:justify-between py-2">
      <div className="flex justify-end w-full">
        <Button type="primary" onClick={onCreateAccount}>
          新建
        </Button>
      </div>
      <Modal
        open={visible}
        title="新建账户"
        onCancel={() => setVisible(false)}
        onOk={() => {
          form.submit();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          className="space-y-6 dark:[&>.ant-drawer-content]:bg-zinc-900 dark:[&>.ant-drawer-header]:bg-zinc-900 p-4"
          onFinish={onSubmit}
        >
          <Form.Item
            label="账户"
            name="username"
            rules={[{required: true, message: "请输入账户"}]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="身份"
            name="identity"
            rules={[{required: true, message: "请选择身份"}]}
          >
            <Select>
              {selects.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{required: true, message: "请输入密码"}]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              {required: true, message: "请确认密码"},
              ({getFieldValue}) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次密码输入不一致"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </header>
  );
};

export default Headings;
