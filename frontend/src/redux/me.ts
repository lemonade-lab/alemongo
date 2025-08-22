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
  }
}

const initialState: State = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  login: isLogin(),
  info: {
    email: '',
    is_email_verified: false,
    username: '',
    password: '',
    identity: '',
    mastername: ''
  }
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
      state.info.username = action.payload?.username
      state.info.password = action.payload?.password
      state.info.identity = action.payload?.identity
      state.info.mastername = action.payload?.mastername
      state.info.email = action.payload?.email
      state.info.is_email_verified = action.payload?.is_email_verified || false
    }
  }
})

export const { setUserInfo, setToken } = notificationSlice.actions
export default notificationSlice.reducer
