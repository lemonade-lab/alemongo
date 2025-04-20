import { createSlice } from '@reduxjs/toolkit'
import { Info } from '../api';

type State = Info

const initialState: State = {
  nvm: {
    installed: false,
    version: "",
  },
  node: {
    installed: false,
    version: "",
  },
  browser: {
    installed: false,
    version: "",
  },
  git: {
    installed: false,
    version: "",
  },
  start_at: "",
  location: ""
}

const notificationSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {
    setInfo(state, action) {
      state.nvm = action.payload.nvm
      state.node = action.payload.node
      state.browser = action.payload.browser
      state.git = action.payload.git
      state.start_at = action.payload.start_at
      state.location = action.payload.location
    }
  }
})

export const { setInfo } = notificationSlice.actions
export default notificationSlice.reducer
