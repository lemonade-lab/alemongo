import { Button, Input, message } from 'antd'
import { lazy, useEffect, useState, useCallback } from 'react'
import useCodeTheme from '@/hook/useCodeTheme'
import { SaveOutlined } from '@ant-design/icons'
import { Language } from './CodeEditor'
// 懒加载
const Editor = lazy(() => import('./CodeEditor'))

const FileEdit = ({
  name,
  value,
  onSave,
  disableName = false,
  language = 'env'
}: {
  name?: string
  value: string
  onSave: (name: string, value: string) => void
  disableName?: boolean
  language?: Language
}) => {
  const [fileData, setFileData] = useState<string>(value || '')
  const [inputValue, setInputValue] = useState<string>(name || '')
  const theme = useCodeTheme() as 'light' | 'dark'

  useEffect(() => {
    setFileData(value || '')
    if (name) {
      setInputValue(name)
    }
  }, [name, value])

  const handleCodeChange = useCallback((val: string | undefined) => {
    setFileData(val ?? '')
  }, [])

  const handleSave = () => {
    if (!inputValue) {
      message.error('文件名不能为空')
      return
    }
    onSave(inputValue, fileData)
  }

  return (
    <div className="w-full h-full flex flex-col border dark:border-zinc-700">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          {!disableName && (
            <Input
              value={inputValue}
              placeholder="文件名称"
              allowClear
              onChange={e => setInputValue(e.target.value)}
              style={{ width: 200 }}
            />
          )}
          {disableName && (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {name}
            </span>
          )}
        </div>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存
        </Button>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 min-h-0">
        <Editor
          value={fileData}
          language={language}
          height="100%"
          theme={theme}
          onChange={handleCodeChange}
        />
      </div>
    </div>
  )
}

export default FileEdit
