import { server } from '../../test-utils/setup.js'
import { faker } from '@faker-js/faker'
import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import lodashMerge from 'lodash.merge'

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
