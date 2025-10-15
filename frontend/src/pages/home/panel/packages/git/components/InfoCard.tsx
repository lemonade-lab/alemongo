import { ReactNode } from 'react'

interface InfoCardProps {
  gradient?: string
  border?: string
  children: ReactNode
  className?: string
}

/**
 * 通用信息卡片组件
 * 统一的渐变背景和边框样式
 */
export const InfoCard = ({
  gradient = 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  border = 'border-blue-200/50 dark:border-blue-700/50',
  children,
  className = ''
}: InfoCardProps) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} border ${border} rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  )
}

// 预设的卡片样式
export const InfoCardPresets = {
  blue: {
    gradient:
      'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200/50 dark:border-blue-700/50'
  },
  green: {
    gradient:
      'from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20',
    border: 'border-emerald-200/50 dark:border-emerald-700/50'
  },
  yellow: {
    gradient: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200/60 dark:border-yellow-700/50'
  },
  orange: {
    gradient:
      'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    border: 'border-orange-200/50 dark:border-orange-700/50'
  }
}
