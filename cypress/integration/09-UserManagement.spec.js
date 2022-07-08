/* eslint-disable cypress/no-unnecessary-waiting */
// Covers all test cases on Dashboard page

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "login"
// will resolve to "cypress/support/index.d.ts"
/// <reference types="../support" />

context('User Management', () => {
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
      .eq(1)
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
    cy.get('.MuiTypography-h4').eq(0).invoke('text').should('eq', 'People using this system'); // Check for Page Title
  });

  it('Check Initial Page Tabs', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .then((element) => {
        cy.get(element).find('button').eq(0)
          .should('have.class', 'Mui-selected')
          .should('have.attr', 'aria-selected', 'true')
          .contains('Current users');
        cy.get(element).find('button').eq(1)
          .should('not.have.class', 'Mui-selected')
          .should('have.attr', 'aria-selected', 'false')
          .contains('User groups');
      });
  });

  it('Check Column Labels', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .find('button')
      .eq(0)
      .contains('Current users')
      .click();

    cy.wait(5000);

    cy.url().should('include', Cypress.env('USER_MANAGEMENT_CURRENT_USER'));

    cy.get('thead.MuiTableHead-root').should('exist')
      .find('tr.MuiTableRow-root').should('exist')
      .children()
      .then((elements) => {
        const { length } = elements;
        let i = 0;

        cy.get(elements[i]).contains('Full Name', { matchCase: false });
        i += 1;
        cy.get(elements[i]).contains('Email', { matchCase: false });
        i += 1;

        if (length === 6) {
          cy.get(elements[i]).contains('Organization Name', { matchCase: false });
          i += 1;
        } else {
          i -= 1;
        }

        cy.get(elements[i]).contains('Last Activity', { matchCase: false });
        i += 1;
        cy.get(elements[i]).contains('Permissions', { matchCase: false });
        i += 1;
        cy.get(elements[i]).contains('Actions', { matchCase: false });
      });
  });

  it('Check For Empty Column In A Row', () => {
    cy.get('tbody.MuiTableBody-root').should('exist')
      .children()
      .then((elements) => {
        const { length } = elements;

        if (length > 1) {
          cy.get(elements[1]).children().then((children) => {
            for (let i = 0; i < children.length; i += 1) {
              cy.get(children[i]).should('not.be.empty');
            }
          });
        }
      });
  });

  it('Check User Actions', () => {
    cy.get('tbody.MuiTableBody-root').should('exist')
      .children()
      .then((elements) => {
        const { length } = elements;

        if (length > 1) {
          cy.get(elements[1]).children().then((children) => {
            const numberOfColumns = children.length;
            cy.get(children[numberOfColumns - 1]).find('button').then((button) => {
              cy.get(button).invoke('attr', 'aria-controls').then((id) => {
                cy.get(button).click({ force: true });

                cy.get(`#${id}`).should('exist')
                  .find('.MuiPaper-root').should('exist')
                  .find('ul.MuiList-root')
                  .should('exist')
                  .find('li.MuiMenuItem-root')
                  .eq(0)
                  .should('exist')
                  .then((actionButton) => {
                    cy.get(actionButton).invoke('text').then((innerText) => {
                      if (innerText === 'Deactivate') {
                        cy.get(children[numberOfColumns - 2])
                          .find('.MuiButtonGroup-root').should('exist').then((buttonGroup) => {
                            const numberOfRoles = buttonGroup.children().length;

                            cy.get(buttonGroup).find('button').eq(0).should('not.be.disabled')
                              .then((confirmBtn) => {
                                cy.get(`#${id}`).click();
                                cy.get(confirmBtn).click().should('have.class', 'MuiButton-contained');
                                cy.get(confirmBtn).siblings('.MuiButton-outlined').should('have.length', numberOfRoles - 1);
                              });
                          });
                      } else {
                        cy.get(children[numberOfColumns - 2])
                          .find('.MuiButtonGroup-root').should('exist')
                          .find('button')
                          .eq(0)
                          .should('be.disabled');

                        cy.get(actionButton).click();

                        cy.get(children[numberOfColumns - 2])
                          .find('.MuiButtonGroup-root').should('exist')
                          .find('button')
                          .eq(0)
                          .should('not.be.disabled');

                        // Delete doesn't work yet - 405 error
                        // cy.get(`#${id}`).should('exist')
                        // .find('.MuiPaper-root').should('exist')
                        // .find('ul.MuiList-root').should('exist')
                        // .find('li.MuiMenuItem-root').eq(1).should('exist')
                        //         .then((deleteButton) => {
                        //       deleteButton.click();
                        // });
                      }
                    });
                  });
              });
            });
          });
        }
      });
  });

  it('Invite User', () => {
    cy.get('h4.MuiTypography-root').siblings('button').should('contain', 'Invite Users').click();

    cy.get('.popup-content').find('form').then((formElement) => {
      cy.get(formElement)
        .find('h6.MuiTypography-root').invoke('text').should('eq', 'Invite users to platform');

      cy.get(formElement)
        .find('#email').should('exist').clear()
        .type('test@abc.com');

      cy.get(formElement)
        .find('button[type="submit"]').should('exist').click();

      cy.wait(2000);

      cy.get('.MuiSnackbarContent-message')
        .contains('Invitations sent successfully')
        .should('be.visible'); // Assert if DOM element is seen

      cy.get('.popup-overlay').click();
    });
  });

  let totalInitialRows;

  it('Add User Group', () => {
    cy.get('.MuiTabs-fixed').eq(0).should('exist')
      .find('div[role="tablist"]')
      .should('exist')
      .find('button')
      .eq(1)
      .contains('User groups')
      .click();

    cy.wait(5000);

    cy.url().should('include', Cypress.env('USER_MANAGEMENT_USER_GROUP'));

    cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
      .should('exist')
      .then((mainBoxElement) => {
        totalInitialRows = mainBoxElement.find('tbody').children('tr').length;

        mainBoxElement.find('button').eq(0).click();

        cy.get(mainBoxElement).find('tbody').children('tr').should('have.length', totalInitialRows + 1);
      });
  });

  it('Change User Group Name', () => {
    cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
      .find('tbody')
      .children('tr')
      .eq(totalInitialRows)
      .should('exist')
      .then((addedUserGroup) => {
        cy.get(addedUserGroup)
          .find('td').eq(0).then((userGroupName) => {
            cy.get(userGroupName).find('p').invoke('text').should('eq', 'custom');

            cy.get(userGroupName).find('svg[data-testid="EditIcon"]').should('exist').click({ force: true });

            cy.get(userGroupName).find('input[type="text"]').clear().type('New Test User Group');

            cy.get(userGroupName).click();
          });
      });
  });

  it('Check Default Permissions', () => {
    cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
      .find('tbody')
      .children('tr')
      .eq(totalInitialRows)
      .should('exist')
      .then((addedUserGroup) => {
        cy.get(addedUserGroup)
          .find('td').eq(1)
          .find('input')
          .then((checkSlider) => {
            cy.get(checkSlider).should('not.be.checked');
          });

        cy.get(addedUserGroup)
          .find('td').eq(2)
          .find('input')
          .then((checkSlider) => {
            cy.get(checkSlider).should('be.checked');
          });

        cy.get(addedUserGroup)
          .find('td').eq(3)
          .find('input')
          .then((checkSlider) => {
            cy.get(checkSlider).should('not.be.checked');
          });

        cy.get(addedUserGroup)
          .find('td').eq(4)
          .find('input')
          .then((checkSlider) => {
            cy.get(checkSlider).should('not.be.checked');
          });
      });
  });

  it('Reverse User Group Permissions', () => {
    cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
      .find('tbody')
      .children('tr')
      .eq(totalInitialRows)
      .should('exist')
      .then((addedUserGroup) => {
        for (let i = 1; i <= 4; i += 1) {
          cy.get(addedUserGroup)
            .find('td').eq(i)
            .find('input')
            .click({ force: true });

          cy.wait(5000);
        }

        cy.get(addedUserGroup)
          .find('td').eq(1)
          .find('input')
          .should('be.checked');

        cy.get(addedUserGroup)
          .find('td').eq(2)
          .find('input')
          .should('not.be.checked');

        cy.get(addedUserGroup)
          .find('td').eq(3)
          .find('input')
          .should('be.checked');

        cy.get(addedUserGroup)
          .find('td').eq(4)
          .find('input')
          .should('be.checked');
      });
  });

  it('Delete User Group', () => {
    cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
      .find('tbody')
      .children('tr')
      .eq(totalInitialRows)
      .should('exist')
      .then((addedUserGroup) => {
        cy.get(addedUserGroup)
          .find('td').eq(5)
          .find('button')
          .then((button) => {
            cy.get(button).click();
            cy.get(button).invoke('attr', 'aria-controls').then((id) => {
              cy.get(`#${id}`).should('exist')
                .find('.MuiPaper-root').should('exist')
                .find('ul.MuiList-root')
                .should('exist')
                .find('li.MuiMenuItem-root')
                .eq(0)
                .should('exist')
                .then((deleteButton) => {
                  deleteButton.click();

                  cy.wait(5000);

                  cy.get('h4.MuiTypography-root').parent().siblings().eq(1)
                    .find('tbody')
                    .children('tr')
                    .eq(totalInitialRows - 1);
                });
            });
          });
      });
  });
});
