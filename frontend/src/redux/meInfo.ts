import { createSlice } from '@reduxjs/toolkit'

type State = {
    email: string,
    is_email_verified: boolean,
    username: string,
    password: string,
    identity: string,
    mastername: string,
}

const initialState: State = {
    email: "",
    is_email_verified: false,
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
