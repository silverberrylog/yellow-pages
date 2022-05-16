/// <reference types="cypress" />
import { genAccountData } from 'Common'

describe('Testing the register page', () => {
    describe('Errors', () => {
        it('should show an error message when the passwords do not match', function () {
            cy.visit('/register')

            const { email, password } = genAccountData()
            const differentPassword = genAccountData().password
            cy.get(':nth-child(1) > .form-control').type(email)
            cy.get(':nth-child(2) > .form-control').type(password)
            cy.get(':nth-child(3) > .form-control').type(differentPassword)
            cy.get('.btn').click()

            cy.get(':nth-child(3) > .text-danger')
                .invoke('text')
                .should('not.be.empty')
        })

        it('should show an error message when the email is empty', function () {
            cy.visit('/register')

            const userData = genAccountData()
            cy.get(':nth-child(2) > .form-control').type(userData.password)
            cy.get(':nth-child(3) > .form-control').type(userData.password)
            cy.get('.btn').click()

            cy.get(':nth-child(1) > .text-danger')
                .invoke('text')
                .should('not.be.empty')
        })
    })

    describe('Successes', () => {
        it('should go do /dashboard on successful registration', function () {
            cy.visit('/register')

            const userData = genAccountData()
            cy.get(':nth-child(1) > .form-control').type(userData.email)
            cy.get(':nth-child(2) > .form-control').type(userData.password)
            cy.get(':nth-child(3) > .form-control').type(userData.password)
            cy.get('.btn').click()

            cy.url().should('contain', '/dashboard')
        })
    })
})
