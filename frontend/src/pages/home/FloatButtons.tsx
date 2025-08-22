import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  MailOutlined,
  LockOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import {
  FloatButton,
  Dropdown,
  Drawer,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  MenuProps
} from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import useTheme from '@/hook/useTheme'
import { apiLogout } from '@/api'
import { apiGetConfigEmail, apiUpdateEmailConfig } from '@/api/config/email'

const FloatButtons = () => {
  const navigate = useNavigate()
  const storeMe = useSelector((state: RootState) => state.me.info)
  const { dark, setDark } = useTheme()
  const [open, setOpen] = useState(false)
  const [openEmailModal, setOpenEmailModal] = useState(false)
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)

  const goLogout = () => {
    apiLogout().then(() => {
      navigate('/login')
    })
  }

  const onSubmit = (values: HTMLFormElement) => {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    apiUpdateEmailConfig({
      provider: values.provider,
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
      from_email: values.from_email
    })
      .then(() => {
        message.success('邮箱服务配置成功')
        setOpenEmailModal(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onEmailModal = () => {
    if (isLoading) {
      message.warning('正在加载，请稍后')
      return
    }
    setIsLoading(true)
    apiGetConfigEmail()
      .then(res => {
        form.setFieldsValue({
          provider: res.provider,
          host: res.host,
          port: res.port,
          username: res.username,
          password: res.password,
          from_email: res.from_email
        })
        setOpenEmailModal(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <div onClick={() => navigate('/settings')}>通用设置</div>,
      icon: <SettingOutlined />
    },
    {
      key: '2',
      label: <div onClick={() => navigate('/update-password')}>更改密码</div>,
      icon: <LockOutlined />
    },
    {
      key: '3',
      label: <div onClick={() => navigate('/update-email')}>更改邮箱</div>,
      icon: <MailOutlined />
    },
    {
      key: '4',
      label: <div onClick={onEmailModal}>邮箱服务</div>,
      icon: <MailOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: '0',
      label: <div onClick={goLogout}>退出账户</div>,
      icon: <LogoutOutlined />
    }
  ]

  const itemsMap: {
    [key: string]: string
  } = {
    1: '',
    2: '',
    3: '',
    4: 'admin',
    0: ''
  }

  const curItems = items.filter(item => {
    const value = itemsMap[String(item.key)]
    if (value) {
      if (value !== storeMe.identity) {
        return false
      }
    }
    return true
  })

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24, bottom: 81 }}
        icon={<AppstoreOutlined />}
      >
        {/* 主题切换按钮 */}
        <FloatButton
          icon={
            <div className="w-4 h-4 flex items-center justify-center">
              {dark ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          }
          tooltip="主题切换"
          onClick={() => setDark(!dark)}
        />

        {/* 通知按钮 */}
        <FloatButton
          icon={<BellOutlined />}
          tooltip="通知"
          onClick={() => setOpen(true)}
        />

        {/* 用户菜单按钮 */}
        <Dropdown
          menu={{ items: curItems }}
          placement="topRight"
          arrow={{ pointAtCenter: true }}
          trigger={['click']}
        >
          <FloatButton icon={<UserOutlined />} tooltip="用户菜单" />
        </Dropdown>
      </FloatButton.Group>

      {/* 通知抽屉 */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="gradient-text font-semibold text-sm">
              重要通知
            </span>
          </div>
        }
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => setOpen(false)}
        open={open}
        className="dark:[&>.ant-drawer-content]:bg-zinc-900/95 dark:[&>.ant-drawer-header]:bg-zinc-900/95 backdrop-blur-xl"
        width="80%"
      >
        <div className="mb-4">
          <div
            className="flex items-center bg-gradient-to-r from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/30 dark:to-orange-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg backdrop-blur-sm"
            role="alert"
          >
            <svg
              className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01"
              ></path>
            </svg>
            <span className="font-medium text-sm">系统通知：</span>
            <span className="ml-2 text-sm">待更新</span>
          </div>
        </div>
      </Drawer>

      {/* 邮箱配置模态框 */}
      <Modal
        open={openEmailModal}
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="gradient-text font-semibold text-sm">
              邮箱服务配置
            </span>
          </div>
        }
        onCancel={() => setOpenEmailModal(false)}
        onOk={() => {
          form.submit()
        }}
        okText="确定"
        cancelText="取消"
        loading={isLoading}
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
        width="90%"
      >
        <Form form={form} className="space-y-4 p-2" onFinish={onSubmit}>
          <Form.Item
            label="类别"
            name="provider"
            rules={[{ required: true, message: '请选择邮箱类别' }]}
          >
            <Input allowClear placeholder="qq" className="chatgpt-input" />
          </Form.Item>
          <Form.Item
            label="服务器"
            name="host"
            rules={[{ required: true, message: '请输入 SMTP 服务器' }]}
          >
            <Input
              allowClear
              placeholder="smtp.qq.com"
              className="chatgpt-input"
            />
          </Form.Item>
          <Form.Item
            label="端口"
            name="port"
            rules={[{ required: true, message: '请输入端口号' }]}
          >
            <InputNumber placeholder="587" className="chatgpt-input" />
          </Form.Item>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              allowClear
              placeholder="xxx@qq.com"
              className="chatgpt-input"
            />
          </Form.Item>
          <Form.Item
            label="授权码"
            name="password"
            rules={[{ required: true, message: '请输入授权码' }]}
          >
            <Input.Password
              allowClear
              placeholder="授权码"
              className="chatgpt-input"
            />
          </Form.Item>
          <Form.Item
            label="来源邮箱"
            name="from_email"
            rules={[{ required: true, message: '请输入来源邮箱' }]}
          >
            <Input
              allowClear
              placeholder="xxx@qq.com"
              className="chatgpt-input"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// 删除原来的 DesktopNavbar 组件，功能已整合到 FloatButtons 中
export default FloatButtons
