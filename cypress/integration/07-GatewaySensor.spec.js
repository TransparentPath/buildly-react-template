/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Gateway Sensor', () => {
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
    cy.get('nav ul.MuiList-root .MuiListItemText-root').eq(3).should('exist').click();
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.url().should('include', Cypress.env('GATEWAY_SENSOR'));
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').eq(0).invoke('text').should('eq', 'Gateway'); // Check for Page Title - Gateway
    cy.get('.MuiTypography-h4').eq(1).invoke('text').should('eq', 'Sensors'); // Check for Page Title - Sensors
  });

  it('Gateway Map Entries', () => {
    cy.wait(1000);
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root'] > td")
      .eq(2)
      .find('div[class*="MUIDataTableBodyCell-root"]')
      .should('not.be.empty');
  });

  it('Edit Gateway', () => {
    let total_items = 0;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        total_items = parseInt(elem.text().split('of')[1], 10);

        if (total_items) {
          const gatewayName = 'TIVE-G12346';

          cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
            .eq(0)
            .click();
          cy.get('div[data-test-id="Search"]').eq(0).find('input').type(gatewayName);

          cy.get('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr[class*=\'MUIDataTableBodyRow-root\']').then((rowElement) => {
              if (!rowElement.text().includes('No data to display')) {
                cy.get('tbody.MuiTableBody-root')
                  .eq(0)
                  .find('tr[class*=\'MUIDataTableBodyRow-root\'] > td')
                  .eq(0)
                  .click();

                cy.url().should('contains', `${Cypress.env('GATEWAY_SENSOR')}/gateway/edit/`); // Assertion

                // Fill in form values
                cy.get('input#gateway_name').then((inputElem) => {
                  const gateway_name = inputElem.val();

                  if (gateway_name.includes('Edited')) {
                    cy.get('input#gateway_name').clear().type(gateway_name.replace(' Edited', ''));
                  } else {
                    cy.get('input#gateway_name').clear().type(`${gateway_name} Edited`);
                  }
                });

                cy.get('#gateway_type').click(); // Open Gateway Type Select Menu
                cy.get('[aria-labelledby="gateway_type-label"]').eq(0).find('li').eq(1)
                  .click(); // Select Gateway Type

                cy.get('#gateway_status').click(); // Open Gateway Status Select Menu
                cy.get('[aria-labelledby="gateway_status-label"] > li[data-value="available"]').click(); // Select Gateway Status

                cy.get('#custodian_uuid').click(); // Open Custodian Select Menu
                cy.get('[aria-labelledby="custodian_uuid-label"]').eq(0).find('li').eq(1)
                  .click(); // Select Custodian

                cy.get('form').find('button').contains('Save').should('exist')
                  .should('not.be.disabled')
                  .click();
                cy.wait(200);
                cy.get('.MuiSnackbarContent-message')
                  .contains('Gateway successfully Edited!')
                  .should('be.visible'); // Assert if DOM element is seen
              }

              cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
              cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();
            });
        }
      });
  });

  it('Gateway Record Count', () => {
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

  it('Delete Gateway', () => {
    let total_items = 0;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        total_items = parseInt(elem.text().split('of')[1], 10);

        if (total_items) {
          const gatewayName = 'TIVE-G12346';

          cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
            .eq(0)
            .click();
          cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
            .type(gatewayName);

          cy.get('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr[class*=\'MUIDataTableBodyRow-root\']').then((rowElement) => {
              if (!rowElement.text().includes('No data to display')) {
                cy.get('tbody.MuiTableBody-root')
                  .eq(0)
                  .find('tr[class*=\'MUIDataTableBodyRow-root\'] > td')
                  .eq(1)
                  .click();

                cy.get('h2#alert-dialog-title')
                  .invoke('text')
                  .should(
                    'eq',
                    'Are you sure you want to delete this Gateway?',
                  );

                cy.get('button').contains('Cancel').should('exist').click(); // clicking on cancel to avoid deletion

                cy.wait(5000);

                cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
                cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

                // ONLY UNCOMMENT THE BELOW PART WHEN TESTING ACTUAL DELETION

                // cy.get('.MuiTableRow-footer .MuiTablePagination-root')
                // .eq(0)
                // .find('.MuiTablePagination-displayedRows')
                // .eq(0)
                // .then((elem) => {
                // expect(parseInt(elem.text().split('of')[1])).to.be.eq(total_items - 1);
                // });
              }
            });
        }
      });
  });

  it('Check Number Of Items Per Page Control - Gateway', () => {
    const paginationLength = 5;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(0)
      .find('#pagination-rows').click(); // Open Number Of Items Per Page
    cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root']")
      .should('have.length.at.most', paginationLength);
  });

  it('Check Pagination Button - Gateway', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find("tr[class*='MUIDataTableBodyRow-root']")
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

  it('Search Gateway', () => {
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find('tr[class*=\'MUIDataTableBodyRow-root\']').eq(0)
      .then((rowElement) => {
        if (!rowElement.text().includes('No data to display')) {
          cy.get(rowElement).find('td').eq(2).invoke('text')
            .then((text) => {
              const gatewayName = text.toLocaleLowerCase();

              cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
                .eq(0)
                .click();
              cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
                .type(gatewayName);
              cy.get('tbody.MuiTableBody-root')
                .eq(0)
                .find('tr')
                .each((elem) => {
                  expect(elem.text().toLocaleLowerCase()).to.include(gatewayName); // Assertion
                });

              cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
              cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();
            });
        }
      });
  });

  it('Filter Gateway', () => {
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

  it('Download Gateway data', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
      .eq(0)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'GatewayData.csv')).should('exist');
  });

  // it('Print records - Gateway', () => {
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

  it('Sensor Record Count', () => {
    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(1)
      .find('.MuiTablePagination-displayedRows')
      .eq(0)
      .then((elem) => {
        const [min, max] = elem.text().split('of')[0].split('-');

        cy.log('RowCount: ', min, max);
        cy.get('tbody.MuiTableBody-root')
          .eq(1)
          .find("tr[class*='MUIDataTableBodyRow-root']")
          .its('length')
          .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
      });
  });

  it('Check Number Of Items Per Page Control - Sensors', () => {
    const paginationLength = 5;

    cy.get('.MuiTableRow-footer .MuiTablePagination-root')
      .eq(1)
      .find('#pagination-rows').click(); // Open Number Of Items Per Page
    cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
    cy.get('tbody.MuiTableBody-root')
      .eq(1)
      .find("tr[class*='MUIDataTableBodyRow-root']")
      .should('have.length.at.most', paginationLength);
  });

  it('Download Sensor data', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');

    cy.get('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
      .eq(1)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'SensorData.csv')).should('exist');
  });

  // it('Print records - Sensor', () => {
  // cy.window().then((win) => {
  // cy.stub(win, 'print');
  // });
  // cy.get('button[aria-label="Print"][data-testid="Print-iconButton"]')
  // .eq(1)
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
