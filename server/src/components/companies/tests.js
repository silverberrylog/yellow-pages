import { expect } from 'chai'
import { server } from '../../test-utils/setup.js'
import { expectError } from '../../test-utils/index.js'
import { genCompanyData, registerCompany } from './test-utils.js'
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
})
