import { useState, useEffect } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import ThemeContext from '@/context/ThemeContext'

export default function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [dark, setDark] = useState(() => {
    return (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <ConfigProvider
        theme={{
          algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
