import { server } from '../../test-utils/setup.js'
import { faker } from '@faker-js/faker'
import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import lodashMerge from 'lodash.merge'
import { genCoords, reverseArr, toNumbersArr } from '../../test-utils/index.js'
import { expect } from 'chai'
import { authHeaders, registerAccount } from '../accounts/test-utils.js'

export const setCompanyUp = async (registerBody, addressCoords, isOpenNow) => {
    let businessHours = Array(7)
        .fill(null)
        .map(() => ({
            startsAt: isOpenNow
                ? 0
                : faker.datatype.number({ min: 0, max: (24 * 60) / 2 }),
            endsAt: isOpenNow
                ? 24 * 60
                : faker.datatype.number({ min: (24 * 60) / 2, max: 24 * 60 }),
        }))

    const res = await server.inject({
        method: 'POST',
        url: '/companies',
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
            businessHours,
        },
        ...authHeaders(registerBody),
    })

    return [res.json(), res]
}

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
    distanceInMeters,
    companiesMustBeOpenNow
) => {
    for (let i = 0; i < count; i++) {
        const [registerBody] = await registerAccount()
        const nearbyCoords = toNumbersArr(
            reverseArr(
                faker.address.nearbyGPSCoordinate(
                    coords,
                    distanceInMeters / 1000,
                    true
                )
            )
        )

        await setCompanyUp(registerBody, nearbyCoords, companiesMustBeOpenNow)
    }
}

export const expectToBeCompanyData = data => {
    expect(data.name).to.be.a('string')
    expect(data.description).to.be.a('string')
    expect(data.phoneNumber).to.be.a('string')
    expect(data.email).to.be.a('string')
    expect(data.addressLine1).to.be.a('string')
    expect(data.addressLine2).to.be.a('string')
    expect(data.city).to.be.a('string')
    expect(data.state).to.be.a('string')
    expect(data.country).to.be.a('string')

    expect(data.addressCoords).to.be.an('array')
    data.addressCoords.forEach(item => {
        expect(item).to.be.a('number')
    })

    expect(data.businessHours).to.be.an('array')
    expect(data.businessHours.length).to.eql(7)
    data.businessHours.forEach(item => {
        expect(item.startsAt).to.be.a('number')
        expect(item.endsAt).to.be.a('number')
    })

    expect(data.isOpenNow).to.be.a('boolean')
}
