import React from 'react'

const Loading: React.FC = () => (
  <div className="flex flex-col items-center justify-center size-full bg-gradient-to-br from-blue-100 via-white to-purple-100">
    <div className="flex items-center justify-center mb-6">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <h2 className="text-xl font-semibold text-gray-700 mb-2">页面加载中</h2>
    <p className="text-gray-400 text-sm">请稍候，精彩内容马上呈现...</p>
  </div>
)

export default Loading
