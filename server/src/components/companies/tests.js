import { expect } from 'chai'
import { expectError } from '../../test-utils/index.js'
import {
    genCompanyData,
    registerCompany,
    loginCompany,
    authHeaders,
    uploadPhotos,
} from './test-utils.js'
import errors from './errors.js'
import { requiresAuth } from './middleware.js'
import { Company, Session } from './models.js'
import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'
import { server } from '../../test-utils/setup.js'

describe('Testing the companies component', () => {
    describe('Register', () => {
        it('Should register a company and return auth session info', async () => {
            const [body, res] = await registerCompany()

            expect(res.statusCode).to.eql(200)
            expect(body.session.id).to.be.a('string')
            expect(Date.parse(body.session.expiresAt)).to.be.a('number')
            expect(body.companyData).to.be.null
        })

        it('Should throw an error if the email is already in use', async () => {
            const existingCompanyData = genCompanyData()
            await registerCompany(existingCompanyData)

            const companyData = {
                ...genCompanyData(),
                email: existingCompanyData.email,
            }
            const [, res] = await registerCompany(companyData)

            expectError(res, errors.registerEmailInUse)
        })
    })

    describe('Login', () => {
        it('Should log in a company and return auth session and company info', async () => {
            const companyData = genCompanyData()
            await registerCompany(companyData)
            const [body, res] = await loginCompany(companyData)

            expect(res.statusCode).to.eql(200)
            expect(body.session.id).to.be.a('string')
            expect(Date.parse(body.session.expiresAt)).to.be.a('number')
            expect(body.companyData).to.not.be.ok
        })

        it('Should throw an error if the account does not exist', async () => {
            const companyData = genCompanyData()
            const [, res] = await loginCompany(companyData)

            expectError(res, errors.loginAccountNotFound)
        })

        it('Should throw an error if the password is wrong', async () => {
            const companyData = genCompanyData()
            await registerCompany(companyData)
            const wrongPasswordData = {
                email: companyData.email,
                password: genCompanyData().password,
            }

            const [, res] = await loginCompany(wrongPasswordData)

            expectError(res, errors.loginWrongPassword)
        })
    })

    describe('Logout', () => {
        it('Should log out a company', async () => {
            const [registerBody] = await registerCompany()

            const res = await server.inject({
                method: 'POST',
                url: '/companies/logout',
                ...authHeaders(registerBody),
            })

            const body = res.json()
            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })
    })

    describe('Middleware', () => {
        it('Should succeed when the session exists and is not expired', async () => {
            const [registerBody] = await registerCompany()
            let mockRequest = {
                ...authHeaders(registerBody),
            }

            await requiresAuth(mockRequest).catch(console.log)

            expect(mockRequest.company).to.be.instanceOf(Company)
        })

        it('Should throw when the auth header is not preset', async () => {
            let mockRequest = {
                headers: {
                    lorem: 'ipsum',
                },
            }

            await requiresAuth(mockRequest).catch(err => {
                expect(err.name).to.eql(errors.notLoggedIn.name)
            })
        })

        it('Should throw when the auth header is not formatted properly', async () => {
            let mockRequest = {
                headers: {
                    authorization: faker.lorem.words(3),
                },
            }

            await requiresAuth(mockRequest).catch(err => {
                expect(err.name).to.eql(errors.notLoggedIn.name)
            })
        })

        it('Should throw when the session does not exist', async () => {
            let mockRequest = {
                ...authHeaders({
                    session: { id: new mongoose.Types.ObjectId() },
                }),
            }

            await requiresAuth(mockRequest).catch(err => {
                expect(err.name).to.eql(errors.invalidSession.name)
            })
        })

        it('Should throw when the session is expired', async () => {
            const [registerBody] = await registerCompany()
            await Session.findOneAndUpdate(
                { publicId: registerBody.session.id },
                { expiresAt: new Date(2000, 10, 10) }
            )
            let mockRequest = {
                ...authHeaders(registerBody),
            }

            await requiresAuth(mockRequest).catch(err => {
                expect(err.name).to.eql(errors.expiredSession.name)
            })
        })
    })

    describe('Account setup', () => {
        it('Should succeed when all the data is present', async () => {
            const [registerBody] = await registerCompany()

            const res = await server.inject({
                method: 'POST',
                url: '/companies/setup',
                body: {
                    name: faker.company.companyName(),
                    addressLine1: faker.address.streetAddress(),
                    addressLine2: faker.address.secondaryAddress(),
                    city: faker.address.city(),
                    state: faker.address.state(),
                    country: faker.address.country(),
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

            const body = res.json()
            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })
    })
    describe('Update company info', () => {
        it('Should successfully upload 2 photos', async () => {
            const [registerBody] = await registerCompany()

            const [body, res] = await uploadPhotos(registerBody)

            expect(res.statusCode).to.eql(200)
            expect(body.photoURLS).to.be.an('array')
            body.photoURLS.forEach(item => expect(item).to.be.a('string'))
        })

        it('Should successfully delete 1 photo', async () => {
            const [registerBody] = await registerCompany()
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
            const [registerBody] = await registerCompany()

            const res = await server.inject({
                method: 'PATCH',
                url: '/companies/info',
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
})
