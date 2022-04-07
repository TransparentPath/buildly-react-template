/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Login using username and password
       * @example
       * cy.login('abc','abc123')
       */
      login(username: string, password: string): Chainable<any>

      /**
       * Save items in local storage
       * @example
       * cy.saveLocalStorage()
       */
      saveLocalStorage():Chainable<any>

      /**
       * Restore local storage items
       * @example
       * cy.restoreLocalStorage()
       */
      restoreLocalStorage():Chainable<any>

      /**
       * Visit profile page
       * @example
       * cy.visitProfile()
       */
      visitProfile():Chainable<any>
    }
  }