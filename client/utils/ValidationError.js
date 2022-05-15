export default class ValidationError extends Error {
    /**
     * @param {string} description
     * @param {string} path
     */
    constructor(description, path) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

        this.path = path

        Error.captureStackTrace(this)
    }
}
