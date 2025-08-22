import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/assets/css/index.scss'
import router from './router'
import { Provider } from 'react-redux'
import store from './redux/index'
import '@ant-design/v5-patch-for-react-19'
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
