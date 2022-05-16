export default varName => {
    return typeof Cypress === 'undefined'
        ? import.meta.env[varName]
        : Cypress.env(varName)
}
