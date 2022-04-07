/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on register page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const timeStampInMs = Math.round(new Date().getTime() / 1000);

context('Registers a user and checks for login', () => {
  it('Register User', () => {
    cy.visit(Cypress.env('REGISTER'));
    // Fill up registration form

    cy.get('#first_name').type('Automation');
    cy.get('#last_name').type('User');
    cy.get('#username').type(`test-automation-${timeStampInMs}`);
    cy.get('#email').type('test@abc.com');
    cy.get('#organization_name').type('TransparentPath');
    // cy.get('.MuiAutocomplete-popper').eq(0).click();
    cy.get('#password').type('qvE#Muz3^KV9xU2');
    cy.get('#re_password').type('qvE#Muz3^KV9xU2');

    cy.get('form').contains('Register').should('exist').click(); // Hits on Sign In

    cy.wait(2000);
    cy.get('.MuiSnackbarContent-message').contains('Registration was successful').should('be.visible'); // Assert if DOM element is seen
    cy.url().should('include', Cypress.env('LOGIN')); // Assertion

    cy.wait(2000);
  });

  it('Login with inactive user', () => {
    cy.login(`test-automation-${timeStampInMs}`, 'qvE#Muz3^KV9xU2');

    cy.get('.MuiSnackbarContent-message').contains('Sign in failed').should('be.visible'); // Assert if DOM element is seen
  });
});
