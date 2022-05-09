import { hash } from 'bcrypt'
import dayjs from 'dayjs'
import uid from 'uid-safe'
import AppError from '../../utils/AppError.js'
import errors from './errors.js'
import { Company, Session } from './models.js'

/**
 * @param {string} email
 * @param {string} password
 * @throws {AppError}
 */
export const register = async (email, password) => {
    const emailInUse = await Company.findOne({ email })
    if (emailInUse) throw new AppError(errors.registerEmailInUse)

    const company = await Company.create({
        email,
        password: await hash(password, 10),
    })

    const session = await Session.create({
        publicId: await uid(32),
        expiresAt: dayjs().add('2', 'weeks').toDate(),
        company,
    })

    return {
        session: {
            id: session.publicId,
            expiresAt: session.expiresAt,
        },
        companyData: null,
    }
}
