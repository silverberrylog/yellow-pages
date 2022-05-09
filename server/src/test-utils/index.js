import { expect } from 'chai'

export const expectError = (res, error) => {
    expect(res.statusCode).to.eql(error.httpCode)

    const body = res.json()
    expect(body.name).to.eql(error.name)
    expect(body.message).to.eql(error.description)
}
