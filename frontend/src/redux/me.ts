import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LOGIN_FLAG_KEY } from '../api/base'

function isLogin() {
  return localStorage.getItem(LOGIN_FLAG_KEY) === 'true'
}

type State = {
  login: boolean
  info: {
    email: string
    is_email_verified: boolean
    username: string
    password: string
    identity: string
    mastername: string
    github_id: number
    github_username: string
    github_avatar: string
    is_github_bound: boolean
    extra_info?: {
      is_temporary_super_admin?: boolean
      [key: string]: unknown
    }
  }
}

const initInfo = {
  email: '',
  is_email_verified: false,
  username: '',
  password: '',
  identity: '',
  mastername: '',
  github_id: 0,
  github_username: '',
  github_avatar: '',
  is_github_bound: false
}

const initialState: State = {
  login: isLogin(),
  info: initInfo
}

const notificationSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setLoggedIn(state) {
      localStorage.setItem(LOGIN_FLAG_KEY, 'true')
      state.login = true
    },
    setUserInfo(state, action: PayloadAction<State['info']>) {
      state.info = Object.assign({}, state.info, action.payload)
    },
    clearUserState(state) {
      localStorage.removeItem(LOGIN_FLAG_KEY)
      state.login = false
      state.info = initInfo
    }
  }
})

export const { setUserInfo, setLoggedIn, clearUserState } =
  notificationSlice.actions
export default notificationSlice.reducer
