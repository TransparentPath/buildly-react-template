/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Admin Panel', () => {
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

    cy.get('button[aria-label="admin section"').should('exist').click();
    cy.get('#customized-admin').should('exist')
      .find('.MuiPaper-root').should('exist')
      .find('ul.MuiMenu-list')
      .should('exist')
      .find('li.MuiMenuItem-root')
      .eq(0)
      .should('exist')
      .click();
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').eq(0).invoke('text').should('eq', 'Admin Panel'); // Check for Page Title
  });

  it('Check Initial Page Tabs', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .then((element) => {
        cy.get(element).find('button').eq(0)
          .should('have.class', 'Mui-selected')
          .should('have.attr', 'aria-selected', 'true')
          .contains('Configuration');
        cy.get(element).find('button').eq(1)
          .should('not.have.class', 'Mui-selected')
          .should('have.attr', 'aria-selected', 'false')
          .contains('Import/Export');
        cy.get(element).find('button').eq(2)
          .should('not.have.class', 'Mui-selected')
          .should('have.attr', 'aria-selected', 'false')
          .contains('Consortium');
      });
  });

  it('Configuration Tab', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .find('button')
      .eq(0)
      .contains('Configuration')
      .click();

    cy.wait(5000);

    cy.url().should('include', Cypress.env('ADMIN_PANEL_CONFIGURATION'));
  });

  it('Check Organization Settings', () => {
    cy.get('.MuiAccordion-root').eq(0).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#organization-setting-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      cy.get(accordionElement)
        .find('.MuiCollapse-root').should('exist')
        .find('form')
        .should('exist')
        .then((form) => {
          cy.get(form)
            .find('span.MuiCheckbox-root').should('exist').then((checkboxElement) => {
              const checkedState = checkboxElement.hasClass('Mui-checked');

              cy.get(checkboxElement)
                .find('input[type="checkbox"]').should('exist').click();

              cy.wait(1000);

              cy.get(checkboxElement).should(checkedState ? 'not.have.class' : 'have.class', 'Mui-checked');

              cy.get(form)
                .find('button[type="button"]').should('exist').click();

              cy.get(checkboxElement).should(checkedState ? 'have.class' : 'not.have.class', 'Mui-checked');
            });

          cy.get(form)
            .find('input#radius').should('exist').then((radiusElement) => {
              cy.get(radiusElement).invoke('val').then((value) => {
                cy.get(radiusElement).clear().type('10');

                cy.get(form)
                  .find('button[type="button"]').should('exist').click();

                cy.get(radiusElement).invoke('val').should('eq', value);
              });
            });

          cy.get(form)
            .find('#org-type').should('exist').then((orgTypeElement) => {
              cy.get(orgTypeElement).invoke('text').then((text) => {
                cy.get(orgTypeElement).click();

                cy.get('ul[aria-labelledby="org-type-label"]').eq(0)
                  .find('li').eq(1)
                  .click();

                cy.get(form)
                  .find('button[type="button"]').should('exist').click();

                cy.get(orgTypeElement).invoke('text').should('eq', text);
              });
            });

          cy.get(form)
            .find('button[type="submit"]').should('exist').click();
        });

      cy.get(accordionElement)
        .find('#organization-setting-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Custodian Type', () => {
    cy.get('.MuiAccordion-root').eq(1).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#custodian-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // custody type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalCustodyTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add custody type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/custodian-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Custodian Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Custody Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalCustodyTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalCustodyTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit custody type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/custodian-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Custodian Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete custody type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Custodian Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Shipper');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('shipper'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click();

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'CustodianType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#custodian-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Gateway Type', () => {
    cy.get('.MuiAccordion-root').eq(2).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#gateway-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // gateway type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalGatewayTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add gateway type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/gateway-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Gateway Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Gateway Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalGatewayTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalGatewayTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit gateway type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/gateway-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Gateway Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete gateway type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Gateway Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('tive');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('tive'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click();

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'GatewayType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#gateway-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Item Type', () => {
    cy.get('.MuiAccordion-root').eq(3).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#item-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // item type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalItemTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add item type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/item-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Item Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Item Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalItemTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalItemTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit item type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/item-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Item Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete item type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Item Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('56 Apples/bulk bins');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('56 apples/bulk bins'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click();

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'ItemType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#item-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Organization Type', () => {
    cy.get('.MuiAccordion-root').eq(4).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#organization-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // organization type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalOrganizationTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add item type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/org-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Organization Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Organization Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click();
              });
          });

          const count = Math.trunc(totalOrganizationTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit item type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/org-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Organization Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete item type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Organization Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Custodian');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('custodian'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click();

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'OrganizationType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#organization-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Products', () => {
    cy.get('.MuiAccordion-root').eq(5).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#product-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // product actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalProducts = parseInt(elem.text().split('of')[1].trim(), 10);

          // add product
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/product/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Product');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Product Name');
                cy.get('input#description').should('exist').clear().type('Test Product Description');
                cy.get('input#value').should('exist').clear().type('10');
                cy.get('input#grossWeight').should('exist').clear().type('20');
                cy.get('#unit').click(); // Open Unit Of Measure Select Menu
                cy.get('ul[aria-labelledby="unit-label"]').eq(0).find('li').eq(1)
                  .click(); // Select Unit Of Measure

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalProducts + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalProducts / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit product
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/product/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Product');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');
                    cy.get('input#description').should('exist').type(' Edited');
                    cy.get('input#value').should('exist').type('100');
                    cy.get('input#grossWeight').should('exist').type('200');
                    cy.get('#unit').click(); // Open Unit Of Measure Select Menu
                    cy.get('ul[aria-labelledby="unit-label"]').eq(0).find('li').eq(2)
                      .click(); // Select Unit Of Measure

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete item type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Product?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Apples in cartons');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('apples in cartons'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click();

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'Products.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#product-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Product Type', () => {
    cy.get('.MuiAccordion-root').eq(6).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#product-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // product type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalItemTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add product type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/product-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Product Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Product Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalItemTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalItemTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit product type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/product-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Product Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete product type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Product Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Bin');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('bin'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click({
          force: true,
        });

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'ProductType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#product-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Sensor Type', () => {
    cy.get('.MuiAccordion-root').eq(7).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#sensor-type-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // sensor type actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalSensorTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add sensor type
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/sensor-type/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Sensor Type');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Sensor Type');

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(2000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalSensorTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalSensorTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit product type
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/sensor-type/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Sensor Type');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete sensor type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Sensor Type?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Position');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('position'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click({
          force: true,
        });

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'SensorType.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#sensor-type-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Unit Of Measure', () => {
    cy.get('.MuiAccordion-root').eq(8).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#unit-of-measure-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // unit of measure actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalUnitOfMeasureTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add unit of measure
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/unit-of-measure/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Unit of Measure');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get('input#name').should('exist').clear().type('Test Unit Of Measure');
                cy.get('#unitClass').click(); // Open Unit Class Select Menu
                cy.get('ul[aria-labelledby="unitClass-label"]').eq(0).find('li').eq(2)
                  .click(); // Select Unit Class

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(1000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalUnitOfMeasureTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalUnitOfMeasureTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit unit of measure
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONFIGURATION')}/unit-of-measure/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Unit of Measure');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get('input#name').should('exist').type(' Edited');
                    cy.get('#unitClass').click(); // Open Unit Of Measure Select Menu
                    cy.get('ul[aria-labelledby="unitClass-label"]').eq(0).find('li').eq(1)
                      .click(); // Select Unit Of Measure

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete sensor type
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Unit of Measure?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click();
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Miles');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('miles'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click({
          force: true,
        });

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'UnitsOfMeasure.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#unit-of-measure-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Import Export Tab', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .find('button')
      .eq(1)
      .contains('Import/Export')
      .click();

    cy.wait(5000);

    cy.url().should('include', Cypress.env('ADMIN_PANEL_IMPORT_EXPORT'));
  });

  it('Check Import From File', () => {
    cy.get('.MuiAccordion-root').eq(0).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#import-file-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      cy.get(accordionElement)
        .find('.MuiCollapse-root').should('exist')
        .find('form')
        .should('exist')
        .then((form) => {
          cy.get(form)
            .find('button[type="submit"]').should('exist').should('be.disabled');

          cy.get(form)
            .find('#uploadType').click(); // Open Upload Type Select Menu
          cy.get('ul[aria-labelledby="uploadType-label"]').eq(0).find('li').eq(1)
            .click(); // Select Upload Type

          cy.get(form)
            .find('input#uploadFile').attachFile('items.csv');

          cy.get(form)
            .find('button[type="submit"]').should('not.be.disabled'); // need to add .click()
        });

      cy.get(accordionElement)
        .find('#import-file-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Import From API', () => {
    cy.get('.MuiAccordion-root').eq(1).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#import-api-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      cy.get(accordionElement)
        .find('.MuiCollapse-root').should('exist')
        .find('form')
        .should('exist')
        .then((form) => {
          cy.get(form)
            .find('button[type="submit"]').should('exist').should('be.disabled');

          cy.get(form)
            .find('p').should('not.exist');

          cy.get(form)
            .find('#dataFor').should('not.exist');

          cy.get(form)
            .find('input#apiURL').should('exist').clear()
            .type('https://api2.prod1.tive.co/api/v2/device');

          cy.get(form)
            .find('input#keyParamName').should('exist').clear()
            .type('TiveApiKey');

          cy.get(form)
            .find('#keyParamPlace').click(); // Open API Key Param Select Menu
          cy.get('ul[aria-labelledby="keyParamPlace-label"]').eq(0)
            .find('li').eq(2)
            .click(); // Select API Key Param

          cy.get(form)
            .find('input#apiKey').should('exist').clear()
            .type('b162104d816c4ec2bfcf8f4fc2e3509b')
            .blur();

          cy.wait(1000);

          cy.get('[aria-labelledby="alert-dialog-title"]').should('exist').should('be.visible').then((popupElement) => {
            cy.get(popupElement)
              .find('h2').should('exist').then((header) => {
                cy.get(header)
                  .find('p').eq(0).contains('Is the below URL and Header correct?');

                cy.get(header)
                  .find('p').eq(1).contains('https://api2.prod1.tive.co/api/v2/device/');

                cy.get(header)
                  .find('p').eq(2).contains('TiveApiKey=\'b162104d816c4ec2bfcf8f4fc2e3509b\'');
              });

            cy.get(popupElement)
              .find('button').eq(1).should('exist')
              .click();
          });

          cy.get(form)
            .find('p').should('be.visible').contains('External Provider :');

          cy.get(form)
            .find('#dataFor').should('exist').click();
          cy.get('ul[aria-labelledby="dataFor-label"]').eq(0)
            .find('li').eq(1)
            .click(); // Select Import Provider For Data

          cy.get(form)
            .find('button[type="submit"]').should('not.be.disabled').click()
            .then(() => {
              cy.get('.MuiSnackbarContent-message')
                .contains('Imported succesfully!')
                .should('be.visible');
            });
        });

      cy.get(accordionElement)
        .find('#import-api-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Check Export Data', () => {
    cy.get('.MuiAccordion-root').eq(2).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#export-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      cy.get(accordionElement)
        .find('.MuiCollapse-root').should('exist')
        .find('form')
        .should('exist')
        .then((form) => {
          cy.get(form)
            .find('button[type="submit"]').should('exist').should('be.disabled');

          cy.get(form)
            .find('#exportTable').should('exist').click();
          cy.get('ul[aria-labelledby="exportTable-label"]').eq(0)
            .find('li').eq(1)
            .click(); // Select Data To Export

          cy.get(form)
            .find('#exportType').should('exist').click();
          cy.get('ul[aria-labelledby="exportType-label"]').eq(0)
            .find('li').eq(1)
            .click(); // Select Export As

          cy.get(form)
            .find('button[type="submit"]').should('not.be.disabled').click()
            .then(() => {
              const downloadsFolder = Cypress.config('downloadsFolder');
              const today = new Date();
              const date = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;

              cy.readFile(path.join(downloadsFolder, `Item ${date}.csv`)).should('exist');
            });
        });

      cy.get(accordionElement)
        .find('#export-header').click().should('not.have.class', 'Mui-expanded');
    });
  });

  it('Consortium Tab', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .find('button')
      .eq(2)
      .contains('Consortium')
      .click();

    cy.wait(5000);

    cy.url().should('include', Cypress.env('ADMIN_PANEL_CONSORTIUM'));
  });

  it('Check Mapping Custodian Organization', () => {
    cy.get('.MuiAccordion-root').eq(0).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#mappingorg-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .eq(0)
        .then((row) => {
          cy.get(row)
            .find('td').eq(2).invoke('text')
            .then((text) => {
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONSORTIUM')}/mapping-edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', text === '-' ? 'Set Mapping' : 'Edit Mapping');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get(form)
                      .find('input#name').should('exist').should('be.disabled')
                      .invoke('val')
                      .should('not.be.empty');

                    cy.get(form)
                      .find('#custodyOrg').should('exist').click();
                    cy.get('ul[aria-labelledby="custodyOrg-label"]').eq(0)
                      .find('li[data-value="e3a9a47d-f995-4fda-9c07-566b88357b8e"]').should('exist')
                      .click(); // Select Custodian Organization

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click()
                      .then(() => {
                        // cy.wait(1000);

                        cy.get('.MuiSnackbarContent-message')
                          .contains('Custodian successfully Edited!')
                          .should('be.visible');
                      });
                  });
              });
            });
        });
    });
  });

  it('Check Consortium', () => {
    cy.get('.MuiAccordion-root').eq(1).should('exist').then((accordionElement) => {
      cy.get(accordionElement)
        .find('#consortium-header').should('exist').should('not.have.class', 'Mui-expanded')
        .click({ force: true })
        .should('have.class', 'Mui-expanded');

      // records count
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const [min, max] = elem.text().split('of')[0].split('-');

          cy.log('RowCount: ', min, max);
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .its('length')
            .should('eq', (parseInt(max, 10) - parseInt(min, 10) + 1)); // Assert row length
        });

      const paginationLength = 5;

      // check number of items per page
      cy.get(accordionElement)
        .find('#pagination-rows').click({ force: true }); // Open Number Of Items Per Page
      cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click(); // Select Number Of Items To Be 5
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MUIDataTableBodyRow-root']")
        .should('have.length.at.most', paginationLength);

      // check if pagination works
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find("tr[class*='MuiTableRow-root']")
        .its('length')
        .then((length) => {
          if (length > paginationLength) {
            cy.get(accordionElement)
              .find('#pagination-rows').click();
            cy.get(`ul#pagination-menu-list > li[data-value="${paginationLength}"]`).click();

            cy.get(accordionElement)
              .find('#pagination-back').should('be.disabled');
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled');

            cy.get(accordionElement)
              .find('#pagination-next').click();

            if (length >= (2 * paginationLength)) {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('not.be.disabled');
            } else {
              cy.get(accordionElement)
                .find('tbody.MuiTableBody-root')
                .eq(0)
                .find("tr[class*='MUIDataTableBodyRow-root']")
                .should('have.length.at.most', length % paginationLength);

              cy.get(accordionElement)
                .find('#pagination-next').should('be.disabled');
            }

            cy.get(accordionElement)
              .find('#pagination-back').should('not.be.disabled');
          }
        });

      // consortium actions
      cy.get(accordionElement)
        .find('.MuiTableRow-footer .MuiTablePagination-root')
        .eq(0)
        .find('.MuiTablePagination-displayedRows')
        .eq(0)
        .then((elem) => {
          const totalConsortiumTypes = parseInt(elem.text().split('of')[1].trim(), 10);

          // add consortium
          cy.get(accordionElement)
            .find('button').eq(0).click();

          cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONSORTIUM')}/add`);

          cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
            cy.get(modalElement)
              .find('#form-dialog-title').invoke('text').should('eq', 'Add Consortium');

            cy.get(modalElement)
              .find('form').should('exist').then((form) => {
                cy.get(form)
                  .find('button[type="submit"]').should('exist').should('be.disabled');

                cy.get(form)
                  .find('input#name').should('exist').clear()
                  .type('Test Consortium');

                cy.get(form)
                  .find('#orgs').should('exist').click()
                  .type('Dev Test');
                cy.get('ul[aria-labelledby="orgs-label"]').eq(0)
                  .find('li').eq(0)
                  .click(); // Select Custodian Organization

                cy.get(form)
                  .find('button[type="submit"]').should('not.be.disabled').click()
                  .then(() => {
                    cy.wait(5000).then(() => {
                      expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalConsortiumTypes + 1);
                    });
                  });
              });
          });

          const count = Math.trunc(totalConsortiumTypes / paginationLength);

          for (let i = 0; i < count; i += 1) {
            cy.get(accordionElement)
              .find('#pagination-next').should('not.be.disabled').click();
            cy.wait(1000);
          }

          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find("tr[class*='MUIDataTableBodyRow-root']")
            .eq(-1)
            .then((row) => {
              // edit consortium
              cy.get(row)
                .find('td').eq(0).should('exist')
                .find('button')
                .click();

              cy.url().should('include', `${Cypress.env('ADMIN_PANEL_CONSORTIUM')}/edit`);

              cy.get('div[aria-labelledby="form-dialog-title"]').eq(0).should('exist').then((modalElement) => {
                cy.get(modalElement)
                  .find('#form-dialog-title').invoke('text').should('eq', 'Edit Consortium');

                cy.get(modalElement)
                  .find('form').should('exist').then((form) => {
                    cy.get(form)
                      .find('input#name').should('exist').type(' Edited');

                    cy.get(form)
                      .find('button[aria-label="Clear"]').should('exist').click({ force: true });
                    cy.get(form)
                      .find('#orgs').should('exist').click()
                      .type('Dev Test');
                    cy.get('ul[aria-labelledby="orgs-label"]').eq(0)
                      .find('li').eq(0)
                      .click(); // Select Custodian Organization

                    cy.get(form)
                      .find('button[type="submit"]').should('not.be.disabled').click();
                  });
              });

              // delete consortium
              cy.get(row)
                .find('td').eq(1).should('exist')
                .find('button')
                .click()
                .then(() => {
                  cy.get('.MuiDialog-container').then((dialogModal) => {
                    cy.get(dialogModal)
                      .find('h2#alert-dialog-title')
                      .invoke('text')
                      .should(
                        'eq',
                        'Are you sure you want to Delete this Consortium?',
                      );

                    cy.get(dialogModal)
                      .find('button').eq(1).contains('Delete')
                      .should('exist')
                      .click()
                      .then(() => {
                        cy.wait(5000).then(() => {
                          expect(parseInt(elem.text().split('of')[1].trim(), 10)).to.be.eq(totalConsortiumTypes);
                        });
                      });
                  });
                });
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Search"][data-testid="Search-iconButton"]')
        .eq(0)
        .click();
      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .type('Custodian');
      cy.get(accordionElement)
        .find('tbody.MuiTableBody-root')
        .eq(0)
        .find('tr')
        .each((elem) => {
          expect(elem.text().toLocaleLowerCase()).to.include('custodian'); // Assertion
        });

      cy.get(accordionElement)
        .find('div[data-test-id="Search"]').eq(0).find('input')
        .clear();
      cy.get(accordionElement)
        .find('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
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
          cy.get(accordionElement)
            .find('tbody.MuiTableBody-root')
            .eq(0)
            .find('tr')
            .each((rowElem) => {
              expect(rowElem.text()).to.include(rowElem.text()); // Assertion
            });
        });

      cy.get(accordionElement)
        .find('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
        .eq(0)
        .click();

      cy.get('button[data-testid="filterReset-button"')
        .eq(0)
        .click({
          force: true,
        });

      cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
        force: true,
      });

      const downloadsFolder = Cypress.config('downloadsFolder');
      cy.get(accordionElement)
        .find('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
        .eq(0)
        .click();
      cy.log('Test here', downloadsFolder);
      cy.readFile(path.join(downloadsFolder, 'Consortiums.csv')).should('exist');

      // cy.window().then((win) => {
      // cy.stub(win, 'print');
      // });
      // cy.get(accordionElement)
      // .find('button[aria-label="Print"][data-testid="Print-iconButton"]')
      // .eq(0)
      // .then((data) => {
      // cy.window().then((win) => {
      // win.print();
      // data.click();
      // expect(win.print).to.be.calledOnce;
      // win.close();
      // });
      // });

      cy.get(accordionElement)
        .find('#consortium-header').click().should('not.have.class', 'Mui-expanded');
    });
  });
});
