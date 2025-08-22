import { useState, useEffect, useCallback } from 'react'

/**
 * 主题自适应 Hook，返回 Monaco Editor 需要的 theme 名称
 * 页面 <html> 标签 class="dark" 时返回 "vs-dark"，否则 "light"
 */
const useCodeTheme = () => {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
  )
  const handleClassChange = useCallback(() => {
    setTheme(
      document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
    )
  }, [])
  useEffect(() => {
    const observer = new MutationObserver(handleClassChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    // 首次同步
    handleClassChange()
    return () => observer.disconnect()
  }, [handleClassChange])
  return theme
}

export default useCodeTheme
