import { hash, compare } from 'bcrypt'
import dayjs from 'dayjs'
import uid from 'uid-safe'
import AppError from '../../utils/AppError.js'
import errors from './errors.js'
import { Company, Session } from './models.js'

const createSession = async company => {
    return await Session.create({
        publicId: await uid(32),
        expiresAt: dayjs().add('2', 'weeks').toDate(),
        company,
    })
}

const getSessionPublicData = session => ({
    id: session.publicId,
    expiresAt: session.expiresAt,
})

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
    const session = await createSession(company)

    return {
        session: getSessionPublicData(session),
        companyData: null,
    }
}

/**
 * @param {string} email
 * @param {string} password
 * @throws {AppError}
 */
export const login = async (email, password) => {
    const company = await Company.findOne({ email })
    if (!company) throw new AppError(errors.loginAccountNotFound)

    const passwordsMatch = await compare(password, company.password)
    if (!passwordsMatch) throw new AppError(errors.loginWrongPassword)

    const session = await createSession(company)

    return {
        session: getSessionPublicData(session),
        companyData: company.companyData,
    }
}
