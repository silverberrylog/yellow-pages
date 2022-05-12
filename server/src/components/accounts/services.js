import { hash, compare } from 'bcrypt'
import dayjs from 'dayjs'
import uid from 'uid-safe'
import AppError from '../../utils/AppError.js'
import errors from './errors.js'
import { Account, Session } from './models.js'

const createSession = async account => {
    return await Session.create({
        publicId: await uid(32),
        expiresAt: dayjs().add('2', 'weeks').toDate(),
        account,
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
    const emailInUse = await Account.findOne({ email })
    if (emailInUse) throw new AppError(errors.registerEmailInUse)

    const account = await Account.create({
        email,
        password: await hash(password, 10),
    })
    const session = await createSession(account)

    return {
        session: getSessionPublicData(session),
    }
}

/**
 * @param {string} email
 * @param {string} password
 * @throws {AppError}
 */
export const login = async (email, password) => {
    const account = await Account.findOne({ email })
    if (!account) throw new AppError(errors.loginAccountNotFound)

    const passwordsMatch = await compare(password, account.password)
    if (!passwordsMatch) throw new AppError(errors.loginWrongPassword)

    const session = await createSession(account)

    return {
        session: getSessionPublicData(session),
    }
}

/**
 * @param {string} sessionPublicId
 */
export const logout = async sessionPublicId => {
    await Session.deleteOne({ publicId: sessionPublicId })
}
