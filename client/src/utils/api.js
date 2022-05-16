import { create } from 'axios'
import { store } from '@/store'
import getEnvVar from './getEnvVar'
import ValidationError from './ValidationError'

export const api = create({
    baseURL: getEnvVar('VITE_SERVER_URL'),
})
api.interceptors.response.use(
    response => response,
    error => {
        // if !error.response.data.message, commit error to redux and show overlay
        return Promise.reject(
            new ValidationError(
                error.response.data.message,
                error.response.data.path
            )
        )
    }
)

export const authHeaders = () => {
    return {
        headers: {
            authentication: 'Basic ' + store.getState().session.id,
        },
    }
}
