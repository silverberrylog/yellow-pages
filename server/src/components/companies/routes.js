import Joi from 'joi'
import { companyDataValidation } from '../../utils/validation.js'
import { requiresAuth } from '../accounts/middleware.js'
import * as services from './services.js'

/** @arg {import('fastify').FastifyInstance} fastify */
export default async fastify => {
    fastify.route({
        method: 'POST',
        url: '/',
        schema: {
            body: Joi.object(companyDataValidation).options({
                presence: 'required',
            }),
        },
        preHandler: [requiresAuth],
        handler: async req => {
            await services.setup(req.company?.id, req.account.id, req.body)
            return {}
        },
    })

    fastify.route({
        method: 'PATCH',
        url: '/',
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

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            querystring: Joi.object({
                // longitude, latitude
                aroundCoords: Joi.array()
                    .items(Joi.number())
                    .length(2)
                    .required(),
                radiusInMeters: Joi.number().required(),
                page: Joi.number().integer().min(1).required(),
                sortBy: Joi.string().allow('name', 'distance').required(),
                sortOrder: Joi.string().allow('asc', 'desc').required(),
                mustBeOpen: Joi.boolean().default(false),
            }),
        },
        preHandler: [],
        handler: async req => {
            const { companies, count } = await services.findCompanies(
                req.query.aroundCoords,
                req.query.radiusInMeters,
                req.query.page,
                req.query.sortBy,
                req.query.sortOrder,
                req.query.mustBeOpen
            )
            return { companies, count }
        },
    })
}
