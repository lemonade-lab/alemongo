import { useEffect, useState } from 'react'
import {
  apiBotConfig,
  apiBotConfigUpdate,
  apiBotInfo,
  apiBotPackageClone,
  apiBotPackagesList,
  apiBotPackagesPull,
  apiBotPackagesPullForce,
  BotInfo,
  BotPackages
} from '@/api'
import {
  Button,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag
} from 'antd'
import { getBotName } from '../core'
import Box from '@/commom/layout/Box'
import { useNavigate } from 'react-router-dom'
import YAML from 'js-yaml'
import { updateYamlAppsPreserveComments } from '@/utils/yaml'
import {
  DownOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { showLog } from '@/redux/logs'

const Panel = () => {
  const [pkgs, setPkgs] = useState<BotPackages[]>([])
  const [info, setInfo] = useState<BotInfo>({
    name: '',
    status: 0,
    pid: 0,
    node_modules: false,
    create_at: '',
    port: 0
  })
  const [config, setConfig] = useState<{ apps: string[] }>({
    apps: []
  })
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!visible) {
      return
    }
    form.setFieldsValue({
      url: '',
      branch: 'release'
    })
  }, [form, visible])

  const initBotConfig = (name: string) => {
    apiBotConfig({
      name: name
    }).then(res => {
      const data = YAML.load(res) as { apps: string[] }
      if (!Array.isArray(data.apps)) {
        data.apps = []
      }
      setConfig(data)
    })
  }
  const initBotInfo = (name: string) => {
    apiBotInfo({ name }).then(res => {
      setInfo(res)
    })
  }
  const initPKGNames = (name: string) => {
    apiBotPackagesList({ name }).then(res => {
      setPkgs(res)
    })
  }

  useEffect(() => {
    const name = getBotName()
    initBotInfo(name)
    initPKGNames(name)
    initBotConfig(name)
  }, [])

  // 强制安装
  const onForceFinish = (values: { url: string; branch: string }) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500" />
          <span className="font-semibold">强制安装</span>
        </div>
      ),
      content: '确定进行强制安装吗，将会放弃本地所有修改?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setIsLoading(true)
        apiBotPackageClone({
          name: info.name,
          repo_url: values.url,
          branch_name: values.branch,
          force: '1'
        })
          .then(() => {
            initPKGNames(info.name)
            message.success('强制安装成功')
          })
          .finally(() => {
            setIsLoading(false)
          })
      },
      onCancel: () => {
        setVisible(false)
      },
      className: 'dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl'
    })
  }

  const onFinish = (values: { url: string; branch: string }) => {
    if (isLoading) return
    setIsLoading(true)
    apiBotPackageClone({
      name: info.name,
      repo_url: values.url,
      branch_name: values.branch
    })
      .then(() => {
        initPKGNames(info.name)
        message.success('扩展安装成功')
      })
      .catch(res => {
        if (res.code === 2001) {
          onForceFinish(values)
        }
      })
      .finally(() => {
        setIsLoading(false)
        setVisible(false)
      })
  }

  const onUpdate = (item: BotPackages | null) => {
    if (!item || isLoading) return
    setIsLoading(true)
    apiBotPackagesPull({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch
    })
      .then(() => {
        message.success('更新成功')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onForceUpdate = (item: BotPackages | null) => {
    if (!item || isLoading) return
    setIsLoading(true)
    apiBotPackagesPullForce({
      name: info.name,
      repo_name: item.name,
      branch_name: item.git.branch
    })
      .then(() => {
        message.success('强制更新成功')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  /**
   *
   * @param name
   */
  const onStart = (name: string) => {
    if (isLoadingStatus) return
    setIsLoadingStatus(true)
    if (!config.apps.includes(name)) {
      apiBotConfig({ name: info.name })
        .then(res => {
          const result = updateYamlAppsPreserveComments(res || '', name, true)
          return apiBotConfigUpdate({
            name: info.name,
            content: result.content
          })
        })
        .then(() => {
          setConfig(prev => ({
            ...prev,
            apps: [...prev.apps, name]
          }))
          message.success('扩展启用成功')
        })
        .finally(() => {
          setIsLoadingStatus(false)
        })
    } else {
      message.warning('该扩展已启用')
      setIsLoadingStatus(false)
      return
    }
  }

  /**
   *
   * @param name
   */
  const onStop = (name: string) => {
    if (isLoadingStatus) return
    setIsLoadingStatus(true)
    if (config.apps.includes(name)) {
      apiBotConfig({ name: info.name })
        .then(res => {
          const result = updateYamlAppsPreserveComments(res || '', name, false)
          return apiBotConfigUpdate({
            name: info.name,
            content: result.content
          })
        })
        .then(() => {
          setConfig(prev => ({
            ...prev,
            apps: prev.apps.filter(item => item !== name)
          }))
          message.success('扩展停用成功')
        })
        .finally(() => {
          setIsLoadingStatus(false)
        })
    } else {
      message.warning('该扩展未启用')
      setIsLoadingStatus(false)
      return
    }
  }

  return (
    <Box>
      <div className="flex-1 gap-4 flex flex-col bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300">
        {/* 顶部操作栏 */}
        <div className="flex justify-end items-center mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setVisible(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6"
          >
            新增扩展
          </Button>
        </div>

        {/* 扩展列表 */}
        <div className="flex-1 overflow-auto h-[calc(100vh-22rem)] xl:h-[calc(100vh/2-22rem)]">
          {pkgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full flex items-center justify-center mb-4">
                <AppstoreOutlined className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                暂无扩展
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                点击上方按钮添加您的第一个扩展
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pkgs.map(item => {
                const pkgJSON = JSON.parse(item.pkg)
                const pkgName = pkgJSON['name']
                const isStart = config.apps.includes(pkgName)
                return (
                  <div
                    key={item.name}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={e => {
                      e.stopPropagation()
                      navigate(`/bots/${getBotName()}/packages/${item.name}`)
                    }}
                  >
                    <div className="flex flex-col xl:flex-row gap-4 justify-between">
                      <div className="flex flex-row items-center flex-wrap gap-3">
                        <Tag
                          color="blue"
                          className="text-sm font-medium px-3 py-1 rounded-lg"
                        >
                          dir: {item.name}
                        </Tag>
                        <Tag
                          color="blue"
                          className="text-sm font-medium px-3 py-1 rounded-lg"
                        >
                          {pkgName}
                        </Tag>
                        <Tag
                          color="geekblue"
                          className="text-sm font-medium px-3 py-1 rounded-lg"
                        >
                          {pkgJSON['description']}
                        </Tag>
                        {
                          // 版本
                          <Tag
                            color="geekblue"
                            className="text-sm font-medium px-3 py-1 rounded-lg"
                          >
                            v{pkgJSON['version']}
                          </Tag>
                        }
                        {isStart ? (
                          <Tag
                            color="green"
                            className="text-sm font-medium px-3 py-1 rounded-lg"
                          >
                            已启用
                          </Tag>
                        ) : (
                          <Tag
                            color="red"
                            className="text-sm font-medium px-3 py-1 rounded-lg"
                          >
                            未启用
                          </Tag>
                        )}
                      </div>

                      {/* sm 以下：仅显示更多按钮 */}
                      <div
                        className="sm:hidden w-full flex justify-end"
                        onClick={e => e.stopPropagation()}
                      >
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'start',
                                label: !isStart ? '启用' : '停用',
                                icon: !isStart ? (
                                  <PlayCircleOutlined />
                                ) : (
                                  <PauseCircleOutlined />
                                ),
                                onClick: () => {
                                  if (isStart) {
                                    onStop(pkgName)
                                    return
                                  }
                                  onStart(pkgName)
                                }
                              },
                              {
                                key: 'update',
                                label: '更新',
                                icon: <SyncOutlined />,
                                onClick: () => {
                                  dispatch(showLog())
                                  onUpdate(item)
                                }
                              },
                              {
                                key: 'forceUpdate',
                                label: '强制更新',
                                icon: <ExclamationCircleOutlined />,
                                onClick: () => {
                                  dispatch(showLog())
                                  onForceUpdate(item)
                                }
                              }
                            ]
                          }}
                          trigger={['click']}
                        >
                          <Button
                            size="small"
                            type="text"
                            className="hover:bg-gray-100 dark:hover:bg-zinc-700"
                          >
                            <Space>
                              更多
                              <DownOutlined />
                            </Space>
                          </Button>
                        </Dropdown>
                      </div>

                      <div
                        className="hidden sm:flex flex-row gap-3 flex-wrap items-center justify-end"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          loading={isLoadingStatus}
                          icon={
                            !isStart ? (
                              <PlayCircleOutlined />
                            ) : (
                              <PauseCircleOutlined />
                            )
                          }
                          onClick={() => {
                            if (isStart) {
                              onStop(pkgName)
                              return
                            }
                            onStart(pkgName)
                          }}
                          className={
                            !isStart
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg'
                              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg'
                          }
                        >
                          {!isStart ? '启用' : '停用'}
                        </Button>
                        <Button
                          icon={<SyncOutlined />}
                          onClick={() => {
                            dispatch(showLog())
                            onUpdate(item)
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                        >
                          更新
                        </Button>
                        <div onClick={e => e.stopPropagation()}>
                          <Popconfirm
                            title={
                              <div className="flex items-center gap-2">
                                <ExclamationCircleOutlined className="text-orange-500" />
                                <span className="font-semibold">强制更新</span>
                              </div>
                            }
                            description="确定进行强制更新吗，将会放弃本地所有修改?"
                            onConfirm={() => {
                              dispatch(showLog())
                              onForceUpdate(item)
                            }}
                            okText="确定"
                            cancelText="取消"
                            className="dark:[&>.ant-popover-content]:bg-zinc-900/95 backdrop-blur-xl"
                          >
                            <Button
                              type="primary"
                              icon={<ExclamationCircleOutlined />}
                              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                            >
                              强制更新
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 新增扩展模态框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-blue-500" />
            <span className="font-semibold">新增扩展</span>
          </div>
        }
        open={visible}
        confirmLoading={isLoading}
        onOk={() => {
          form.submit()
        }}
        onCancel={() => {
          setVisible(false)
        }}
        className="dark:[&>.ant-modal-content]:bg-zinc-900/95 backdrop-blur-xl"
        width="90%"
      >
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  Git 仓库地址
                </span>
              }
              name="url"
              rules={[{ required: true, message: '请输入Git仓库地址' }]}
            >
              <Input
                placeholder="git@github.com:xiuxianjs/xiuxian-bot.git"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  分支名称
                </span>
              }
              name="branch"
              rules={[{ required: true, message: '请输入分支名' }]}
            >
              <Input
                placeholder="release"
                className="bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Box>
  )
}

export default Panel
