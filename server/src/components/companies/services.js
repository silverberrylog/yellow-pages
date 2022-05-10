import { hash, compare } from 'bcrypt'
import dayjs from 'dayjs'
import uid from 'uid-safe'
import AppError from '../../utils/AppError.js'
import errors from './errors.js'
import { Company, CompanyPhoto, Session } from './models.js'
import { unlinkSync } from 'fs'
import { resolve } from 'path'

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

/**
 * @param {string} sessionPublicId
 */
export const logout = async sessionPublicId => {
    await Session.deleteOne({ publicId: sessionPublicId })
}

/**
 * @typedef {Object} BusinessHours
 * @prop {string} startsAt
 * @prop {string} endsAt
 */

/**
 * @typedef {Object} CompanyData
 * @prop {string} name
 * @prop {string} addressLine1
 * @prop {string} addressLine2
 * @prop {string} city
 * @prop {string} state
 * @prop {string} country
 * @prop {string} email
 * @prop {string} phoneNumber
 * @prop {string} description
 * @prop {BusinessHours[]} businessHours
 */

/**
 * @param {string} companyId
 * @param {CompanyData} companyData
 */
export const setup = async (companyId, companyData) => {
    await Company.findByIdAndUpdate(companyId, { companyData })
}

/**
 * @typedef {Object} File
 * @property {string} fileNameOnDisk
 * @property {string} filePathOnDisk
 */

/**
 * @param {string} companyId
 * @param {File[]} files
 */
export const addPhotos = async (companyId, files) => {
    await CompanyPhoto.bulkWrite(
        files.map(file => ({
            insertOne: {
                document: {
                    privatePath: file.filePathOnDisk,
                    publicPath: '/photos/' + file.fileNameOnDisk,
                    company: companyId,
                },
            },
        }))
    )

    return {
        photoURLS: files.map(file => '/photos/' + file.fileNameOnDisk),
    }
}

/**
 * @param {string} companyId
 * @param {string[]} publicURLS
 */
export const deletePhotos = async (companyId, publicURLS) => {
    const photosFilter = {
        company: companyId,
        publicPath: { $in: publicURLS },
    }

    const photos = await CompanyPhoto.find(photosFilter).select('privatePath')

    for (const { privatePath } of photos) {
        unlinkSync(privatePath)
    }
    await CompanyPhoto.deleteMany(photosFilter)
}
