import {Form, FormInstance, Input} from "antd";

export type CreateFormValues = {
  name: string;
  port: number;
  login?: string;
  platform?: string;
  repeated_event_time?: number;
  repeated_user_time?: number;
};

const CreateForm = (props: {
  form: FormInstance;
  onFinish: (values: CreateFormValues) => void;
}) => {
  return (
    <Form labelCol={{span: 4}} form={props.form} onFinish={props.onFinish}>
      <Form.Item
        label="名称name"
        name="name"
        rules={[{required: true, message: "请输入名称"}]}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="端口port"
        name="port"
        rules={[{required: true, message: "请输入端口"}]}
      >
        <Input
          type="number"
          placeholder="取1024-49151，但禁用3389|3306|1433|8000-8999"
        ></Input>
      </Form.Item>
      <Form.Item label="登录login" name="login">
        <Input placeholder="取qq-bot、qq、discord、onebot、kook等"></Input>
      </Form.Item>
      <Form.Item label="平台platform" name="platform">
        <Input placeholder="取alemonjs-qq等（强制覆盖login）"></Input>
      </Form.Item>
      <Form.Item label="事件过滤" name="repeated_event_time">
        <Input placeholder="多少毫秒内的相同事件消息将丢弃"></Input>
      </Form.Item>
      <Form.Item label="用户过滤" name="repeated_user_time">
        <Input placeholder="多少毫秒内的相同用户消息将丢弃"></Input>
      </Form.Item>
    </Form>
  );
};

export default CreateForm;
