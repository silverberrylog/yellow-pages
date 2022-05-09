import initEnv from './env.js'
import initDatabase from './database.js'
import initServer from './server.js'

export default async () => {
    initEnv()
    console.log('Env initialized')

    await initDatabase()
    console.log('Database initialized')

    const server = await initServer()
    console.log('Server initialized')

    return server
}
