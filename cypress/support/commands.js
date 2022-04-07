/* eslint-disable cypress/no-unnecessary-waiting */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

// ***********************************************
// Examples from testing library
// cy.findAllByText("Jackie Chan").click();
// cy.findByText("Button Text").should("exist");
// cy.findByText("Non-existing Button Text").should("not.exist");
// cy.findByLabelText("Label text", { timeout: 7000 }).should("exist");
// cy.get("form").within(() => {
//   cy.findByText("Button Text").should("exist");
// });
// cy.get("form").then((subject) => {
//   cy.findByText("Button Text", { container: subject }).should("exist");
// });
// ***********************************************
/**
 * Login with username and password
 *
 */
import 'cypress-file-upload';

Cypress.Commands.add('login', (username, password) => {
  const login_url = Cypress.env('LOGIN');
  cy.log('Login', login_url);
  const oauthUser = JSON.parse(localStorage.getItem('oauthUser'));
  if (!oauthUser) {
    cy.visit(login_url);
    cy.get('#username').type(username); // Enters username
    cy.get('#password').type(password); // Enters password
    cy.get('form').contains('Sign in').should('exist').click(); // Hits on Sign In
    cy.wait(5000); // Wait added
  } else {
    console.log('Already logged in');
  }
});

// Commands written for local storage
let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add('saveLocalStorageCache', () => {
  console.log('Save LS: ', localStorage);
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add('restoreLocalStorageCache', () => {
  console.log('Restore LS: ', LOCAL_STORAGE_MEMORY, localStorage);
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add('clearLocalStorageCache', () => {
  localStorage.clear();
  LOCAL_STORAGE_MEMORY = {};
});

Cypress.Commands.add('visitProfile', () => {
  cy.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD'));
  cy.url().should('include', Cypress.env('HOME')); // Assertion
  cy.saveLocalStorageCache();
  cy.wait(5000);

  cy.get("[aria-controls='menu-appbar'][aria-label='account of current user']").click({ force: true }); // Click on Profile button in top bar

  cy.get('#customized-menu  .MuiList-root.MuiMenu-list.MuiList-padding').click(); // Visit profile page

  cy.url().should('include', Cypress.env('PROFILE')); // Assertion
});

const checkClassPresence = (element, className) => {
  cy.get(element).invoke('attr', 'class').should('contain', className);
};
