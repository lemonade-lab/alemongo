import Box from '@/commom/layout/Box'
import SettingsTabs from './components/SettingsTabs'

/**
 * Chat风格的设置页面
 * @returns
 */
const Settings = () => {
  return (
    <Box>
      <div className="flex flex-1 flex-col gap-8 items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-w-4xl mx-auto w-full">
        {/* 设置选项卡 */}
        <SettingsTabs />

        {/* 底部装饰 */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </Box>
  )
}

export default Settings
