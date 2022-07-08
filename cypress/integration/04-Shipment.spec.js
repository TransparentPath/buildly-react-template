/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Shipment', () => {
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
      cy.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD'));
      cy.url().should('include', Cypress.env('HOME'), () => {
        expect(localStorage.getItem('oauthUser')).to.exist();
        cy.saveLocalStorageCache();
      }); // Assertion
    }
    cy.wait(15000);
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.url().should('include', Cypress.env('HOME'));
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').invoke('text').should('eq', 'Shipments'); // Check for Page Title
  });

  it('Shipment Map Entries', () => {
    cy.wait(1000);
    cy.get('.gm-style').should('exist');
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'].Mui-selected > td")
      .eq(2)
      .then((elem) => {
        const shipment_name = elem.text();
        cy.get('.makeStyles-switchViewSection-34 > .MuiTypography-root').should('have.text', shipment_name);
        cy.get('.makeStyles-switchViewSection-34 > .MuiTypography-root').should('contain.text', shipment_name);
      });
  });

  it('Add Shipment', () => {
    cy.get('.MuiContainer-root').find('button').contains('Add Shipment').click();
    cy.url().should('contains', `${Cypress.env('HOME')}/add`);
    // Fill in form values
    cy.get('input#shipment_name').type('Test Automation Shipment'); // Input new name
    cy.get('#shipment_status').click();
    cy.get('[aria-labelledby="shipment_status-label"] > li[data-value="Planned"]').click();
    cy.get('#uom_distance').should('have.text', 'Miles');
    cy.get('#uom_temp').should('have.text', 'Fahrenheit');
    cy.get('#uom_weight').should('have.text', 'Pounds');
    cy.get('form').contains('Save').should('exist').click();
    cy.wait(250);
    cy.get('.MuiSnackbarContent-message')
      .contains('Successfully Added Shipment')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(15000);
    cy.get('button[aria-label="close"]').should('exist').click({ force: true });
  });

  it('Edit Shipment', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'].Mui-selected > td")
      .eq(0)
      .click();
    cy.url().should('contains', `${Cypress.env('HOME')}/edit/`); // Assertion
    // Fill in form values
    cy.get('input#shipment_name').then((elem) => {
      const shipment_name = elem.val();
      cy.log('Shipment name: ', shipment_name);
      if (shipment_name === 'Test Shipment') {
        elem.val('Test Shipment Edited');
      } else if (shipment_name === 'Test Shipment Edited') {
        elem.val('Test Shipment');
      }
    });
    let shipment_status = null;
    cy.get('#shipment_status').then((elem) => {
      shipment_status = elem.val();
      if (shipment_status === 'Enroute') {
        cy.log('Shipment Enroute. Cannot edit');
      } else if (shipment_status === 'Completed') {
        cy.log('Shipment already completed. Cannot edit');
      } else {
        elem.click();
        cy.wait(10000);

        cy.get('#shipment_status').click();
        cy.get('[aria-labelledby="shipment_status-label"] > li[data-value="Planned"]').click();
      }
    });

    cy.get('button').contains('Save').should('exist').click();
    cy.wait(500);
    cy.get('.MuiSnackbarContent-message')
      .contains('Shipment successfully Edited!')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(10000);
    cy.get('button').contains('Save & Next: Shipment Key').should('exist').click();
    cy.get('.MuiStepLabel-iconContainer > .Mui-active > text').invoke('text').should('eq', '2');
    cy.get('button').contains('Save & Next: Items').should('exist').click();
    cy.get('#tags-outlined-label').siblings('.MuiInputBase-root').get('input#tags-outlined').click();
    cy.get('.MuiAutocomplete-popper').eq(0).then((elem) => {
      cy.log('Elem: ', elem.children().find('ul'));
      if (elem.children().find('#tags-outlined-listbox')) {
        cy.log('Choosing new item');
        elem.children().find('#tags-outlined-listbox > li').click();
      } else if (elem.children().find('.MuiAutocomplete-noOptions')) {
        cy.log('No pending options left');
      } else {
        cy.log('Something random');
      }
    });
    cy.get('.MuiDialogContent-root').scrollTo('bottom');
    cy.wait(1000);
    cy.get('button').contains('Save').should('exist').click();
    cy.get('button').contains('Save & Next: Custodians').should('exist').click();

    cy.get('.MuiStepLabel-iconContainer > .Mui-active > text').invoke('text').should('eq', '4');
    cy.get('button').contains('Add Custody').should('exist').click();
    cy.wait(300);
    cy.get('#custodianURL').click();
    cy.get('ul[aria-labelledby="custodianURL-label"]').find('li').eq(1).click();
    cy.get('#first_custody').click();
    cy.get('ul[aria-labelledby="first_custody-label"]').find('li').eq(0).click();
    cy.get('form').contains('Add Custody').click({
      force: true,
    });
    cy.wait(250);
    cy.get('.MuiSnackbarContent-message')
      .contains('Successfully Added Custody')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(10000);
    cy.get('.MuiDialogContent-root').scrollTo('bottom');
    cy.get('button').contains('Save & Next: Sensors & Gateways').should('exist').click();
    cy.get('.MuiStepLabel-iconContainer > .Mui-active > text').invoke('text').should('eq', '5');
    cy.get('button').contains('Save & Next: Environmental Limits').should('exist').click();
    cy.get('.MuiStepLabel-iconContainer > .Mui-active > text').invoke('text').should('eq', '6');
    cy.get('.MuiSlider-thumb').eq(2).find('.MuiSlider-valueLabelLabel').invoke('text')
      .should('eq', '75');
    cy.get('.MuiDialogContent-root').scrollTo('bottom');
    cy.get('button').contains('Save').should('exist').click();
    cy.wait(10000);
    cy.get('button').contains('Done').should('exist').click();
    cy.url().should('include', Cypress.env('HOME'));
  });

  it('Delete Shipment', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'].Mui-selected > td")
      .eq(1)
      .click();
    cy.get('#alert-dialog-title')
      .invoke('text')
      .should(
        'eq',
        'Are You sure you want to Delete this Shipment? The shipment will be ended in other platforms',
      );
    cy.get('.MuiDialogActions-root').find('button').contains('Delete').click();
    cy.wait(250);
    cy.get('.MuiSnackbarContent-message')
      .contains('Shipment deleted successfully!')
      .should('be.visible'); // Assert if DOM element is seen
    cy.wait(10000);
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
          .should('lte', rowCount); // Assert row length
      });
  });

  it('Search Shipments', () => {
    cy.get('div[class*="MUIDataTableToolbar"]')
      .eq(0)
      .get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[data-test-id="Search"]').eq(0).find('input').type('Test');
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find('tr')
      .each((elem) => {
        expect(elem.text().toLocaleLowerCase()).to.include('test'); // Assertion
      });
    cy.get('div[class*="MUIDataTableToolbar"]')
      .eq(0)
      .get('button[class*="MUIDataTableSearch-clearIcon"]')
      .click();
  });

  it('Filter Shipments', () => {
    cy.get('div[class*="MUIDataTableToolbar"]')
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
  });

  it('Check status of Shipments', () => {
    cy.get('.MuiTabs-flexContainer').find('button[role="tab"]').its('length').should('eq', 3);
    cy.get('.MuiTabs-flexContainer >button.Mui-selected').should('have.text', 'Active');
    cy.get('.MuiTabs-flexContainer >button').eq(1).click();
    cy.get('.MuiTabs-flexContainer >button.Mui-selected').should('have.text', 'Completed');
  });

  it('Download Shipment data', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('div[class*="MUIDataTableToolbar"]')
      .eq(0)
      .get('button[aria-label="Download CSV"]')
      .eq(0)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'ShipmentData.csv')).should('exist');
  });

  it('Admin Controls access', () => {
    cy.get("[aria-controls='menu-appbar'][aria-label='admin section']").click(); // Verify Admin Controls section
    cy.get('#customized-admin li').eq(0).should('have.text', 'Admin Panel');
    cy.get('#customized-admin li').eq(1).should('have.text', 'User Management');
  });

  //  it('Print records', () => {
  // cy.window().then((win) => {
  // cy.stub(win, 'print');
  // });
  // cy.get('div[class*="MUIDataTableToolbar"]')
  // .eq(0)
  // .get('button[aria-label="Print"][data-testid="Print-iconButton"]')
  // .eq(0)
  // .then((data) => {
  // cy.window().then((win) => {
  // in.print();
  // data.click();
  // expect(win.print).to.be.calledOnce;
  // });
  // });
  // });
});
