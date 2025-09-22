import React, { useState } from 'react'
import { message } from 'antd'
import { apiResetTemplate } from '@/api/settings/template'

interface SystemInfoProps {
  className?: string
}

const SystemInfo: React.FC<SystemInfoProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)

  const onResetTemplate = () => {
    if (loading) {
      return
    }
    setLoading(true)
    apiResetTemplate()
      .then(() => {
        message.success('模板重置成功')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 重置模板区域 */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl px-6 py-4 shadow-lg border border-red-200/50 dark:border-red-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
              ⚠️
            </div>
            <div>
              <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                重置模板
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                用于替换旧版本的基础机器人模板
              </div>
            </div>
          </div>
          <button
            onClick={onResetTemplate}
            disabled={loading}
            className="chatgpt-button bg-gradient-to-r from-red-500 to-pink-500 border-none hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 text-white font-semibold rounded-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                重置中...
              </div>
            ) : (
              '重置模板'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemInfo
