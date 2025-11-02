// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Add custom commands here

Cypress.Commands.add('login', (overrides = {}) => {
	// Simulate user being logged in by setting AsyncStorage key used by the app
	window.localStorage.setItem('userToken', overrides.token || 'test-token');

	// Stub /auth/me to return a user
	cy.intercept('GET', '**/auth/me', {
		statusCode: 200,
		body: overrides.me || {
			id: 1,
			username: 'testuser',
			email: 'test@example.com',
			role: 'user',
		},
	}).as('getMe');
});

Cypress.Commands.add('stubServices', (connected = true) => {
	cy.fixture('services.json').then((services) => {
		// apply connected flag
		services.services = services.services.map(s => ({ ...s, connected }))
		cy.intercept('GET', '**/oauth/services', { statusCode: 200, body: services }).as('getServices');
	});
});

Cypress.Commands.add('stubCatalog', () => {
	cy.fixture('actions.json').as('actions');
	cy.fixture('reactions.json').as('reactions');
	cy.intercept('GET', '**/catalog/actions', (req) => {
		req.reply({ statusCode: 200, body: Cypress.getAlias('@actions') });
	}).as('getActions');
	cy.intercept('GET', '**/catalog/reactions', (req) => {
		req.reply({ statusCode: 200, body: Cypress.getAlias('@reactions') });
	}).as('getReactions');
});

Cypress.Commands.add('stubWorkflows', () => {
	cy.fixture('workflows.json').then((workflows) => {
		cy.intercept('GET', '**/workflows/', { statusCode: 200, body: workflows }).as('getWorkflows');
	});
});

Cypress.Commands.add('stubFeed', () => {
	cy.fixture('feed_workflows.json').then((feed) => {
		cy.intercept('GET', '**/feed/workflows', { statusCode: 200, body: feed }).as('getFeed');
	});
});

Cypress.Commands.add('stubAdmin', () => {
	cy.fixture('admin_users.json').then((users) => {
		cy.intercept('GET', '**/admin/users', { statusCode: 200, body: users }).as('getAdminUsers');
	});
	cy.fixture('admin_stats.json').then((stats) => {
		cy.intercept('GET', '**/admin/stats', { statusCode: 200, body: stats }).as('getAdminStats');
	});
});