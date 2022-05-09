import { server } from '../../test-utils/setup.js'
import { faker } from '@faker-js/faker'

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
