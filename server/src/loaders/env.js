import { config as loadEnvVars } from 'dotenv'
import errorHandler from '../utils/errorHandler.js'

export default () => {
    if (process.env.NODE_ENV !== 'production') loadEnvVars()

    process.on('uncaughtException', async error => {
        await errorHandler.handleError(error)
    })

    process.on('unhandledRejection', async error => {
        await errorHandler.handleError(error)
    })
}
