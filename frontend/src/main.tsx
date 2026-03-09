import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import '@/assets/css/index.scss'
import router from './router'

dayjs.extend(weekday)
dayjs.extend(localeData)
import { Provider } from 'react-redux'
import store from './redux/index'
import { RouterProvider } from 'react-router-dom'
import ThemeProvider from './provider/ThemeProvider'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)

declare global {
  interface Window {
    socket: WebSocket | null
    vscode: {
      postMessage: (message: any) => void
    }
  }
}
