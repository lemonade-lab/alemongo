import {Checkbox, Form, FormInstance, Input, Select} from "antd";
import {EditFormValues} from "./types";
const EditForm = (props: {
  form: FormInstance;
  onFinish: (values: EditFormValues) => void;
}) => {
  return (
    <Form labelCol={{span: 5}} form={props.form} onFinish={props.onFinish}>
      <Form.Item
        label="按钮文字"
        name="label"
        rules={[{required: true, message: "请输入按钮文字"}]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="点击后文字"
        name="visited_label"
        rules={[{required: true, message: "请输入点击后文字"}]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="样式"
        name="style"
        rules={[{required: true, message: "请选择按钮样式"}]}
      >
        <Select>
          <Select.Option value={0}>灰色线框</Select.Option>
          <Select.Option value={1}>蓝色线框</Select.Option>
          <Select.Option value={3}>红色文字</Select.Option>
          <Select.Option value={4}>蓝色背景</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="指令内容"
        name="data"
        rules={[{required: true, message: "请输入指令内容"}]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="权限类型"
        name="permission"
        rules={[{required: true, message: "请选择权限类型"}]}
      >
        <Select>
          <Select.Option value={0}>指定用户</Select.Option>
          <Select.Option value={1}>仅管理员</Select.Option>
          <Select.Option value={2}>所有人</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="点击次数"
        name="click_limit"
        rules={[{required: true, message: "请输入点击次数限制"}]}
      >
        <Input type="number" min={1} />
      </Form.Item>
      <Form.Item
        label="不支持提示"
        name="unsupport_tips"
        rules={[{required: true, message: "请输入不支持提示"}]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="at_bot_show_channel_list" valuePropName="checked">
        <Checkbox>显示频道列表</Checkbox>
      </Form.Item>
      <Form.Item name="enter" valuePropName="checked">
        <Checkbox>自动发送</Checkbox>
      </Form.Item>
    </Form>
  );
};

export default EditForm;
