import { faker } from '@faker-js/faker'

export const genAccountData = () => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
})
