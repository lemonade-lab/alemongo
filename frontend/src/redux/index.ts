import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './login'
import infoReducer from './info'
const store = configureStore({
  reducer: {
    login: loginReducer,
    info: infoReducer
  }
})
export type RootState = ReturnType<typeof store.getState>
export default store
