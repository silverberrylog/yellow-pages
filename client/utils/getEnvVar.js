export default varName => {
    return typeof Cypress === 'undefined'
        ? process.env[varName]
        : Cypress.env(varName)
}
