import { expect } from 'chai'
import { genCoords } from '../../test-utils/index.js'
import { registerAccount, authHeaders } from '../accounts/test-utils.js'
import {
    uploadPhotos,
    createCompaniesAroundCoords,
    expectToBeCompanyData,
    setCompanyUp,
} from './test-utils.js'
import { faker } from '@faker-js/faker'
import { server } from '../../test-utils/setup.js'

describe('Testing the companies component', () => {
    describe('Account setup', () => {
        it('Should succeed when all the data is present', async () => {
            const [registerBody] = await registerAccount()

            const [body, res] = await setCompanyUp(registerBody)

            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })
    })

    describe('Update company info', () => {
        it('Should successfully upload 2 photos', async () => {
            const [registerBody] = await registerAccount()
            await setCompanyUp(registerBody)

            const [body, res] = await uploadPhotos(registerBody)

            expect(res.statusCode).to.eql(200)
            expect(body.photoURLS).to.be.an('array')
            body.photoURLS.forEach(item => expect(item).to.be.a('string'))
        })

        it('Should successfully delete 1 photo', async () => {
            const [registerBody] = await registerAccount()
            await setCompanyUp(registerBody)
            const [uploadBody] = await uploadPhotos(registerBody)

            const res = await server.inject({
                method: 'DELETE',
                url: '/companies/photos',
                body: {
                    publicURLS: [uploadBody.photoURLS[0]],
                },
                ...authHeaders(registerBody),
            })

            const body = res.json()
            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })

        it('Should update the company info', async () => {
            const [registerBody] = await registerAccount()
            await setCompanyUp(registerBody)

            const res = await server.inject({
                method: 'PATCH',
                url: '/companies',
                body: {
                    email: faker.internet.email(),
                    phoneNumber: faker.phone.phoneNumber('#### ### ###'),
                },
                ...authHeaders(registerBody),
            })

            const body = res.json()
            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })
    })

    describe('Querying companies', () => {
        it('Should return the companies within 500 meters of the specified location', async () => {
            const aroundCoords = genCoords()
            const distance = 500
            await createCompaniesAroundCoords(5, aroundCoords, distance)

            const res = await server.inject({
                method: 'GET',
                url: '/companies',
                query: {
                    aroundCoords,
                    radiusInMeters: distance,
                    page: 1,
                    sortBy: 'distance',
                    sortOrder: 'desc',
                },
            })

            const body = res.json()
            expect(body.count).to.be.a('number')
            expect(body.companies).to.be.an('array')
            body.companies.forEach(expectToBeCompanyData)
        })

        it('Should return companies within 500 meters that are open now', async () => {
            const coords = genCoords()
            await createCompaniesAroundCoords(5, coords, 500, true)

            const res = await server.inject({
                method: 'GET',
                url: '/companies',
                query: {
                    aroundCoords: coords,
                    radiusInMeters: 500,
                    page: 1,
                    sortBy: 'distance',
                    sortOrder: 'asc',
                    mustBeOpen: true,
                },
            })

            const body = res.json()
            expect(body.count).to.be.a('number')
            expect(body.companies).to.be.an('array')
            body.companies.forEach(expectToBeCompanyData)
            body.companies.forEach(({ isOpenNow }) => {
                expect(isOpenNow).to.eq(true)
            })
        })
    })
})
