import { useState, useEffect } from 'react'

/**
 * 移动端检测和处理的 Hook
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setScreenSize({ width, height })
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1024)
    }

    // 初始检查
    checkScreenSize()

    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize)

    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(checkScreenSize, 100)
    })

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      window.removeEventListener('orientationchange', checkScreenSize)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    // 移动端断点检查
    isMobileS: screenSize.width <= 375,
    isMobileM: screenSize.width > 375 && screenSize.width <= 425,
    isMobileL: screenSize.width > 425 && screenSize.width <= 768,
    // 横屏检测
    isLandscape: screenSize.width > screenSize.height,
    // 安全区域检测
    hasSafeArea:
      typeof window !== 'undefined' &&
      'CSS' in window &&
      'supports' in window.CSS &&
      window.CSS.supports('padding-top: env(safe-area-inset-top)')
  }
}

/**
 * 移动端触摸反馈 Hook
 */
export const useTouchFeedback = () => {
  const [isPressed, setIsPressed] = useState(false)

  const touchHandlers = {
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    onTouchCancel: () => setIsPressed(false)
  }

  return {
    isPressed,
    touchHandlers,
    touchClassName: isPressed ? 'scale-95 opacity-80' : ''
  }
}

/**
 * 移动端滚动优化 Hook
 */
export const useMobileScroll = () => {
  useEffect(() => {
    // 防止移动端滚动时的弹性效果
    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.scrollTop === 0 && e.touches[0].clientY > 0) {
        e.preventDefault()
      }
      if (
        target.scrollTop + target.clientHeight >= target.scrollHeight &&
        e.touches[0].clientY < 0
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', preventOverscroll, {
      passive: false
    })

    return () => {
      document.removeEventListener('touchmove', preventOverscroll)
    }
  }, [])
}

/**
 * 移动端键盘处理 Hook
 */
export const useMobileKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight
      const width = window.innerWidth

      // 简单的键盘检测逻辑
      if (height < width * 0.8) {
        setKeyboardVisible(true)
      } else {
        setKeyboardVisible(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    keyboardVisible
  }
}
