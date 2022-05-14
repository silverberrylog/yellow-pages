import { create } from 'axios'
import { store } from '../store'

export const api = create({
    baseURL: process.env.SERVER_URL,
})

export const authHeaders = () => {
    return {
        headers: {
            authentication: 'Basic ' + store.getState().session.id,
        },
    }
}
