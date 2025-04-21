import {Form, FormInstance, Input} from "antd";

const ConnectForm = (props: {
  form: FormInstance;
  onFinish: (values: {host: string; port: string}) => void;
}) => {
  return (
    <Form
      name="basic"
      form={props.form}
      labelCol={{span: 4}}
      onFinish={props.onFinish}
    >
      <Form.Item
        label="host"
        name="host"
        initialValue=""
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
  );
};

export default ConnectForm;
