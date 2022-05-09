import loadServer from './loaders/index.js'

const start = async () => {
    const server = await loadServer()
    await server.listen(process.env.PORT, process.env.HOST)
    console.log(`Server running on http://localhost:${process.env.PORT}`)
}
start()
