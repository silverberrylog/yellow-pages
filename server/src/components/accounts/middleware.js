import Joi from 'joi'
import AppError from '../../utils/AppError.js'
import { validationOptions } from '../../utils/validation.js'
import { Company } from '../companies/models.js'
import errors from './errors.js'
import { Session, Account } from './models.js'

/**
 * Validates the session and binds the company to req.company
 * @param {import('fastify').FastifyRequest} req
 */
export const requiresAuth = async req => {
    const schema = Joi.object({
        authorization: Joi.string()
            .regex(/^Basic .+$/)
            .required(),
    })
    const { error } = schema.validate(req.headers, validationOptions)
    if (error) throw new AppError(errors.notLoggedIn)

    const sessionPublicId = req.headers.authorization.replace('Basic ', '')
    const session = await Session.findOne({ publicId: sessionPublicId })
    if (!session) throw new AppError(errors.invalidSession)

    const sessionIsExpired = session.expiresAt < new Date()
    if (sessionIsExpired) throw new AppError(errors.expiredSession)

    req.account = await Account.findOne({ _id: session.account })
    req.company = await Company.findOne({ account: session.account })
}
