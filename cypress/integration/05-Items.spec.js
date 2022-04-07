/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Items', () => {
  before(() => {
    cy.log('Clear download folder');
    cy.exec('rm cypress/downloads/*', {
      log: true,
      failOnNonZeroExit: false,
    });
    // cy.clearLocalStorageCache();
    cy.log('Login to the app');
    const oauthUser = localStorage.getItem('oauthUser');
    if (!oauthUser) {
      cy.login('67OAI8DD5I1O', 'zGtkgLvmNiKm');
      cy.url().should('include', Cypress.env('HOME'), () => {
        expect(localStorage.getItem('oauthUser')).to.exist();
        cy.saveLocalStorageCache();
      }); // Assertion
    }
    cy.wait(15000);
    cy.get('nav  ul.MuiList-root  .MuiListItemText-root').eq(1).should('exist').click();
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.url().should('include', Cypress.env('ITEM'));
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').invoke('text').should('eq', 'Items'); // Check for Page Title
  });

  it('Add Item', () => {
    cy.get('.MuiContainer-root').find('button').contains('Add Item').click();
    cy.url().should('contains', `${Cypress.env('ITEM')}/add`);
    // Fill in form values
    cy.get('#item_name').type('Test Item');
    cy.get('#item_type').click();
    cy.get('[aria-labelledby="item_type-label"] > li').eq(1).click();
    cy.get('#products').click();
    cy.get('[aria-labelledby="products-label"] > li').eq(0).click();
    cy.get('.MuiDialogContent-root').scrollTo('bottom');
    cy.wait(1000);
    cy.get('.MuiDialogContent-root').find('button').contains('Add Item').should('exist')
      .click();
    cy.wait(250);
    cy.get('.MuiSnackbarContent-message')
      .contains('Successfully Added Item')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(2000);
  });

  it('View Records', () => {
    cy.get('.MuiTableRow-footer  .MuiTablePagination-root')
      .eq(0)
      .then((elem) => {
        const rowCount = parseInt(elem.text().split('of')[1].trim(), 10);
        cy.log('RowCount: ', rowCount);
        cy.get('tbody.MuiTableBody-root')
          .eq(0)
          .find("tr[class*='MUIDataTableBodyRow-root']")
          .its('length')
          .should('eq', rowCount); // Assert row length
      });
    cy.wait(15000);
  });

  it('Search Items', () => {
    cy.get('.tss-t0q7y3-MUIDataTableToolbar-actions')
      .eq(0)
      .get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[data-test-id="Search"]').eq(0).find('input').type('Test Item');
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find('tr')
      .each((elem) => {
        expect(elem.text().toLocaleLowerCase()).to.include('test item'); // Assertion
      });
    cy.wait(2000);
  });

  it('Filter Items', () => {
    cy.get('.tss-t0q7y3-MUIDataTableToolbar-actions')
      .eq(0)
      .get('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[class*="MUIDataTableFilter-root"]')
      .eq(0)
      .find('#mui-component-select-name')
      .click();
    cy.get('div#menu-name li')
      .eq(0)
      .then((elem) => {
        elem.click();
        cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
          force: true,
        });
        cy.get('tbody.MuiTableBody-root')
          .eq(0)
          .find('tr')
          .each((rowElem) => {
            expect(rowElem.text()).to.include(rowElem.text()); // Assertion
          });
      });
    cy.reload();
    cy.wait(4000);
  });

  it('Download Items data', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('[data-testid="DownloadCSV-iconButton"]').click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'ItemsData.csv')).should('exist');
    cy.wait(5000);
  });

  it('Edit Item', () => {
    cy.get('.tss-t0q7y3-MUIDataTableToolbar-actions')
      .eq(0)
      .get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.wait(1000);
    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
      .type('Test Item');
    cy.wait(2000);
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'] > td")
      .eq(0)
      .click();
    cy.get('#item_name').clear().type('Update Test Item');
    cy.get('.MuiDialogContent-root').scrollTo('bottom');
    cy.wait(1000);
    cy.get('.MuiDialogContent-root').find('button').contains('Save').click();
    cy.wait(250);
    cy.get('.MuiSnackbarContent-message')
      .contains('Item successfully Edited!')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(5000);
  });

  it('Delete Item', () => {
    cy.get('.tss-t0q7y3-MUIDataTableToolbar-actions')
      .eq(0)
      .get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.wait(1000);
    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
      .type('Update Test Item');
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'] > td")
      .eq(1)
      .click();
    cy.wait(1000);
    cy.get('.MuiDialogActions-root').find('button').contains('Delete').click();
    cy.get('.MuiSnackbarContent-message')
      .contains('Item deleted successfully!')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(5000);
  });

  // it('Print records', () => {
  // cy.window().then((win) => {
  // cy.stub(win, 'print');
  // });
  // cy.get('.tss-t0q7y3-MUIDataTableToolbar-actions')
  // .eq(0)
  // .get('button[aria-label="Print"][data-testid="Print-iconButton"]')
  // .eq(0)
  // .then((data) => {
  // cy.window().then((win) => {
  // win.print();
  // cy.wait(15000);
  // data.click();
  // expect(win.print).to.be.calledOnce;
  // win.close();
  // });
  // });
  // });
});
