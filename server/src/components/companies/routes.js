import Joi from 'joi'
import { requiresAuth } from './middleware.js'
import * as services from './services.js'
import { timeRegex } from '../../utils/validation.js'

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
            body: Joi.object({
                name: Joi.string().required(),
                description: Joi.string().required(),
                phoneNumber: Joi.string().required(),
                email: Joi.string().email().required(),
                addressLine1: Joi.string().required(),
                addressLine2: Joi.string(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                country: Joi.string().required(),
                businessHours: Joi.array()
                    .items(
                        Joi.object({
                            // number of minutes since the day started
                            startsAt: Joi.number()
                                .integer()
                                .min(0)
                                .max(24 * 60)
                                .required(),
                            endsAt: Joi.number()
                                .integer()
                                .min(Joi.ref('startsAt'))
                                .max(24 * 60)
                                .required(),
                        })
                    )
                    .length(7)
                    .required(),
            }),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.setup(req.company.id, req.body)
            return {}
        },
    })
}
