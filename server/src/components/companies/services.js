import { hash, compare } from 'bcrypt'
import dayjs from 'dayjs'
import uid from 'uid-safe'
import AppError from '../../utils/AppError.js'
import errors from './errors.js'
import { Company, CompanyPhoto, Session } from './models.js'
import { unlinkSync } from 'fs'
import { resolve } from 'path'
import mongoose from 'mongoose'
import lodashMerge from 'lodash.merge'

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
 * @prop {[number, number]} addressCords
 * @prop {BusinessHours[]} businessHours
 */

/**
 * @param {string} companyId
 * @param {CompanyData} companyData
 */
export const setup = async (companyId, companyData) => {
    let dataCopy = { ...companyData }
    dataCopy.addressCoords = {
        type: 'Point',
        coordinates: dataCopy.addressCoords,
    }

    await Company.findByIdAndUpdate(companyId, { companyData: dataCopy })
}

/**
 * @param {string} companyId
 * @param {Partial<CompanyData>} companyData
 */
export const updateInfo = async (companyId, companyData) => {
    let dataCopy = { ...companyData }
    if (dataCopy.addressCoords) {
        dataCopy.addressCoords = {
            coordinates: dataCopy.addressCoords,
        }
    }

    const company = await Company.findById(companyId).select('companyData')
    company.companyData = lodashMerge(company.companyData, dataCopy)
    await company.save()
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

/**
 * @param {[number, number]} aroundCoords
 * @param {number} radiusInMeters
 * @param {number} page
 * @param {'name' | 'distance'} sortBy
 * @param {'asc' | 'desc'} sortOrder
 */
export const findCompanies = async (
    aroundCoords,
    radiusInMeters,
    page,
    sortBy,
    sortOrder
) => {
    const [queryResult] = await Company.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: aroundCoords },
                $maxDistance: radiusInMeters,
                spherical: true,
                distanceField: 'distance',
                query: {
                    companyData: { $exists: true },
                },
            },
        },
        {
            $project: {
                _id: false,
                name: '$companyData.name',
                description: '$companyData.description',
                phoneNumber: '$companyData.phoneNumber',
                email: '$companyData.email',
                addressLine1: '$companyData.addressLine1',
                addressLine2: '$companyData.addressLine2',
                city: '$companyData.city',
                state: '$companyData.state',
                country: '$companyData.country',
                businessHours: '$companyData.businessHours',
                addressCoords: '$companyData.addressCoords.coordinates',
            },
        },
        {
            $facet: {
                companies: [
                    {
                        $sort: {
                            [sortBy == 'distance'
                                ? 'distance'
                                : 'companyData.name']:
                                sortOrder == 'asc' ? 1 : -1,
                        },
                    },
                    {
                        $skip: 25 * (page - 1),
                    },
                    {
                        $limit: 25,
                    },
                ],
                count: [
                    {
                        $count: 'count',
                    },
                ],
            },
        },
    ])

    const timeNow = new Date()
    const minutesSinceTheDayStarted =
        timeNow.getHours() * 60 + timeNow.getMinutes()

    const formattedCompanies = queryResult.companies.map(companyData => ({
        ...companyData,
        isOpenNow:
            minutesSinceTheDayStarted <= companyData.businessHours.startsAt &&
            companyData.businessHours.endsAt < minutesSinceTheDayStarted,
    }))

    return {
        companies: formattedCompanies,
        count: queryResult.count[0].count,
    }
}
