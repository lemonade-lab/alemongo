import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { menuItems } from './menuItems'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { ReactNode } from 'react'
import classNames from 'classnames'
import { hasPermission } from '@/utils/permission'

// 菜单项类型定义
interface MenuItemType {
  key: string
  icon: ReactNode
  label: string
  identity?: string
}

// 自定义菜单项组件
interface MenuItemProps {
  item: MenuItemType
  isSelected: boolean
  onClick: () => void
  isCollapsed?: boolean
  index: number
}

const MenuItem = ({
  item,
  isSelected,
  onClick,
  isCollapsed = false,
  index
}: MenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        relative group cursor-pointer  duration-500 ease-out touch-optimized
        ${isCollapsed ? 'w-12 h-12 mx-auto mb-3' : 'w-full h-12 mb-2 pr-8'}
        ${
          isSelected
            ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 border border-purple-400/60 shadow-lg shadow-purple-500/20 animate-selected-pulse'
            : 'hover:bg-white/15 border border-transparent hover:border-white/20'
        }
        rounded-xl backdrop-blur-sm transform hover:scale-105
        ${isPressed ? 'scale-95' : ''}
        animate-fadeIn
        mobile-touch-feedback
      `}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
      title={isCollapsed ? item.label : undefined}
    >
      {/* 选中状态的光晕效果 */}
      {isSelected && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-xl animate-ping"></div>
        </>
      )}

      {/* 悬停时的光效 */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-xl 
         duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}
      ></div>

      {/* 内容容器 */}
      <div className="relative z-10 flex items-center h-full px-4">
        {/* 图标 */}
        <div
          className={`
          flex items-center justify-center  duration-300
          ${isSelected ? 'text-purple-300 scale-110' : 'text-gray-300 group-hover:text-white'}
          ${isCollapsed ? 'w-full' : 'w-6 h-6 mr-3'}
          ${isHovered ? 'transform rotate-12' : ''}
          ${isPressed ? 'animate-icon-rotate' : ''}
        `}
        >
          {item.icon}
        </div>

        {/* 标签文字 */}
        {!isCollapsed && (
          <span
            className={`
            font-medium  duration-300 whitespace-nowrap mobile-text-sm
            ${isSelected ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-white'}
            ${isHovered ? 'transform translate-x-1 animate-text-slide' : ''}
          `}
          >
            {item.label}
          </span>
        )}
      </div>

      {/* 选中指示器 */}
      {isSelected && !isCollapsed && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
      )}

      {/* 悬停时的边框动画 */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 rounded-xl border border-white/30 animate-pulse"></div>
      )}

      {/* 工具提示（折叠状态） */}
      {isCollapsed && isHovered && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50 animate-fadeIn">
          {item.label}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
      )}
    </div>
  )
}

// 自定义菜单组件
interface CustomMenuProps {
  items: MenuItemType[]
  selectedKeys: string[]
  onSelect: (key: string) => void
  collapsed?: boolean
}

const CustomMenu = ({
  items,
  selectedKeys,
  onSelect,
  collapsed = false
}: CustomMenuProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* 菜单标题 */}
      {!collapsed && (
        <div className="mb-6 px-4">
          <h2 className="text-white/80 text-sm font-medium uppercase tracking-wider mobile-text-xs">
            ALEMONGO
          </h2>
          <div className="mt-2 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
        </div>
      )}
      {/* 菜单项 */}
      <div className="flex-1 mobile-scroll">
        {items.map((item, index) => (
          <MenuItem
            key={item.key}
            item={item}
            isSelected={selectedKeys.includes(item.key)}
            onClick={() => onSelect(item.key)}
            isCollapsed={collapsed}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Chat风格的现代化侧边栏菜单
 * @returns
 */
const SiderMenu = ({
  onMobileItemClick
}: {
  onMobileItemClick?: () => void
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['/'])

  useEffect(() => {
    const path = location.pathname
    const menuItem = menuItems.find(item => item?.key === path)
    if (menuItem?.key && typeof menuItem?.key === 'string') {
      setSelectedKeys([menuItem.key])
    } else {
      setSelectedKeys([])
    }
  }, [location])

  const storeMe = useSelector((state: RootState) => state.me)
  // 过滤得到 item - 使用新的权限判断逻辑
  const curMenuItems = menuItems.filter(item => {
    if (item?.identity) {
      // 使用权限工具函数进行判断
      return hasPermission(storeMe.info.identity, item.identity)
    }
    return true
  })

  const handleMenuSelect = (key: string) => {
    navigate(key)
    // 如果是移动端，点击后关闭侧边栏
    if (onMobileItemClick) {
      onMobileItemClick()
    }
  }

  return (
    <div className="relative h-full px-2 mobile-p-3">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700/95 to-gray-800/95 dark:from-zinc-800/95 dark:to-zinc-900/95 backdrop-blur-xl border-r border-white/10 dark:border-gray-700/20"></div>

      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

      {/* 菜单内容 */}
      <div className={classNames('relative z-10 h-full pb-4 pt-4', {})}>
        <CustomMenu
          items={curMenuItems}
          selectedKeys={selectedKeys}
          onSelect={handleMenuSelect}
        />
      </div>
    </div>
  )
}

export default SiderMenu
