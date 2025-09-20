import { setUserInfo } from '@/redux/me'
import { useDispatch } from 'react-redux'
import { apiInfo } from '@/api'

export const useUserInfoControl = () => {
  const dispatch = useDispatch()
  return [
    {
      updateUserInfo: () => {
        apiInfo().then(res => dispatch(setUserInfo(res)))
      }
    }
  ]
}
