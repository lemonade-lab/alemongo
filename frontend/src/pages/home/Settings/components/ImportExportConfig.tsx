import { useState } from 'react'
import { Upload, message, Modal, Switch } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { exportSettings, importSettings, type Setting } from '@/api/settings'

const ImportExportConfig = () => {
  const [loading, setLoading] = useState(false)
  const [overwrite, setOverwrite] = useState(false)

  // 导出配置
  const handleExport = async (category?: string) => {
    try {
      setLoading(true)
      const settings = await exportSettings(category)

      // 创建下载链接
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      // 触发下载
      const link = document.createElement('a')
      link.href = url
      const filename = category
        ? `alemongo_settings_${category}.json`
        : 'alemongo_settings_all.json'
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(`成功导出 ${settings.length} 个配置`)
    } catch (error) {
      console.error('导出配置失败:', error)
      message.error('导出配置失败')
    } finally {
      setLoading(false)
    }
  }

  // 导入配置
  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.json',
    showUploadList: false,
    beforeUpload: file => {
      const reader = new FileReader()

      reader.onload = async e => {
        try {
          setLoading(true)
          const content = e.target?.result as string
          const settings: Setting[] = JSON.parse(content)

          if (!Array.isArray(settings) || settings.length === 0) {
            message.error('配置文件格式错误或为空')
            return
          }

          Modal.confirm({
            title: '确认导入配置',
            content: (
              <div>
                <p>即将导入 {settings.length} 个配置项</p>
                <div className="mt-4">
                  <Switch
                    checked={overwrite}
                    onChange={setOverwrite}
                    checkedChildren="覆盖"
                    unCheckedChildren="跳过"
                  />
                  <span className="ml-2">
                    {overwrite ? '覆盖已存在的配置' : '跳过已存在的配置'}
                  </span>
                </div>
              </div>
            ),
            onOk: async () => {
              try {
                const result = await importSettings(settings, overwrite)
                message.success(
                  `导入完成！成功: ${result.imported}, 跳过: ${result.skipped}, 失败: ${result.failed}`
                )
                // 刷新页面或更新配置
                setTimeout(() => {
                  window.location.reload()
                }, 1500)
              } catch (error) {
                console.error('导入配置失败:', error)
                message.error('导入配置失败')
              }
            },
            onCancel: () => {
              setLoading(false)
            }
          })
        } catch (error) {
          console.error('解析配置文件失败:', error)
          message.error('配置文件格式错误')
          setLoading(false)
        }
      }

      reader.readAsText(file)
      return false // 阻止默认上传行为
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-lg flex gap-2 font-semibold text-gray-900 dark:text-white mb-4">
        配置导入导出
        <div className="flex gap-2 items-center justify-center">
          <button
            onClick={() => handleExport()}
            className="flex gap-2 justify-center items-center"
            disabled={loading}
          >
            <DownloadOutlined className="text-lg" />
            <span>导出全部配置</span>
          </button>
          {/* 导入配置 */}
          <Upload {...uploadProps}>
            <button
              className="flex gap-2 justify-center items-center"
              disabled={loading}
            >
              <UploadOutlined className="text-lg" />
              <span>导入配置</span>
            </button>
          </Upload>
        </div>
      </div>
      {/* 分类导出 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Bot 配置', value: 'bot_config' },
            { label: 'Email', value: 'email' },
            { label: 'GitHub', value: 'github' },
            { label: '系统设置', value: 'system' }
          ].map(category => (
            <button
              key={category.value}
              onClick={() => handleExport(category.value)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-medium mb-2">💡 使用说明：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>导出的配置为 JSON 格式，包含所有配置项</li>
          <li>导入时可选择覆盖或跳过已存在的配置</li>
          <li>导入后系统会自动重新加载配置</li>
          <li>建议定期导出配置作为备份</li>
        </ul>
      </div>
    </div>
  )
}

export default ImportExportConfig
