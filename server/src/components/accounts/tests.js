import { expect } from 'chai'
import { expectError, expectToBeADate } from '../../test-utils/index.js'
import {
    genAccountData,
    registerAccount,
    loginAccount,
    authHeaders,
} from './test-utils.js'
import { setCompanyUp } from '../companies/test-utils.js'
import errors from './errors.js'
import { requiresAuth } from './middleware.js'
import { Account, Session } from './models.js'
import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'
import { server } from '../../test-utils/setup.js'
import { Company } from '../companies/models.js'

describe('Testing the accounts component', () => {
    describe('Register', () => {
        it('Should register a company and return auth session info', async () => {
            const [body, res] = await registerAccount()

            expect(res.statusCode).to.eql(200)
            expect(body.session.id).to.be.a('string')
            expectToBeADate(body.session.expiresAt)
        })

        it('Should throw an error if the email is already in use', async () => {
            const existingAccountData = genAccountData()
            await registerAccount(existingAccountData)

            const accountData = {
                ...genAccountData(),
                email: existingAccountData.email,
            }
            const [, res] = await registerAccount(accountData)

            expectError(res, errors.registerEmailInUse)
        })
    })

    describe('Login', () => {
        it('Should log in a company and return auth session', async () => {
            const accountData = genAccountData()
            await registerAccount(accountData)
            const [body, res] = await loginAccount(accountData)

            expect(res.statusCode).to.eql(200)
            expect(body.session.id).to.be.a('string')
            expectToBeADate(body.session.expiresAt)
        })

        it('Should log in a company and return auth session and company info', async () => {
            const accountData = genAccountData()
            const [registerBody] = await registerAccount(accountData)
            await setCompanyUp(registerBody)

            const [body, res] = await loginAccount(accountData)

            expect(res.statusCode).to.eql(200)
            expect(body.session.id).to.be.a('string')
            expectToBeADate(body.session.expiresAt)
        })

        it('Should throw an error if the account does not exist', async () => {
            const accountData = genAccountData()
            const [, res] = await loginAccount(accountData)

            expectError(res, errors.loginAccountNotFound)
        })

        it('Should throw an error if the password is wrong', async () => {
            const accountData = genAccountData()
            await registerAccount(accountData)
            const wrongPasswordData = {
                email: accountData.email,
                password: genAccountData().password,
            }

            const [, res] = await loginAccount(wrongPasswordData)

            expectError(res, errors.loginWrongPassword)
        })
    })

    describe('Logout', () => {
        it('Should log out a company', async () => {
            const [registerBody] = await registerAccount()

            const res = await server.inject({
                method: 'POST',
                url: '/accounts/logout',
                ...authHeaders(registerBody),
            })

            const body = res.json()
            expect(res.statusCode).to.eql(200)
            expect(body).to.be.empty
        })
    })

    describe('Middleware', () => {
        it('Should succeed when the user is logged in but the company does not exist', async () => {
            const [registerBody] = await registerAccount()
            let mockRequest = {
                ...authHeaders(registerBody),
            }

            await requiresAuth(mockRequest)

            expect(mockRequest.account).to.be.instanceof(Account)
            expect(mockRequest.company).to.be.null
        })

        it('Should succeed when the user is logged in and the company exists', async () => {
            const [registerBody] = await registerAccount()
            await setCompanyUp(registerBody)
            let mockRequest = {
                ...authHeaders(registerBody),
            }

            await requiresAuth(mockRequest)

            expect(mockRequest.account).to.be.instanceof(Account)
            expect(mockRequest.company).to.be.instanceof(Company)
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
            const [registerBody] = await registerAccount()
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
