import { useState } from 'react'
import { apiBotCreate } from '../../../api'
import { Button, Form, Input, message } from 'antd'
import { Modal } from 'antd'
import { useCommon } from '@/hook/useCommon'

const Headings = ({
  onUpdate,
  onClick
}: {
  onUpdate: () => void
  onClick?: (key: string) => void
}) => {
  const [visible, setVisible] = useState(false)
  const [common] = useCommon()
  const info = common.info

  /**
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // fetch data
    const name = values.botname
    // 英文，数字，下划线
    const reg = /^[a-zA-Z0-9_]+$/
    if (!reg.test(name)) {
      message.error('机器人名称只能包含英文，数字，下划线')
      return
    }
    apiBotCreate({
      name
    }).then(() => {
      setVisible(false)
      onUpdate()
    })
  }

  const minVersion = 20
  const [form] = Form.useForm()

  return (
    <header className="flex justify-between items-center gap-4 ">
      {/* 左侧信息区域 */}
      <div className="flex-1 flex gap-2 sm:gap-6 flex-col lg:flex-row">
        {/* NodeJS 版本信息 */}
        <div className="flex items-center text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <svg
              className="w-5 h-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z"
                clipRule="evenodd"
              />
              <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              NodeJS {info.node.installed ? info.node.version : '未安装'}
            </span>
            {info.node.installed &&
              parseInt(info.node.version.split('v')[1].split('.')[0]) <
                minVersion && (
                <span
                  className="ml-2 text-red-500 border border-red-300 dark:border-red-600 px-2 py-1 rounded-md cursor-pointer text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    if (onClick) {
                      onClick('node')
                    }
                  }}
                >
                  版本过低
                </span>
              )}
          </div>
        </div>

        {/* 启动时间信息 */}
        <div className="flex items-center text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <svg
              className="w-5 h-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {info.start_at}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧新建按钮 */}
      <Button
        type="primary"
        onClick={() => {
          setVisible(true)
        }}
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
        新建机器人
      </Button>

      {/* 创建机器人模态框 */}
      <Modal
        open={visible}
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
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
            <span className="gradient-text font-semibold">创建机器人</span>
          </div>
        }
        onOk={() => {
          form.submit()
        }}
        onCancel={() => {
          setVisible(false)
        }}
        okText="创建"
        cancelText="取消"
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
      >
        <Form form={form} onFinish={onSubmit} className="mt-4">
          <Form.Item
            name="botname"
            label="机器人名称"
            rules={[
              {
                required: true,
                message: '请输入机器人名称'
              },
              {
                message: '机器人名称只能包含字母、数字、下划线、短横线',
                pattern: /^[a-zA-Z0-9_-]+$/
              }
            ]}
          >
            <Input
              placeholder="请输入机器人名称"
              className="chatgpt-input"
              prefix={
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </header>
  )
}

export default Headings
