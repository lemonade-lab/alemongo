import { useEffect, useState } from 'react'
import { apiBotPackagesInfo, BotPackages } from '@/api'
import { Tag } from 'antd'
import Box from '@/commom/layout/Box'
import { getBotName, getGitPackageName } from '../../core'
import Markdown from '@/components/Markdown'
import dayjs from 'dayjs'
import {
  InfoCircleOutlined,
  TagOutlined,
  BranchesOutlined,
  CalendarOutlined
} from '@ant-design/icons'

const PackagesMessage = () => {
  const [item, setItem] = useState<BotPackages | null>(null)
  const pkgJSON = JSON.parse(item?.pkg || '{}')

  /**
   * 初始化
   * @param name
   */
  const initPKGNames = (name: string) => {
    const pkaName = getGitPackageName()
    apiBotPackagesInfo({
      name,
      app_name: pkaName
    }).then(res => {
      setItem(res)
    })
  }

  useEffect(() => {
    const name = getBotName()
    initPKGNames(name)
  }, [])

  return (
    <Box>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300">
        <div className="mb-6">
          {/* 基本信息标签 */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TagOutlined className="text-blue-500" />
              <Tag
                color="blue"
                className="text-sm font-medium px-3 py-1 rounded-lg"
              >
                {pkgJSON['name'] || '未知扩展'}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <InfoCircleOutlined className="text-geekblue-500" />
              <Tag
                color="geekblue"
                className="text-sm font-medium px-3 py-1 rounded-lg"
              >
                {pkgJSON['description'] || '暂无描述'}
              </Tag>
            </div>
          </div>

          {/* 版本和分支信息 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TagOutlined className="text-purple-500" />
              <Tag
                color="purple"
                className="text-sm font-medium px-3 py-1 rounded-lg"
              >
                v{pkgJSON['version'] || '1.0.0'}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <BranchesOutlined className="text-cyan-500" />
              <Tag
                color="cyan"
                className="text-sm font-medium px-3 py-1 rounded-lg"
              >
                {item?.git.branch || 'main'}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-500" />
              <Tag
                color="default"
                className="text-sm font-medium px-3 py-1 rounded-lg"
              >
                {item?.git.date
                  ? dayjs(item.git.date).format('YYYY-MM-DD HH:mm:ss')
                  : '未知时间'}
              </Tag>
            </div>
          </div>
        </div>

        {/* Markdown 内容区域 */}
        <div className="flex-1 min-h-0">
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 dark:border-zinc-700/50 shadow-md">
            {item?.md ? (
              <Markdown source={item.md} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full flex items-center justify-center mb-4">
                  <InfoCircleOutlined className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  暂无说明文档
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                  该扩展暂未提供说明文档
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  )
}

export default PackagesMessage
