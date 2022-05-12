import { server } from '../../test-utils/setup.js'
import { faker } from '@faker-js/faker'

export const genAccountData = () => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
})

export const registerAccount = async accountData => {
    const res = await server.inject({
        method: 'POST',
        url: '/accounts/register',
        body: accountData || genAccountData(),
    })
    return [res.json(), res]
}

export const loginAccount = async accountData => {
    const res = await server.inject({
        method: 'POST',
        url: '/accounts/login',
        body: accountData || genAccountData(),
    })
    return [res.json(), res]
}

export const authHeaders = registerBody => ({
    headers: {
        authorization: `Basic ${registerBody.session.id}`,
    },
})
