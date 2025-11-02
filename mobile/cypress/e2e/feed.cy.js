describe('Feed', () => {
  beforeEach(() => {
    cy.login();
    cy.stubServices(true);
    cy.stubFeed();
  });

  it('displays public workflows', () => {
    cy.visit('/');
    cy.contains('Feed').click();
    cy.wait('@getFeed');

    cy.contains('Public Discord to Spotify').should('be.visible');
  });

  it('shows author information', () => {
    cy.visit('/');
    cy.contains('Feed').click();
    cy.wait('@getFeed');

    cy.contains('Public Discord to Spotify').should('be.visible');
  });

  it('can add workflow from feed', () => {
    cy.intercept('POST', '**/workflows/', {
      statusCode: 201,
      body: { id: 1000 }
    }).as('postFromFeed');

    cy.visit('/');
    cy.contains('Feed').click();
    cy.wait('@getFeed');

    cy.on('window:alert', (text) => {
      expect(text).to.contain('Added');
    });

    cy.get('[data-testid="addButton"]').click();
    cy.wait('@postFromFeed');
  });
});