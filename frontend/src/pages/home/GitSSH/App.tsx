import {
  ExclamationCircleOutlined,
  KeyOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  apiSSHAuthorize,
  apiSSHDelete,
  apiSSHGenerate,
  apiSSHList
} from '@/api/ssh'
import Box from '@/commom/layout/Box'

const Configs = () => {
  const navigate = useNavigate()
  const [sshNames, setSSHName] = useState<string[]>([])
  useEffect(() => {
    apiSSHList().then(res => {
      setSSHName(res)
    })
  }, [])

  const onDelete = (name: string) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">删除配置</span>
        </div>
      ),
      content: (
        <div className="mt-2">
          确定删除配置 <span className="text-red-600 font-medium">{name}</span>{' '}
          吗？
        </div>
      ),
      okType: 'danger',
      onOk: () => {
        apiSSHDelete({ name }).then(() => {
          setSSHName(prev => prev.filter(item => item !== name))
          message.success('配置删除成功')
        })
      },
      okText: '确认删除',
      cancelText: '取消',
      className: 'dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl'
    })
  }

  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = (values: any) => {
    if (loading) return
    setLoading(true)
    apiSSHGenerate(values)
      .then(() => {
        message.success('密钥生成成功')
        setOpen(false)
        form.resetFields()
        // 刷新
        apiSSHList().then(res => {
          setSSHName(res)
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onFinish = (values: any) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500" />
          <span className="font-semibold">确认生成密钥</span>
        </div>
      ),
      content: (
        <div className="mt-2">
          确定生成吗？若存在{' '}
          <span className="text-red-600 font-medium">{values.name}</span>{' '}
          将直接覆盖！！！
        </div>
      ),
      okType: 'primary',
      onOk: () => onSubmit(values),
      okText: '确认生成',
      cancelText: '取消',
      className: 'dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl'
    })
  }

  const [openAuthorize, setOpenAuthorize] = useState(false)
  const [formAuthorize] = Form.useForm()
  const [isLoadingAuthorize, setIsLoadingAuthorize] = useState(false)

  /**
   *
   * @param values
   */
  const onFinishAuthorize = (values: { address: string }) => {
    setIsLoadingAuthorize(true)
    apiSSHAuthorize(values)
      .then(() => {
        setOpenAuthorize(false)
        formAuthorize.resetFields()
        message.success('授权成功,请检查 known_hosts 文件')
      })
      .catch(error => {
        console.error('授权失败:', error)
        message.error('授权失败，请检查网络连接')
      })
      .finally(() => {
        setIsLoadingAuthorize(false)
      })
  }

  return (
    <Box>
      <div className="">
        <div className="flex gap-6 flex-col transition-colors">
          {/* 顶部操作栏 */}
          <div className="flex justify-end gap-3">
            <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={() => {
                setOpen(true)
                form.resetFields()
                form.setFieldsValue({
                  key_type: 'rsa',
                  bit_size: 2048,
                  name: 'id_rsa',
                  comment: 'your@gmail.com',
                  hash_algo: '',
                  key_format: ''
                })
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6"
            >
              生成密钥
            </Button>
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => {
                setOpenAuthorize(true)
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6"
            >
              授权
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/ssh/id_rsa.pub/update')}
              className="chatgpt-button px-6 py-2 text-base font-semibold"
              icon={
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              }
            >
              新增
            </Button>
          </div>

          {/* SSH 配置卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sshNames.map((name, index) => {
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 animate-fade-in-up hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/ssh/${name}`)}
                >
                  <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 rounded-xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {/* 配置图标 */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <KeyOutlined className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* 配置名称 */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-4 truncate">
                      {name}
                    </h3>

                    {/* 操作按钮 */}
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                      onClick={e => {
                        e.stopPropagation()
                        onDelete(name)
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 空状态 */}
          {sshNames.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full flex items-center justify-center mb-4">
                <KeyOutlined className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                暂无 SSH 配置
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                点击上方按钮创建您的第一个 SSH 密钥配置
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 生成密钥模态框 */}
      <Modal
        open={open}
        title={
          <div className="flex items-center gap-2">
            <KeyOutlined className="text-blue-500" />
            <span className="font-semibold">生成 SSH 密钥</span>
          </div>
        }
        onCancel={() => setOpen(false)}
        onOk={() => {
          form.submit()
        }}
        okText="确认生成"
        cancelText="取消"
        confirmLoading={loading}
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
        width="90%"
      >
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4 mb-4">
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              label="配置名"
              name="name"
              rules={[
                {
                  required: true,
                  message: '请输入配置名'
                },
                {
                  message: '配置名只能包含字母、数字、下划线',
                  pattern: /^[a-zA-Z0-9_]+$/
                }
              ]}
            >
              <Input
                placeholder="-f ~/.ssh/${name}"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
            <Form.Item
              label="密钥类型"
              name="key_type"
              rules={[{ required: true, message: '请选择密钥类型' }]}
            >
              <Select
                placeholder="请选择密钥类型"
                className="bg-white/70 dark:bg-zinc-800/70"
                options={[
                  { label: 'RSA', value: 'rsa' },
                  { label: 'ED25519', value: 'ed25519' },
                  { label: 'ECDSA', value: 'ecdsa' },
                  { label: 'DSA', value: 'dsa' },
                  { label: 'X25519', value: 'x25519' },
                  { label: 'X448', value: 'x448' },
                  { label: 'Curve25519', value: 'curve25519' },
                  { label: 'Curve448', value: 'curve448' }
                ]}
              />
            </Form.Item>
            <Form.Item
              label="密钥长度"
              name="bit_size"
              rules={[{ required: true, message: '请选择密钥长度' }]}
            >
              <Select
                placeholder="指定密钥长度(仅对rsa/dsa有效)"
                className="bg-white/70 dark:bg-zinc-800/70"
                options={[
                  { label: '1024', value: 1024 },
                  { label: '2048', value: 2048 },
                  { label: '4096', value: 4096 }
                ]}
              />
            </Form.Item>
            <Form.Item
              label="私钥密码"
              name="passphrase"
              rules={[{ message: '请输入私钥密码' }]}
            >
              <Input.Password
                placeholder="-N 设置私钥密钥"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
            <Form.Item
              label="指纹哈希算法"
              name="hash_algo"
              rules={[{ message: '请选择指纹哈希算法' }]}
            >
              <Select
                placeholder="-E 使用特定的哈希算法生成指纹"
                className="bg-white/70 dark:bg-zinc-800/70"
                options={[
                  { label: 'SHA-256', value: 'sha256' },
                  { label: 'SHA-1', value: 'sha1' },
                  { label: 'MD5', value: 'md5' }
                ]}
              />
            </Form.Item>
            <Form.Item
              label="密钥格式"
              name="key_format"
              rules={[{ message: '请选择密钥格式' }]}
            >
              <Select
                placeholder="-m 指定密钥格式：如PEM、EFC4716等"
                className="bg-white/70 dark:bg-zinc-800/70"
                options={[
                  { label: 'OpenSSH', value: 'OpenSSH' },
                  { label: 'PEM', value: 'PEM' },
                  { label: 'PKCS#8', value: 'PKCS8' },
                  { label: 'RFC4716', value: 'RFC4716' }
                ]}
              />
            </Form.Item>
            <Form.Item
              label="注释"
              name="comment"
              rules={[{ required: true, message: '请输入注释' }]}
            >
              <Input
                placeholder="-C 添加注释"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 授权模态框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-green-500" />
            <span className="font-semibold">SSH 授权</span>
          </div>
        }
        open={openAuthorize}
        loading={isLoadingAuthorize}
        onCancel={() => setOpenAuthorize(false)}
        onOk={() => {
          formAuthorize.submit()
        }}
        okText="确认授权"
        cancelText="取消"
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
      >
        <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-lg p-4">
          <Form
            form={formAuthorize}
            onFinish={onFinishAuthorize}
            layout="vertical"
          >
            <Form.Item
              label="授权地址"
              name="address"
              rules={[{ required: true, message: '请输入授权地址' }]}
            >
              <Input
                placeholder="github.com"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Box>
  )
}

export default Configs
