/**
 * @typedef {Object} ErrorData
 * @property {string} name
 * @property {number} httpCode
 * @property {string} description
 */

export default class AppError extends Error {
    /**
     * @param {ErrorData} errorData
     */
    constructor({ name, httpCode, description }) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

        this.name = name
        this.httpCode = httpCode

        Error.captureStackTrace(this)
    }
}
