import Joi from 'joi'
import { companyDataValidation } from '../../utils/validation.js'
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
            body: Joi.object(companyDataValidation).options({
                presence: 'required',
            }),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.setup(req.company.id, req.body)
            return {}
        },
    })

    fastify.route({
        method: 'PATCH',
        url: '/info',
        schema: {
            body: Joi.object(companyDataValidation).min(1),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.updateInfo(req.company.id, req.body)
            return {}
        },
    })

    // accepts files
    fastify.route({
        method: 'POST',
        url: '/photos',
        schema: {
            body: Joi.object({
                files: Joi.array()
                    .items(
                        Joi.object({
                            fileNameOnDisk: Joi.string().required(),
                            filePathOnDisk: Joi.string().required(),
                        })
                    )
                    .required(),
            }),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            const { photoURLS } = await services.addPhotos(
                req.company.id,
                req.body.files
            )
            return { photoURLS }
        },
    })

    fastify.route({
        method: 'DELETE',
        url: '/photos',
        schema: {
            body: Joi.object({
                publicURLS: Joi.array().items(Joi.string()).required(),
            }),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.deletePhotos(req.company.id, req.body.publicURLS)
            return {}
        },
    })
}
