/// <reference types="cypress" />
import { genAccountData } from 'Common'
import { registerUser } from 'Cypress/utils'

describe('Testing the login page', () => {
    describe('Errors', () => {
        it('should show an error message when the email is empty', function () {
            cy.visit('/login')

            // const userData = genAccountData()
            // cy.get(':nth-child(2) > .form-control').type(userData.password)
            cy.get('.btn').click()

            cy.get(':nth-child(1) > .text-danger')
                .invoke('text')
                .should('not.be.empty')
        })

        it('should show an error message when the user does not exist', function () {
            cy.visit('/login')

            const userData = genAccountData()
            cy.get(':nth-child(1) > .form-control').type(userData.email)
            cy.get(':nth-child(2) > .form-control').type(userData.password)
            cy.get('.btn').click()

            cy.get('.mb-0').invoke('text').should('not.be.empty')
        })

        it('should show an error message when the password is wrong', function () {
            cy.visit('/login')

            const { email, password } = genAccountData()
            cy.wrap(null).then(() => registerUser({ email, password }))
            const wrongPassword = genAccountData().password

            cy.get(':nth-child(1) > .form-control').type(email)
            cy.get(':nth-child(2) > .form-control').type(wrongPassword)
            cy.get('.btn').click()

            cy.get('.mb-0').invoke('text').should('not.be.empty')
        })
    })

    describe('Successes', () => {
        it('should go do /dashboard on successful registration', function () {
            cy.visit('/login')

            const userData = genAccountData()
            cy.wrap(null).then(() => registerUser(userData))
            cy.get(':nth-child(1) > .form-control').type(userData.email)
            cy.get(':nth-child(2) > .form-control').type(userData.password)
            cy.get('.btn').click()

            cy.url().should('contain', '/dashboard')
        })
    })
})
