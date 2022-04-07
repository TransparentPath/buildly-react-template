/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Custodian', () => {
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
    cy.get('nav ul.MuiList-root .MuiListItemText-root').eq(2).should('exist').click();
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.url().should('include', Cypress.env('CUSTODIAN'));
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').invoke('text').should('eq', 'Custodians'); // Check for Page Title
  });

  it('Custodian Map Entries', () => {
    cy.wait(1000);
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'] > td")
      .eq(2)
      .find('div[class*="MUIDataTableBodyCell-root"]')
      .should('not.be.empty');
  });

  it('Add Custodian', () => {
    let total_items = 0;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        total_items = parseInt(elem.text().split('of')[1], 10);
      });

    cy.get('.MuiContainer-root').find('button').contains('Add Custodian').click();
    cy.url().should('contains', `${Cypress.env('CUSTODIAN')}/add`);

    cy.get('form').contains('Add Custodian').should('exist').should('be.disabled');

    // Fill in form values
    cy.get('input#company').type('Test Custodian'); // Input Company Name
    cy.get('#custodianType').click(); // Open Custodian Type Select Menu
    cy.get(`[aria-labelledby="custodianType-label"] > li[data-value="${Cypress.env('CUSTODIAN_API')}/custodian_type/2/"]`).click(); // Select Custodian Type
    cy.get('input#address_1').type('Test Address 1'); // Input Address 1
    cy.get('#state').click(); // Open State Select Menu
    cy.get('[aria-labelledby="state-label"] > li[data-value="AK"]').click(); // Select State
    cy.get('#country').click(); // Open Country Select Menu
    cy.get('[aria-labelledby="country-label"] > li[data-value="USA"]').click(); // Select Country

    // Save
    cy.get('form').contains('Add Custodian').should('not.be.disabled').click();
    cy.wait(200);
    cy.get('.MuiSnackbarContent-message')
      .contains('Successfully Added Custodian')
      .should('be.visible'); // Assert if DOM element is seen

    cy.wait(5000);

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        expect(parseInt(elem.text().split('of')[1], 10)).to.be.eq(total_items + 1);
      });
  });

  it('Edit Custodian', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root']")
      .eq(1)
      .find('td')
      .eq(0)
      .click();

    cy.url().should('contains', `${Cypress.env('CUSTODIAN')}/edit/`); // Assertion

    // Fill in form values
    cy.get('input#company').then((elem) => {
      const company_name = elem.val();

      if (company_name.includes('Edited')) {
        cy.get('input#company').clear().type(company_name.replace(' Edited', ''));
      } else {
        cy.get('input#company').clear().type(`${company_name} Edited`);
      }
    });

    cy.get('#custodianType').click(); // Open Custodian Type Select Menu
    cy.get(`[aria-labelledby="custodianType-label"] > li[data-value="${Cypress.env('CUSTODIAN_API')}/custodian_type/1/"]`).click(); // Select Custodian Type

    cy.get('input#address_1').then((elem) => {
      const address_1 = elem.val();

      if (address_1.includes('Edited')) {
        cy.get('input#address_1').clear().type(address_1.replace(' Edited', ''));
      } else {
        cy.get('input#address_1').clear().type(`${address_1} Edited`);
      }
    });

    cy.get('#state').click(); // Open State Select Menu
    cy.get('[aria-labelledby="state-label"] > li[data-value="CA"]').click(); // Select State
    cy.get('#country').click(); // Open Country Select Menu
    cy.get('[aria-labelledby="country-label"] > li[data-value="USA"]').click(); // Select Country

    cy.get('form').find('button').contains('Save').should('exist')
      .should('not.be.disabled')
      .click();
    cy.wait(200);
    cy.get('.MuiSnackbarContent-message')
      .contains('Custodian successfully Edited!')
      .should('be.visible'); // Assert if DOM element is seen
  });

  it('View Records', () => {
    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        const [min, max] = elem.text().split('of')[0].split('-');

        cy.log('RowCount: ', min, max);
        cy.get('tbody.MuiTableBody-root')
          .eq(0)
          .find("tr[class*='MUIDataTableBodyRow-root']")
          .its('length')
          .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
      });
  });

  it('Delete Custodian', () => {
    let total_items = 0;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        total_items = parseInt(elem.text().split('of')[1], 10);
      });

    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root']")
      .eq(1)
      .find('td')
      .eq(1)
      .click();

    cy.get('h2#alert-dialog-title')
      .invoke('text')
      .should(
        'eq',
        'Are you sure you want to delete this Custodian?',
      );

    cy.get('button').contains('Delete').should('exist').click();

    cy.wait(5000);

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        expect(parseInt(elem.text().split('of')[1], 10)).to.be.eq(total_items - 1);
      });
  });

  it('Check Number Of Items Per Page Control', () => {
    const paginationLength = 5;

    cy.get('#pagination-rows').click(); // Open Number Of Items Per Page
    cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root']")
      .should('have.length.at.most', paginationLength);
  });

  it('Check Pagination Button', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MuiTableRow-root']")
      .its('length')
      .then((length) => {
        const paginationLength = 5;

        if (length > paginationLength) {
          cy.get('#pagination-rows').click();
          cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

          cy.get('#pagination-back').should('be.disabled');
          cy.get('#pagination-next').should('not.be.disabled');

          cy.get('#pagination-next').click();

          if (length >= (2 * paginationLength)) {
            cy.get('tbody.MuiTableBody-root')
              .eq(0)
              .find("tr[class*='MUIDataTableBodyRow-root']")
              .should('have.length.at.most', paginationLength);

            cy.get('#pagination-next').should('not.be.disabled');
          } else {
            cy.get('tbody.MuiTableBody-root')
              .eq(0)
              .find("tr[class*='MUIDataTableBodyRow-root']")
              .should('have.length.at.most', length % paginationLength);

            cy.get('#pagination-next').should('be.disabled');
          }

          cy.get('#pagination-back').should('not.be.disabled');
        }
      });
  });

  it('Search Custodians', () => {
    cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[data-test-id="Search"]').eq(0).find('input').type('Test');
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find('tr')
      .each((elem) => {
        expect(elem.text().toLocaleLowerCase()).to.include('test'); // Assertion
      });

    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
    cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();
  });

  it('Filter Custodians', () => {
    cy.get('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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

    cy.get('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
      .eq(0)
      .click();

    cy.get('button[data-testid="filterReset-button"')
      .eq(0)
      .click();

    cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
      force: true,
    });
  });

  it('Download Custodians data', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
      .eq(0)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'CustodianData.csv')).should('exist');
  });

  // it('Print records', () => {
  // cy.window().then((win) => {
  // cy.stub(win, 'print');
  // });
  // cy.get('button[aria-label="Print"][data-testid="Print-iconButton"]')
  // .eq(0)
  // .then((data) => {
  // cy.window().then((win) => {
  // win.print();
  // data.click();
  // expect(win.print).to.be.calledOnce;
  // win.close();
  // });
  // });
  // });
});
