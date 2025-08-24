import {
  apiBotPackagesGitPackageUpdate,
  apiBotPackagesInfo,
  BotPackages
} from '@/api'
import { message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { getBotName, getGitPackageName } from '../../core'
import Box from '@/commom/layout/Box'
import JSONEdit from '@/commom/edit/JSONEdit'
import { FileTextOutlined } from '@ant-design/icons'

const GitPackage = () => {
  const [pkgData, setPkgData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const initBotPackage = (name: string) => {
    const pkgName = getGitPackageName()
    apiBotPackagesInfo({
      name,
      app_name: pkgName
    }).then((res: BotPackages) => {
      if (res.pkg) {
        setPkgData(res.pkg)
      }
    })
  }
  /**
   * @param _name
   * @param value
   * @returns
   */
  const onSave = (_name: string, value: string) => {
    if (isLoading) {
      message.warning('正在加载中，请稍后')
      return
    }
    setIsLoading(true)
    const name = getBotName()
    const pkgName = getGitPackageName()
    apiBotPackagesGitPackageUpdate({
      name: name,
      app_name: pkgName,
      content: value
    })
      .then(() => {
        message.success('保存成功')
      })
      .catch(() => {
        message.error('保存失败，请重试')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    const name = getBotName()
    initBotPackage(name)
  }, [])

  return (
    <Box>
      <div className="p-6 flex-1 flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        <div className="flex-1 flex flex-col">
          {/* 页面标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileTextOutlined className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                包配置
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-13">
              编辑扩展的 package.json 配置文件
            </p>
          </div>

          {/* 编辑器区域 */}
          <div className="flex-1 min-h-0">
            <Spin
              spinning={isLoading}
              tip={
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-600 dark:text-blue-400">
                    正在保存配置...
                  </span>
                </div>
              }
            >
              <div className="h-full">
                <JSONEdit
                  onSave={onSave}
                  disabledName
                  name="package.json"
                  value={pkgData}
                />
              </div>
            </Spin>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default GitPackage
