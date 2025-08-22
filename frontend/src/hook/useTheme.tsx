import ThemeContext from '@/context/ThemeContext'
import { useContext } from 'react'
function useTheme() {
  return useContext(ThemeContext)
}
export default useTheme
