import { createSlice } from '@reduxjs/toolkit'

type State = {
    username: string,
    password: string,
    identity: string,
    mastername: string,
}

const initialState: State = {
    username: "",
    password: "",
    identity: "",
    mastername: ""
}

const notificationSlice = createSlice({
    name: 'info',
    initialState,
    reducers: {
        setUserInfo(state, action) {
            console.log("setUserInfo", action.payload)
            state.username = action.payload?.username
            state.password = action.payload?.password
            state.identity = action.payload?.identity
            state.mastername = action.payload?.mastername
        }
    }
})

export const { setUserInfo } = notificationSlice.actions
export default notificationSlice.reducer
