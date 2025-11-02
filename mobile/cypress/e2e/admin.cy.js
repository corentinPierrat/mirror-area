describe('Admin dashboard', () => {
  beforeEach(() => {
    cy.login({
      me: { id: 2, username: 'admin', email: 'admin@example.com', role: 'admin' },
    });

    cy.intercept('GET', '**/admin/stats', {
      statusCode: 200,
      body: { totalUsers: 10, activeUsers: 8 },
    }).as('getAdminStats');

    cy.intercept('GET', '**/admin/users', {
      statusCode: 200,
      body: [{ id: 1, email: 'admin@example.com', role: 'admin' }],
    }).as('getAdminUsers');
  });

  it('opens Admin and shows stats and users', () => {
    cy.visit('/');

    cy.get('[data-testid="adminButton"]').click();

    cy.wait('@getAdminStats');
    cy.wait('@getAdminUsers');

    cy.contains('Total Users').should('be.visible');
    cy.contains('Users').should('be.visible');
    cy.contains('admin@example.com').should('be.visible');
  });
});
