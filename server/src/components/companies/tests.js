import { expect } from 'chai'
import { expectError } from '../../test-utils/index.js'
import {
    genCompanyData,
    registerCompany,
    loginCompany,
    authHeaders,
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
})
