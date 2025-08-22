import { useNavigate } from 'react-router-dom'

const NotRoute = () => {
  const navigate = useNavigate()

  return (
    <main className="flex-1 grid place-items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-24 sm:py-32 lg:px-8  duration-300 relative overflow-hidden">
      {/* 主要内容 */}
      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in-up">
        <div className="chatgpt-card p-8 shadow-2xl">
          {/* 404图标 */}
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="text-6xl font-bold ">404</div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            该页面不存在
          </h1>

          {/* 描述 */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
            抱歉，我们无法找到您要查找的页面。
            <br />
            请检查URL是否正确，或返回首页继续浏览。
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="chatgpt-button px-8 py-3 text-base font-semibold flex "
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              回到首页
            </button>

            <button
              onClick={() => window.open('https://alemonjs.com', '_blank')}
              className="group flex items-center gap-2 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400  duration-200"
            >
              联系我们
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>

          {/* 装饰元素 */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotRoute
