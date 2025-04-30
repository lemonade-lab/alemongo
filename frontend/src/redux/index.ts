import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './login'
import infoReducer from './info'
import meInfoReducer from './meInfo'
const store = configureStore({
  reducer: {
    login: loginReducer,
    info: infoReducer,
    me: meInfoReducer,
  }
})
export type RootState = ReturnType<typeof store.getState>
export default store
