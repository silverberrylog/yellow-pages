import AppError from './AppError.js'

class ErrorHandler {
    /**
     * @param {AppError | Error} error
     * @param {import('fastify').FastifyReply} reply
     */
    async handleError(error, reply) {
        // log error
        // console.log(error)

        // add error to amp
        // ...

        if (error instanceof AppError) {
            reply.code(error.httpCode).send({
                name: error.name,
                message: error.message,
                path: error.path,
            })
            return
        }

        console.log(error)
        process.exit(1)
    }
}

const errorHandler = new ErrorHandler()
export default errorHandler
