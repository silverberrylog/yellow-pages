const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const { resolve } = require('path')

// https://vitejs.dev/config/
module.exports = defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve('src'),
            Common: resolve('../common'),
            Cypress: resolve('cypress'),
        },
    },
})
