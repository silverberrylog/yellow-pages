import initServer from '../loaders/index.js'

export let server
before(async () => {
    server = await initServer()
})
