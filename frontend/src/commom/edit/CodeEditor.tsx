import React, { useEffect, useRef, useMemo } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'

export type Language = 'yaml' | 'json' | 'env'

interface CodeEditorProps {
  value: string
  language?: Language
  onChange?: (value: string) => void
  theme?: 'light' | 'dark'
  height?: string
  readOnly?: boolean
  disabled?: boolean
  onSave?: () => void
  width?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language = 'yaml',
  onChange,
  theme = 'light',
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)

  // 保持 onChange 引用最新
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // 创建编辑器扩展
  const extensions = useMemo(() => {
    // 获取语言扩展
    const getLanguageExtension = (lang: Language) => {
      switch (lang) {
        case 'json':
          return json()
        case 'yaml':
          return yaml()
        case 'env':
          return []
        default:
          return []
      }
    }

    const exts = [
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
      EditorView.editable.of(!readOnly),
      theme === 'dark' ? githubDark : githubLight
    ]

    // 添加语言扩展
    const langExt = getLanguageExtension(language)
    if (langExt) exts.push(langExt)

    // 添加内容变化监听
    exts.push(
      EditorView.updateListener.of(update => {
        if (update.docChanged && onChangeRef.current) {
          const newValue = update.state.doc.toString()
          onChangeRef.current(newValue)
        }
      })
    )

    return exts
  }, [language, theme, readOnly])

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions
    })

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensions])

  // 更新内容
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      })
    }
  }, [value])

  return <div ref={editorRef} className="code-editor" />
}

export default CodeEditor
