import { Outlet } from 'react-router-dom'
import SiderMenu from './SiderMenu'
import { useState } from 'react'
import { Drawer, Button } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import FloatButtons from './FloatButtons'
import { useMobile } from '@/hook/useMobile'

/**
 * 移动端侧边栏抽屉组件
 */
const MobileSidebar = ({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) => {
  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            className="h-6 w-auto"
            src="me.png"
            alt="Alemongo"
          />
          <span className="text-white font-semibold mobile-text-sm">
            导航菜单
          </span>
        </div>
      }
      placement="left"
      onClose={onClose}
      open={open}
      width="280px"
      className="mobile-drawer dark:[&>.ant-drawer-content]:bg-gray-800/95 dark:[&>.ant-drawer-header]:bg-gray-800/95 backdrop-blur-xl"
      styles={{
        body: {
          padding: 0,
          background: 'transparent'
        },
        header: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'transparent',
          padding: '16px 20px'
        }
      }}
    >
      <div className="h-full mobile-safe-area">
        <SiderMenu onMobileItemClick={onClose} />
      </div>
    </Drawer>
  )
}

/**
 * 移动端顶部导航栏
 */
const MobileNavbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800/95 to-gray-900/95 dark:from-zinc-900/95 dark:to-black/95 backdrop-blur-xl border-b border-white/10 dark:border-gray-700/20 mobile-safe-area">
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        className="text-white hover:text-purple-300 hover:bg-white/10 mobile-button touch-optimized"
        size="large"
      />
      <div className="flex items-center gap-2">
        <img
          className="h-6 w-auto"
          src="me.png"
          alt="Alemongo"
        />
        <span className="text-white font-semibold mobile-text-sm">
          Alemongo
        </span>
      </div>
      <div className="w-10"></div> {/* 占位符，保持居中 */}
    </div>
  )
}

/**
 * Chat风格的主页面布局
 * @returns
 */
const Home = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { isMobile } = useMobile()

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false)
  }

  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(true)
  }

  return (
    <div className="flex h-full w-full">
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <aside className={`w-44 flex-shrink-0  duration-300 ease-in-out`}>
          <SiderMenu />
        </aside>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端顶部导航栏 */}
        {isMobile && <MobileNavbar onMenuClick={handleMobileMenuClick} />}

        {/* 内容输出区域 */}
        <div className="flex-1 overflow-hidden mobile-scroll">
          <Outlet />
        </div>
      </div>

      {/* 移动端侧边栏抽屉 */}
      {isMobile && (
        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={handleMobileSidebarClose}
        />
      )}

      <FloatButtons />
    </div>
  )
}

export default Home
