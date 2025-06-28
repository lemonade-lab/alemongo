import { createSlice } from '@reduxjs/toolkit'


type State = {
    open: boolean
}

const initialState: State = {
    open: false,
}

const notificationSlice = createSlice({
    name: 'logs',
    initialState,
    reducers: {
        showLog(state) {
            state.open = true
        },
        hideLog(state) {
            state.open = false
        },
    }
})

export const { showLog, hideLog } = notificationSlice.actions
export default notificationSlice.reducer
