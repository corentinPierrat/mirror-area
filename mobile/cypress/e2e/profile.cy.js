describe('Profile', () => {
  beforeEach(() => {
    cy.login();
    cy.stubServices(true);
  });

  it('displays profile screen', () => {
    cy.visit('/');
    cy.contains('Profile').click();

    cy.contains('testuser').should('be.visible');
  });

  it('can change password', () => {
    cy.intercept('PATCH', '**/auth/change-password', {
      statusCode: 200,
      body: { message: 'Password updated' },
    }).as('changePassword');

    cy.visit('/');
    cy.contains('Profile').click();

    cy.get('input[placeholder*="Current Password"]').type('oldpass123');
    cy.get('input[placeholder*="New Password"]').type('newpass123');
    cy.get('[data-testid="changepasswordButton"]').click();

    cy.wait('@changePassword');
  });

  it('shows language switcher', () => {
    cy.visit('/');
    cy.contains('Profile').click();

    cy.get('[data-testid="languageSwitcher"]').should('exist');
  });
});
