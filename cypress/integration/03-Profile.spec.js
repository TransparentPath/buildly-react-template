/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on register page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const timeStampInMs = Math.round(new Date().getTime() / 1000);

let userdata = {};
context('User logs in and performs operations on his / her profile', () => {
  beforeEach(() => {
    cy.fixture('userdata').then((user) => {
      userdata = user;
      cy.log('Userdata: ', userdata, user);
    });
  });

  it('Visit Profile Page', () => {
    cy.visitProfile();
  });

  it('Check profile details', () => {
    cy.url().should('include', Cypress.env('PROFILE')); // Profile URL

    // Assertions to check correct data
    cy.get('.MuiTypography-root.MuiTypography-body1').eq(0).should('have.text', 'Dev New');
    cy.get('.MuiTypography-root.MuiTypography-body1')
      .eq(1)
      .should('have.text', userdata.last_name);
    cy.get('.MuiTypography-root.MuiTypography-body1')
      .eq(2)
      .should('have.text', userdata.core_user_uuid);
    cy.get('.MuiTypography-root.MuiTypography-body1')
      .eq(3)
      .should('have.text', userdata.organization.name);
    cy.get('.MuiTypography-root.MuiTypography-body1').eq(4).should('have.text', userdata.email);
  });

  it('Edit Profile Details', () => {
    cy.visitProfile();
    cy.url().should('include', Cypress.env('PROFILE')); // Profile URL
    cy.get("button[aria-label='edit']").click(); // Click on Edit Icon

    cy.get('input#first_name').clear().type('Dev New'); // Input new name
    cy.get('button[type="submit"]').click(); // Save Details
    cy.wait(200);
    cy.get('.MuiSnackbarContent-message')
    //   .contains('Account details successfully updated')
      .should('be.visible'); // Assert if DOM element is seen
  });

  it('Navigates to Home', () => {
    cy.visitProfile();
    cy.url().should('include', Cypress.env('PROFILE')); // Profile URL
    cy.get('.MuiButton-root').contains('Back To Shipment Page').should('exist').click(); // Hits on Sign In

    cy.url().should('include', Cypress.env('HOME')); // Assertion to home page
  });
});
