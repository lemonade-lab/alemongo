import { PropsWithChildren, Suspense, Component, ReactNode } from 'react'
import Loading from './Loading'

// 错误边界组件
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('动态导入错误:', error)
    console.error('错误信息:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              模块加载失败
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              抱歉，页面加载时出现了问题。请尝试刷新页面或联系管理员。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              刷新页面
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  查看错误详情{' '}
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      navigator.clipboard
                        .writeText(
                          `错误信息:\n${this.state.error?.message}\n\n堆栈信息:\n${this.state.error?.stack || '无'}`
                        )
                        .then(() => {
                          alert('错误信息已复制到剪贴板')
                        })
                        .catch(() => {
                          alert('复制失败，请手动复制')
                        })
                    }}
                  >
                    复制信息
                  </button>
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n堆栈信息:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const WithSuspense = ({ children }: PropsWithChildren) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
