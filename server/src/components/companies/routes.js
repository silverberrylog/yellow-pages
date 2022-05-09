import Joi from 'joi'
import { requiresAuth } from './middleware.js'
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

    fastify.route({
        method: 'POST',
        url: '/login',
        schema: {
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        },
        handler: async req => {
            const { session, companyData } = await services.login(
                req.body.email,
                req.body.password
            )
            return { session, companyData }
        },
    })

    fastify.route({
        method: 'POST',
        url: '/logout',
        schema: {},
        preHandler: [requiresAuth],
        handler: async req => {
            const sessionId = req.headers.authorization.replace('Basic ', '')
            await services.logout(sessionId)
            return {}
        },
    })

    fastify.route({
        method: 'POST',
        url: '/setup',
        schema: {
            name: Joi.string().required(),
            description: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            email: Joi.string().email().required(),
            addressLine1: Joi.string().required(),
            addressLine2: Joi.string(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            // businessHours: Joi.string().required(),
            // photos: Joi.string().required(),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.setup(req.company.id, req.body)
            return {}
        },
    })
}
