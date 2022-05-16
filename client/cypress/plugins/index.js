/// <reference types="cypress" />
const webpackPreprocessor = require('@cypress/webpack-preprocessor')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    const options = {
        webpackOptions: {
            resolve: require('../../vite.config.js').resolve,
        },
    }

    on('file:preprocessor', webpackPreprocessor(options))

    config.env = require('dotenv').config().parsed
    return config
}
