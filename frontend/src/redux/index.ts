import { configureStore } from '@reduxjs/toolkit'
import infoReducer from './info'
import meInfoReducer from './me'
const store = configureStore({
  reducer: {
    info: infoReducer,
    me: meInfoReducer,
  }
})
export type RootState = ReturnType<typeof store.getState>
export default store
