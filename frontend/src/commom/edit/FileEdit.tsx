import { Button, Input, message } from 'antd'
import { useEffect, useState } from 'react'
import MonacoEditor from './MonacoEditor'
import useCodeTheme from '@/hook/useCodeTheme'
import { SaveOutlined } from '@ant-design/icons'
import { createMonacoChineseConfig } from './monacoI18n'

const FileEdit = ({
  name,
  value,
  onSave,
  disableName = false
}: {
  name?: string
  value: string
  onSave: (name: string, value: string) => void
  disableName?: boolean
}) => {
  const [fileData, setFileData] = useState<string>(value || '')
  const [inputValue, setInputValue] = useState<string>(name || '')
  const theme = useCodeTheme()

  useEffect(() => {
    setFileData(value || '')
    if (name) {
      setInputValue(name)
    }
  }, [name, value])

  const handleCodeChange = (val: string | undefined) => {
    setFileData(val ?? '')
  }

  // 获取MonacoEditor稳定配置
  const monacoConfig = createMonacoChineseConfig('plaintext', theme)

  const handleSave = () => {
    if (!inputValue) {
      message.error('文件名不能为空')
      return
    }
    onSave(inputValue, fileData)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-700/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          {!disableName && (
            <div className="relative">
              <Input
                value={inputValue}
                placeholder="文件名称"
                allowClear
                onChange={e => setInputValue(e.target.value)}
                className="w-48 bg-white/70 dark:bg-zinc-800/70 border-gray-300/50 dark:border-zinc-600/50 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                style={{ minWidth: 120 }}
              />
            </div>
          )}
          {disableName && (
            <div className="px-4 py-2 bg-white/70 dark:bg-zinc-800/70 border border-gray-300/50 dark:border-zinc-600/50 rounded-lg min-w-[120px] inline-block">
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6"
          >
            保存
          </Button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-b-xl overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 p-2">
          <div className="flex-1 rounded-lg overflow-hidden border border-gray-200/50 dark:border-zinc-700/50 shadow-inner">
            <MonacoEditor
              disabled={false}
              onSave={() => {
                handleSave()
              }}
              value={fileData}
              language="plaintext"
              width="100%"
              height="100%"
              theme={theme}
              onChange={handleCodeChange}
              {...monacoConfig}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileEdit
