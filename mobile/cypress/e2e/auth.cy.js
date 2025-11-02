describe('Authentication', () => {
  it('shows login screen', () => {
    cy.visit('/');
    cy.contains('Login').should('be.visible');
  });

  it('can login successfully', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { access_token: 'test-token' },
    }).as('login');
    cy.visit('/');
    cy.get('input[placeholder*="Email"]').type('theotimecollier@gmail.com');
    cy.get('input[placeholder*="Password"]').type('12345678');
    cy.get('[data-testid="loginButton"]').click();
    cy.wait('@login');
  });

  it('shows register screen', () => {
    cy.visit('/');
    cy.contains('CreateAccount').click();
    cy.contains('Register').should('be.visible');
  });

  it('can logout', () => {
    cy.login();
    cy.stubServices(true);
    cy.visit('/');

    cy.contains('Profile').click();
    cy.contains('Logout').click();
    cy.contains('Login').should('be.visible');
  });
});
