describe('Services', () => {
  beforeEach(() => {
    cy.login();
    cy.stubServices(true);
  });

  it('displays services list', () => {
    cy.visit('/');
    cy.contains('Services').click();
    cy.wait('@getServices');

    cy.get('img').should('have.length.at.least', 2);
  });

});