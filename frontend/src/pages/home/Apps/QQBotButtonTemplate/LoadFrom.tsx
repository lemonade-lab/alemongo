import { Button, Form, Input } from 'antd'

const LoadForm = (props: {
  onFinish: (values: { template: string }) => void
  onUpload: () => void
}) => {
  return (
    <Form onFinish={props.onFinish}>
      <Form.Item label="模板内容" name="template">
        <Input.TextArea></Input.TextArea>
      </Form.Item>
      <div className="flex gap-2 justify-end">
        <Button onClick={props.onUpload}>选择上传</Button>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </div>
    </Form>
  )
}

export default LoadForm
