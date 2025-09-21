import { useState } from 'react'
import { apiUserCreate } from '@/api/users/admin'
import { Button, message, Modal } from 'antd'
import { Form, Input, Select } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { IDENTITY } from '@/utils/permission'

/**
 *
 * @param param0
 * @returns
 */
const Headings = ({
  onUpdate = () => {},
  selects = [],
  currentUserIdentity = ''
}: {
  onUpdate: () => void
  selects: string[]
  currentUserIdentity?: string
}) => {
  const [visible, setVisible] = useState(false)
  const onCreateAccount = () => {
    setVisible(true)
  }

  /**
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // 检查密码是否一致
    const username = values.username.trim()
    const password = values.password.trim()
    const confirm_password = values.confirm_password.trim()
    if (password !== confirm_password) {
      message.error('密码不一致')
      return
    }
    apiUserCreate({
      username: username,
      password: password,
      identity: values.identity
    })
      .then(() => {
        message.success('账户创建成功')
        onUpdate()
        setVisible(false)
        form.resetFields()
      })
      .catch(() => {
        message.error('账户创建失败，请重试')
      })
  }
  const [form] = Form.useForm()
  return (
    <header className="lg:flex lg:items-center lg:justify-between ">
      <div className="flex justify-end w-full">
        <Button
          type="primary"
          onClick={onCreateAccount}
          icon={<UserAddOutlined />}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6"
        >
          新建账户
        </Button>
      </div>
      <Modal
        open={visible}
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined className="text-blue-500" />
            <span className="font-semibold">新建账户</span>
          </div>
        }
        onCancel={() => setVisible(false)}
        onOk={() => {
          form.submit()
        }}
        okText="确认创建"
        cancelText="取消"
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
        width="90%"
      >
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
          <Form
            form={form}
            layout="vertical"
            className="space-y-4"
            onFinish={onSubmit}
          >
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  账户名称
                </span>
              }
              name="username"
              rules={[{ required: true, message: '请输入账户名称' }]}
            >
              <Input
                autoComplete="username"
                placeholder="请输入账户名称"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  用户身份
                </span>
              }
              name="identity"
              rules={[{ required: true, message: '请选择用户身份' }]}
            >
              <Select
                placeholder="请选择用户身份"
                className="bg-white/70 dark:bg-zinc-800/70"
              >
                {selects.map(item => {
                  // 如果当前用户不是超级管理员，过滤掉超级管理员选项
                  const currentUserIsSuperAdmin =
                    currentUserIdentity === IDENTITY.SUPER_ADMIN
                  if (
                    item === IDENTITY.SUPER_ADMIN &&
                    !currentUserIsSuperAdmin
                  ) {
                    return null
                  }

                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  登录密码
                </span>
              }
              name="password"
              rules={[{ required: true, message: '请输入登录密码' }]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="请输入登录密码"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  确认密码
                </span>
              }
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次密码输入不一致'))
                  }
                })
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="请再次输入密码"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </header>
  )
}

export default Headings
