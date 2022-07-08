/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on login page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

context('User logs in and navigates to shipment', () => {
  const login_url = Cypress.env('LOGIN');

  it('Successful login', () => {
    cy.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD')); // Call to custom command
    cy.url().should('include', Cypress.env('HOME'), () => {
      expect(localStorage.getItem('oauthUser')).to.exist();
    }); // Assertion
  });

  it('Invalid credentials login', () => {
    cy.login(Cypress.env('USERNAME'), 'admin123'); // Call to custom command

    cy.url().should('include', login_url); // Assertion
  });

  it('User should be able to logout', () => {
    cy.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD')); // Call to custom command

    cy.url().should('include', Cypress.env('HOME')); // Assertion
    cy.wait(2000);

    cy.get("[aria-controls='menu-appbar'][aria-label='account of current user']").click(); // Click on Profile button in top bar
    cy.get('.MuiMenuItem-root').contains('Logout').should('exist').click();

    cy.url().should('include', login_url); // Assertion
  });

  it('Forgot password functionality', () => {
    // Needs partial manual input
    cy.visit(login_url);

    cy.get('a.MuiLink-root').contains('Forgot password').should('exist').click();
    cy.url().should('include', Cypress.env('RESET_PASSWORD'));

    cy.get('#email').type(Cypress.env('EMAIL'));
    cy.get('button').contains('Submit').should('exist').click();

    cy.get('.MuiSnackbarContent-message').contains('The reset password link was sent successfully.').should('be.visible');

    // Manual Steps needed

    //  Check the inbox for verify password email
    // Go to the provided link
    // Enter new password
    // Check if able to login
  });
});
