import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode';
import { TOKEN_KEY } from '../api/base';

function isLogin() {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp) {
      const expirationDate = new Date(decodedToken.exp * 1000);
      const now = new Date();
      if (now < expirationDate) {
        return true;
      }
    }
  } catch (error) {
    console.error('Invalid token', error);
  }
  return false;
}


interface State {
  username: string,
  token: string
  login: boolean
}

const initialState: State = {
  username: "柠檬冲水",
  token: localStorage.getItem(TOKEN_KEY) || '',
  login: isLogin()
}

const notificationSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      localStorage.setItem(TOKEN_KEY, action.payload)
      state.token = action.payload
      state.login = true
    }
  }
})

export const { setToken } = notificationSlice.actions
export default notificationSlice.reducer
