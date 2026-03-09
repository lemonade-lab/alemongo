import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiInfo } from '@/api'
import { setUserInfo } from '@/redux/me'
import LoginModal from '@/components/LoginModal'

const Main = () => {
  const me = useSelector((state: RootState) => state.me)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!me.login) {
      navigate('/login')
      return
    }
    if (!me.info.username) {
      apiInfo().then(res => dispatch(setUserInfo(res)))
    }
  }, [me, navigate, dispatch])

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  duration-300 overflow-hidden">
      {/* 主内容区域 */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* 主内容区域 */}
        <div className="relative z-10 flex-1 flex overflow-hidden w-full">
          <Outlet />
        </div>
      </main>
      {/* 会话过期登录弹窗 */}
      <LoginModal />
    </div>
  )
}

export default Main
