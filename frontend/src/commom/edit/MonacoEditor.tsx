import MonacoEditorReact, { EditorProps, loader } from '@monaco-editor/react'
import { useEffect } from 'react'
import { createMonacoChineseConfig } from './monacoI18n'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
try {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }
  loader.config({ monaco })
  loader.init()
} catch (e) {
  console.error('MonacoEnvironment配置失败', e)
}

const MonacoEditor = (
  props: EditorProps & {
    disabled?: boolean
    onSave: () => void
  }
) => {
  const {
    disabled = false,
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
  const monacoConfig = createMonacoChineseConfig(
    language ?? 'text',
    theme ?? ''
  )

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
      loading={<div></div>}
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
