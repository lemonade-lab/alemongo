import { Button } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

// 生成结果组件
const OutputSection = ({
  output,
  onCopy
}: {
  output: string
  onCopy: () => void
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-md transition-colors shadow">
      <div className="flex justify-end items-center p-2">
        <div className="flex gap-4">
          <Button id="copyButton" onClick={onCopy} type="primary">
            <CopyOutlined />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex shadow-inner overflow-auto">
        <textarea
          className="min-h-60 flex-1 outline-none resize-none border-t border-gray-200 dark:border-zinc-700 rounded-b-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 p-2 transition-colors"
          value={output}
          readOnly
        />
      </div>
    </div>
  )
}

export default OutputSection
