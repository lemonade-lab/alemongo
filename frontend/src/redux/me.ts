import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { TOKEN_KEY } from '../api/base'

function isLogin() {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  try {
    const decodedToken = jwtDecode(token)
    if (decodedToken.exp) {
      const expirationDate = new Date(decodedToken.exp * 1000)
      const now = new Date()
      if (now < expirationDate) {
        return true
      }
    }
  } catch (error) {
    console.error('Invalid token', error)
  }
  return false
}

type State = {
  token: string
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
  token: localStorage.getItem(TOKEN_KEY) || '',
  login: isLogin(),
  info: initInfo
}

const notificationSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      localStorage.setItem(TOKEN_KEY, action.payload)
      state.token = action.payload
      state.login = true
    },
    setUserInfo(state, action: PayloadAction<State['info']>) {
      state.info = Object.assign({}, state.info, action.payload)
    },
    clearUserState(state) {
      localStorage.removeItem(TOKEN_KEY)
      state.token = ''
      state.login = false
      state.info = initInfo
    }
  }
})

export const { setUserInfo, setToken, clearUserState } =
  notificationSlice.actions
export default notificationSlice.reducer
