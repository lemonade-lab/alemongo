import {Form, FormInstance, Input} from "antd";

const CreateForm = (props: {
  form: FormInstance;
  onFinish: (values: {name: string; port: string}) => void;
}) => {
  return (
    <Form form={props.form} onFinish={props.onFinish}>
      <Form.Item
        label="名称"
        name="name"
        rules={[{required: true, message: "请输入名称"}]}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="端口"
        name="port"
        rules={[{required: true, message: "请输入端口"}]}
      >
        <Input placeholder="禁用21、22、443、80、3389、3306、1433、8000-9000"></Input>
      </Form.Item>
    </Form>
  );
};

export default CreateForm;
