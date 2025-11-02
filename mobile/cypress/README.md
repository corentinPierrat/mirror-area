# Tests Cypress - Application Mobile

## Tests disponibles

Les tests couvrent toutes les fonctionnalités principales de l'application :

### 1. Authentication (`auth.cy.js`)
- Affichage de l'écran de login
- Connexion réussie
- Navigation vers l'écran d'inscription
- Déconnexion

### 2. Feed (`feed.cy.js`)
- Affichage des workflows publics
- Affichage des informations d'auteur
- Ajout d'un workflow du feed à "Mes workflows"

### 3. Create Workflow (`create_workflow.cy.js`)
- Affichage de l'écran de création
- Création complète d'un workflow
- Validation des erreurs

### 4. My Workflows (`my_workflows.cy.js`)
- Affichage de la liste des workflows
- Activation/Désactivation d'un workflow
- Ouverture du modal d'édition
- Suppression d'un workflow

### 5. Services (`services.cy.js`)
- Affichage de la liste des services
- Affichage des logos des services

### 6. Profile (`profile.cy.js`)
- Affichage du profil
- Changement de mot de passe
- Sélecteur de langue

### 7. Admin (`admin.cy.js`)
- Accès au dashboard admin (pour utilisateurs admin)
- Affichage des statistiques

## Commandes personnalisées

Les commandes Cypress personnalisées sont définies dans `cypress/support/commands.js` :

- `cy.login()` - Simule un utilisateur connecté
- `cy.stubServices(connected)` - Mock l'API des services
- `cy.stubCatalog()` - Mock le catalogue d'actions/réactions
- `cy.stubWorkflows()` - Mock la liste des workflows
- `cy.stubFeed()` - Mock le feed de workflows publics
- `cy.stubAdmin()` - Mock les données admin

## Lancer les tests

### Mode interactif
```bash
npm run cypress:open
```

### Mode headless (CI)
```bash
npm run cypress:run
```

## Structure des fixtures

Les données de test sont dans `cypress/fixtures/` :
- `services.json` - Liste des services disponibles
- `actions.json` - Catalogue d'actions
- `reactions.json` - Catalogue de réactions
- `workflows.json` - Workflows de l'utilisateur
- `feed_workflows.json` - Workflows publics du feed
- `admin_stats.json` - Statistiques admin
- `admin_users.json` - Liste des utilisateurs (admin)

## Notes

- Les tests utilisent des mocks pour toutes les API
- Aucune donnée réelle n'est modifiée
- Les tests sont indépendants les uns des autres
