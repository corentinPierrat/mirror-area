describe('Create Workflow', () => {
  beforeEach(() => {
    cy.login();
    cy.stubServices(true);

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

  it('displays create workflow screen', () => {
    cy.visit('/');
    cy.contains('Create Workflow').click();

    cy.contains('Action').should('be.visible');
    cy.contains('Reaction').should('be.visible');
  });

  it('creates a workflow', () => {
    cy.intercept('POST', '**/workflows/', {
      statusCode: 201,
      body: { id: 999, name: 'My Test Workflow' },
    }).as('postWorkflow');

    cy.visit('/');
    cy.contains('Create Workflow').click();

    cy.get('input[placeholder*="Workflow Name"]').type('My Test Workflow');

    cy.contains('Action').click();
    cy.wait('@getActions');
    cy.contains('On Message').click();
    cy.get('input[placeholder*="Channel"]').type('general', { force: true });
    cy.get('[data-testid="SaveButtonAction"]').click();

    cy.contains('Reaction').click();
    cy.wait('@getReactions');
    cy.contains('Add to playlist').click();
    cy.get('input[placeholder*="Playlist"]').type('Party', { force: true });
    cy.get('[data-testid="SaveButtonReaction"]').click();

    cy.get('[data-testid="buttonCreateWorkflow"]').click();
    cy.wait('@postWorkflow');
  });

  it('shows error without action or reaction', () => {
    cy.visit('/');
    cy.contains('Create Workflow').click();

    cy.get('[data-testid="buttonCreateWorkflow"]').click();
    cy.contains(/select/i).should('be.visible');
  });
});
