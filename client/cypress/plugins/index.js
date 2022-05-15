/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    config.env = require('dotenv').config().parsed
    return config
}
