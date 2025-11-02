describe('My Workflows', () => {
  beforeEach(() => {
    cy.login();
    cy.stubServices(true);
    cy.stubWorkflows();

    cy.fixture('actions.json').as('actions');
    cy.fixture('reactions.json').as('reactions');

    cy.get('@actions').then((actions) => {
      cy.intercept('GET', '**/catalog/actions', {
        statusCode: 200,
        body: actions,
      }).as('getActions');
    });

    cy.get('@reactions').then((reactions) => {
      cy.intercept('GET', '**/catalog/reactions', {
        statusCode: 200,
        body: reactions,
      }).as('getReactions');
    });
  });

  it('displays my workflows', () => {
    cy.visit('/');
    cy.contains('My Workflows').click();
    cy.wait('@getWorkflows');

    cy.contains('Discord to Spotify').should('be.visible');
  });

  it('toggles workflow active state', () => {
    cy.intercept('PATCH', '**/workflows/**/toggle', {
      statusCode: 200,
      body: { active: false },
    }).as('toggle');

    cy.visit('/');
    cy.contains('My Workflows').click();
    cy.wait('@getWorkflows');

    cy.get('input[type="checkbox"]').first().click({ force: true });
    cy.wait('@toggle');
  });

  it('opens edit modal', () => {
    cy.visit('/');
    cy.contains('My Workflows').click();
    cy.wait('@getWorkflows');

    cy.get('[data-testid="editButton"]').click();

    cy.wait('@getActions');
    cy.wait('@getReactions');

    cy.contains('Modifier le workflow').should('be.visible');
  });

  it('deletes a workflow', () => {
    cy.intercept('DELETE', '**/workflows/**', {
      statusCode: 204,
    }).as('deleteWorkflow');

    cy.visit('/');
    cy.contains('My Workflows').click();
    cy.wait('@getWorkflows');

    cy.get('[data-testid="deletebutton"]').first().click();
    cy.wait('@deleteWorkflow');
  });
});
