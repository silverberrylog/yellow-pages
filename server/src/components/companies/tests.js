import { expect } from 'chai'
import { server } from '../../test-utils/setup.js'
import { expectError } from '../../test-utils/index.js'
import { genCompanyData, registerCompany, loginCompany } from './test-utils.js'
import errors from './errors.js'

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
})
