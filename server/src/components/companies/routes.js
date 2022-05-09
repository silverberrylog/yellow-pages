import Joi from 'joi'
import * as services from './services.js'

/** @arg {import('fastify').FastifyInstance} fastify */
export default async fastify => {
    fastify.route({
        method: 'POST',
        url: '/register',
        schema: {
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        },
        handler: async req => {
            const { session, companyData } = await services.register(
                req.body.email,
                req.body.password
            )
            return { session, companyData }
        },
    })
}
