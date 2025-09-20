import { EditorProps } from '@monaco-editor/react'

export const baseOptions: EditorProps['options'] = {
  // 编辑器外观
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineHeight: 20,
  wordWrap: 'on',
  automaticLayout: true,

  // 智能提示
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  parameterHints: { enabled: true },
  hover: { enabled: true },

  // 代码折叠
  folding: true,
  foldingStrategy: 'indentation',

  // 行号
  lineNumbers: 'on',

  // 选择
  selectOnLineNumbers: true,

  // 光标
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',

  // 缩进
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,

  // 括号匹配
  bracketPairColorization: { enabled: true },

  // 自动保存
  autoSave: 'off',

  // 只读模式
  readOnly: false,

  // 右键菜单
  contextmenu: true,

  // 状态栏
  renderLineHighlight: 'all',

  // 选择
  multiCursorModifier: 'alt',

  // 搜索
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'never'
  }
}

// 创建MonacoEditor配置
export const createMonacoChineseConfig = (
  language: string,
  theme: string
): EditorProps => {
  return {
    beforeMount: monaco => {
      // 配置编辑器主题
      monaco.editor.defineTheme('zh-theme', {
        base: theme === 'vs-dark' ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [],
        colors: {}
      })
    },
    onMount: (editor, monaco) => {
      // 设置编辑器语言
      monaco.editor.setModelLanguage(editor.getModel(), language)

      // 配置编辑器选项
      editor.updateOptions({
        ...baseOptions,
        language,
        theme: theme === 'vs-dark' ? 'vs-dark' : 'vs'
      })

      // 添加中文右键菜单（增强版本）
      try {
        const addAction = (
          id: string,
          label: string,
          action: string,
          group: string
        ) => {
          editor.addAction({
            id,
            label,
            contextMenuGroupId: group,
            run: ed => {
              ed.trigger('keyboard', action, {})
            }
          })
        }

        addAction('zh-undo', '撤销', 'undo', '1_modification')
        addAction(
          'zh-cut',
          '剪切',
          'editor.action.clipboardCutAction',
          '1_modification'
        )
        addAction(
          'zh-copy',
          '复制',
          'editor.action.clipboardCopyAction',
          '1_modification'
        )
        addAction(
          'zh-paste',
          '粘贴',
          'editor.action.clipboardPasteAction',
          '1_modification'
        )
        addAction(
          'zh-select-all',
          '全选',
          'editor.action.selectAll',
          '9_cutcopypaste'
        )
        addAction('zh-redo', '重做', 'redo', '1_modification')

        // 查找替换
        addAction('zh-find', '查找', 'actions.find', '4_find')
        addAction(
          'zh-replace',
          '替换',
          'editor.action.startFindReplaceAction',
          '4_find'
        )
        addAction(
          'zh-find-next',
          '查找下一个',
          'editor.action.nextMatchFindAction',
          '4_find'
        )
        addAction(
          'zh-find-prev',
          '查找上一个',
          'editor.action.previousMatchFindAction',
          '4_find'
        )

        // 格式化
        addAction(
          'zh-format',
          '格式化文档',
          'editor.action.formatDocument',
          '6_cc'
        )
        addAction(
          'zh-format-selection',
          '格式化选中内容',
          'editor.action.formatSelection',
          '6_cc'
        )

        // 代码操作
        addAction('zh-indent', '增加缩进', 'editor.action.indentLines', '2_cc')
        addAction(
          'zh-outdent',
          '减少缩进',
          'editor.action.outdentLines',
          '2_cc'
        )
        addAction(
          'zh-move-line-up',
          '向上移动行',
          'editor.action.moveLinesUpAction',
          '2_cc'
        )
        addAction(
          'zh-move-line-down',
          '向下移动行',
          'editor.action.moveLinesDownAction',
          '2_cc'
        )
        addAction(
          'zh-copy-line-up',
          '向上复制行',
          'editor.action.copyLinesUpAction',
          '2_cc'
        )
        addAction(
          'zh-copy-line-down',
          '向下复制行',
          'editor.action.copyLinesDownAction',
          '2_cc'
        )
        addAction(
          'zh-delete-line',
          '删除行',
          'editor.action.deleteLines',
          '2_cc'
        )
        addAction(
          'zh-insert-line-below',
          '在下方插入行',
          'editor.action.insertLineAfter',
          '2_cc'
        )
        addAction(
          'zh-insert-line-above',
          '在上方插入行',
          'editor.action.insertLineBefore',
          '2_cc'
        )
      } catch (error) {
        console.warn('MonacoEditor中文菜单配置失败:', error)
      }
    },

    options: {
      ...baseOptions,
      language,
      theme: theme === 'vs-dark' ? 'vs-dark' : 'vs'
    }
  }
}
