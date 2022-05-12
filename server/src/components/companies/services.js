import { CompanyPhoto } from './models.js'
import { unlinkSync } from 'fs'
import lodashMerge from 'lodash.merge'
import { Company } from './models.js'

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
 * @param {string | undefined} companyId
 * @param {string} accountId
 * @param {CompanyData} companyData
 */
export const setup = async (companyId, accountId, companyData) => {
    // thrown an error if the account already has a company
    // if (companyId) throw new AppError(errors)

    let dataCopy = { ...companyData, account: accountId }
    dataCopy.addressCoords = {
        type: 'Point',
        coordinates: dataCopy.addressCoords,
    }

    await Company.create(dataCopy)
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

    await Company.findByIdAndUpdate(companyId, dataCopy)
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
 * @param {boolean} mustBeOpen
 */
export const findCompanies = async (
    aroundCoords,
    radiusInMeters,
    page,
    sortBy,
    sortOrder,
    mustBeOpen
) => {
    const timeNow = new Date()
    const minutesSinceTheDayStarted =
        timeNow.getHours() * 60 + timeNow.getMinutes()
    const weekDayIndex = timeNow.getUTCDay() - 1

    const matchOpenCompanies = {
        $match: {
            isOpenNow: true,
        },
    }
    const skipSortAndLimit = [
        {
            $sort: {
                [sortBy]: sortOrder == 'asc' ? 1 : -1,
            },
        },
        {
            $skip: 25 * (page - 1),
        },
        {
            $limit: 25,
        },
    ]
    const [queryResult] = await Company.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: aroundCoords },
                maxDistance: 1000000000,
                distanceField: 'distance',
                spherical: true,
            },
        },
        {
            $project: {
                _id: false,
                name: true,
                description: true,
                phoneNumber: true,
                email: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                country: true,
                businessHours: true,
                addressCoords: '$addressCoords.coordinates',
                isOpenNow: {
                    $and: [
                        {
                            $gte: [
                                minutesSinceTheDayStarted,
                                {
                                    $arrayElemAt: [
                                        '$businessHours.startsAt',
                                        weekDayIndex,
                                    ],
                                },
                            ],
                        },
                        {
                            $lt: [
                                minutesSinceTheDayStarted,
                                {
                                    $arrayElemAt: [
                                        '$businessHours.endsAt',
                                        weekDayIndex,
                                    ],
                                },
                            ],
                        },
                    ],
                },
                distance: '$distance',
            },
        },
        {
            $facet: {
                companies: mustBeOpen
                    ? [matchOpenCompanies, ...skipSortAndLimit]
                    : [...skipSortAndLimit],
                count: [
                    {
                        $count: 'count',
                    },
                ],
            },
        },
    ])

    return {
        companies: queryResult.companies,
        count: queryResult.count[0]?.count || 0,
    }
}
