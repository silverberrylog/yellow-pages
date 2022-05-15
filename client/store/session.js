import { createSlice } from '@reduxjs/toolkit'

export const sessionSlice = createSlice({
    name: 'session',
    initialState: {
        id: null,
        expiresAt: null,
    },
    reducers: {
        setSession: (state, action) => {
            state.id = action.payload.id
            state.expiresAt = action.payload.expiresAt
        },
    },
})

export const { setSession } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
