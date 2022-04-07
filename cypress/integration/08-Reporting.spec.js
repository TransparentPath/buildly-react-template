/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

const path = require('path');

context('Reporting', () => {
  const shipmentName = 'Dev-Test-Tive';

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
    cy.get('nav ul.MuiList-root .MuiListItemText-root').eq(4).should('exist').click();
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.url().should('include', Cypress.env('REPORTING'));
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Check for UI', () => {
    cy.get('header img').should('have.attr', 'src', '/ff52ab9d5b614f04101dcc68a3d253e7.png'); // Check for Logo
    cy.get('.MuiTypography-h4').eq(0).invoke('text').should('eq', 'Reporting'); // Check for Page Title
  });

  const selectShipment = (wait = false) => {
    if (wait) {
      cy.wait(10000);
    }

    cy.get('#shipment-name').should('exist').click();
    cy.get('[aria-labelledby="shipment-name-label"]').find('li').contains(shipmentName).should('exist')
      .click();
  };

  it('Shipment Name Matches Headings', () => {
    selectShipment(true);

    cy.get('h5.MuiTypography-h5').eq(0).contains(shipmentName, { matchCase: false });
    cy.get('h5.MuiTypography-h5').eq(1).contains(shipmentName, { matchCase: false });
    cy.get('h5.MuiTypography-h5').eq(2).contains(shipmentName, { matchCase: false });
    cy.get('h5.MuiTypography-h5').eq(3).contains(shipmentName, { matchCase: false });

    cy.get('h6.MuiTypography-h6').eq(0).then((element) => {
      expect(element.text()).to.include('Shipment Name');
      expect(element.siblings('p.MuiTypography-body1').text()).to.include(shipmentName);
    });
  });

  it('Shipment Map Is Visible', () => {
    selectShipment();

    cy.get('.gm-style').eq(0).find('iframe').should('exist');
  });

  it('Check Graph View', () => {
    selectShipment();

    cy.get('h5.MuiTypography-h5').eq(1).contains('Graph View', { matchCase: false });

    const graphNavSelector = 'nav[aria-label="main graph-type"]';
    cy.get(graphNavSelector).should('exist').children().should('have.length', 7);

    const graphNavItems = ['Temperature', 'Light', 'Shock', 'Tilt', 'Humidity', 'Battery', 'Pressure'];
    for (let i = 0; i < 7; i += 1) {
      cy.get(graphNavSelector).find('div[role="button"]').eq(i).should('exist')
        .find('svg')
        .should('exist')
        .find('title')
        .should('exist')
        .invoke('text')
        .should('eq', graphNavItems[i]);
      cy.get(graphNavSelector).find('div[role="button"]').eq(i).click();
      cy.get('canvas.chartjs-render-monitor').should('exist');
    }
  });

  it('Record Count - Sensor Report', () => {
    selectShipment();

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

  it('Check Number Of Items Per Page Control - Sensor Report', () => {
    selectShipment();

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

  it('Check Pagination Button - Sensor Report', () => {
    selectShipment();

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

  it('Search Sensor', () => {
    selectShipment();

    const sensorLatitude = '45.48';

    cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
      .type(sensorLatitude);
    cy.get('tbody.MuiTableBody-root')
      .eq(0)
      .find('tr')
      .each((elem) => {
        expect(elem.text().toLocaleLowerCase()).to.include(sensorLatitude); // Assertion
      });

    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
    cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();
  });

  it('Filter Sensor Report', () => {
    cy.wait(5000);

    selectShipment();

    cy.get('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
      .eq(0)
      .click();
    cy.get('div[class*="MUIDataTableFilter-root"]')
      .eq(0)
      .find('#mui-component-select-timestamp')
      .click();
    cy.get('div#menu-timestamp li')
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

  it('Download Sensor - Sensor Report', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
      .eq(0)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'AggregateReportData.csv')).should('exist');
  });

  // it('Print records - Sensor Report', () => {
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

  it('Record Count - Shipment Alerts', () => {
    selectShipment();

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

  it('Check Number Of Items Per Page Control - Shipment Alerts', () => {
    selectShipment();

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

  it('Check Pagination Button - Shipment Alerts', () => {
    selectShipment();

    cy.get('tbody.MuiTableBody-root')
      .eq(1)
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

  it('Search Shipment Alerts', () => {
    selectShipment();

    const parameterType = 'Humidity'.toLocaleLowerCase();

    cy.get('button[aria-label="Search"][data-testid="Search-iconButton"]')
      .eq(1)
      .click();
    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear()
      .type(parameterType);
    cy.get('tbody.MuiTableBody-root')
      .eq(1)
      .find('tr')
      .each((elem) => {
        expect(elem.text().toLocaleLowerCase()).to.include(parameterType); // Assertion
      });

    cy.get('div[data-test-id="Search"]').eq(0).find('input').clear();
    cy.get('button[class*=MUIDataTableSearch-clearIcon]').should('exist').click();
  });

  it('Filter Sensor Report', () => {
    cy.wait(5000);

    selectShipment();

    cy.get('button[aria-label="Filter Table"][data-testid="Filter Table-iconButton"]')
      .eq(1)
      .click();
    cy.get('div[class*="MUIDataTableFilter-root"]')
      .eq(0)
      .find('#mui-component-select-id')
      .click();
    cy.get('div#menu-id li')
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
      .eq(1)
      .click();

    cy.get('button[data-testid="filterReset-button"')
      .eq(0)
      .click();

    cy.get('button[class*=MUIDataTableToolbar-filterCloseIcon]').click({
      force: true,
    });
  });

  it('Download Shipment - Shipment Alerts', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('button[aria-label="Download CSV"][data-testid="DownloadCSV-iconButton"]')
      .eq(1)
      .click();
    cy.log('Test here', downloadsFolder);
    cy.readFile(path.join(downloadsFolder, 'ShipmentAlerts.csv')).should('exist');
  });

  // it('Print records - Shipment Alerts', () => {
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
