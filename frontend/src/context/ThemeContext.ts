import { createContext } from 'react'

//未提供 "defaultValue" 的自变量。
const ThemeContext = createContext({
  dark: false,
  setDark: (dark: boolean) => {
    console.log(dark)
  }
})

export default ThemeContext
