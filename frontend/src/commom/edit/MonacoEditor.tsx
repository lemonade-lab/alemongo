import MonacoEditorReact, { EditorProps } from '@monaco-editor/react'
import { createMonacoChineseConfig } from './monacoI18n'
import { useEffect } from 'react'

const MonacoEditor = (
  props: EditorProps & {
    disabled: boolean
    onSave: () => void
  }
) => {
  const {
    disabled,
    onSave,
    value,
    language,
    width,
    height,
    onChange,
    theme,
    ...rest
  } = props

  // 获取MonacoEditor稳定配置
  const monacoConfig = createMonacoChineseConfig(language, theme)

  // 添加全局快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检测 Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault() // 阻止浏览器默认保存行为
        if (!disabled) {
          onSave()
        }
      }
    }

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown)

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [disabled, onSave, value, language, width, height, onChange, theme])

  return (
    <MonacoEditorReact
      value={value}
      language={language}
      width={width}
      height={height}
      onChange={onChange}
      theme={theme}
      {...monacoConfig}
      {...rest}
    />
  )
}

export default MonacoEditor
