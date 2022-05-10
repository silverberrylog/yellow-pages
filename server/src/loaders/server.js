import Fastify from 'fastify'
import errorHandler from '../utils/errorHandler.js'
import { validationOptions } from '../utils/validation.js'
import AppError from '../utils/AppError.js'

export default async () => {
    const fastify = Fastify({
        ignoreTrailingSlash: true,
        logger: false,
        disableRequestLogging: true,
    })

    fastify.decorateRequest('company', null)

    fastify.register(import('../components/companies/routes.js'), {
        prefix: 'companies',
    })

    fastify.setValidatorCompiler(({ schema, method, url }) => {
        return data => {
            const { value, error } = schema.validate(data, validationOptions)
            if (error)
                return {
                    error: new AppError({
                        httpCode: 400,
                        name: 'validation-error',
                        description: error,
                    }),
                }

            return { value }
        }
    })

    fastify.setErrorHandler(async (error, req, reply) => {
        await errorHandler.handleError(error, reply)
    })

    return fastify
}
