import { server } from '../../test-utils/setup.js'
import { faker } from '@faker-js/faker'
import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import lodashMerge from 'lodash.merge'
import { genCoords, reverseArr, toNumbersArr } from '../../test-utils/index.js'

export const genCompanyData = () => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
})

export const registerCompany = async companyData => {
    const res = await server.inject({
        method: 'POST',
        url: '/companies/register',
        body: companyData || genCompanyData(),
    })
    return [res.json(), res]
}

export const setCompanyUp = async (registerBody, addressCoords) => {
    const res = await server.inject({
        method: 'POST',
        url: '/companies/info',
        body: {
            name: faker.company.companyName(),
            addressLine1: faker.address.streetAddress(),
            addressLine2: faker.address.secondaryAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            country: faker.address.country(),
            addressCoords: addressCoords || genCoords(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber('#### ### ###'),
            description: faker.company.bs(),
            businessHours: Array(7)
                .fill(null)
                .map(() => ({
                    startsAt: faker.datatype.number({
                        min: 0,
                        max: (24 * 60) / 2,
                    }),
                    endsAt: faker.datatype.number({
                        min: (24 * 60) / 2,
                        max: 24 * 60,
                    }),
                })),
        },
        ...authHeaders(registerBody),
    })

    return [res.json(), res]
}

export const loginCompany = async companyData => {
    const res = await server.inject({
        method: 'POST',
        url: '/companies/login',
        body: companyData || genCompanyData(),
    })
    return [res.json(), res]
}

export const authHeaders = registerBody => ({
    headers: {
        authorization: `Basic ${registerBody.session.id}`,
    },
})

export const uploadPhotos = async registerBody => {
    const formData = formAutoContent({
        files: [
            createReadStream('src/test-utils/files/photo-1.jpg'),
            createReadStream('src/test-utils/files/photo-2.jpg'),
        ],
    })

    const res = await server.inject({
        method: 'POST',
        url: '/companies/photos',
        ...lodashMerge(formData, authHeaders(registerBody)),
    })

    return [res.json(), res]
}

export const createCompaniesAroundCoords = async (
    count,
    coords,
    distanceInMeters
) => {
    for (let i = 0; i < count; i++) {
        const [registerBody] = await registerCompany()
        const nearbyCoords = toNumbersArr(
            reverseArr(
                faker.address.nearbyGPSCoordinate(
                    coords,
                    distanceInMeters / 1000,
                    true
                )
            )
        )

        await setCompanyUp(registerBody, nearbyCoords)
    }
}
