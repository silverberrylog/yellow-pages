/**
 * @typedef {Object} ErrorData
 * @property {string} name
 * @property {number} httpCode
 * @property {string} description
 * @property {string | undefined} path
 */

export default class AppError extends Error {
    /**
     * @param {ErrorData} errorData
     */
    constructor({ name, httpCode, description, path }) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

        this.name = name
        this.httpCode = httpCode
        this.path = path

        Error.captureStackTrace(this)
    }
}
