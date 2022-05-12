import faker from '@faker-js/faker'
import { expect } from 'chai'

export const expectError = (res, error) => {
    expect(res.statusCode).to.eql(error.httpCode)

    const body = res.json()
    expect(body.name).to.eql(error.name)
    expect(body.message).to.eql(error.description)
}

export const reverseArr = arr => {
    let reversed = Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
        reversed[i] = arr[arr.length - 1 - i]
    }
    return reversed
}

export const toNumbersArr = arr => arr.map(item => +item)

export const genCoords = () => {
    return toNumbersArr([faker.address.longitude(), faker.address.latitude()])
}

export const expectToBeADate = data => {
    expect(Date.parse(data)).to.be.a('number')
}
