import { configureStore } from '@reduxjs/toolkit'
import infoReducer from './info'
import meInfoReducer from './me'
import logsReducer from './logs'
const store = configureStore({
  reducer: {
    info: infoReducer,
    me: meInfoReducer,
    logs: logsReducer,
  }
})
export type RootState = ReturnType<typeof store.getState>
export default store
