# Guide de Contribution à AREA

Merci de l'intérêt que vous portez à ce projet !
Ce guide vous expliquera comment configurer votre environnement de développement et soumettre vos contributions.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine :

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## Configuration de l'Environnement Local

Notre projet utilise **Docker Compose** pour garantir un environnement de développement cohérent et facile à lancer.

### 1. Cloner le Dépôt

Commencez par cloner le projet sur votre machine locale :

```bash
git clone https://votre-url-de-depot/G-DEV-500-NCY-5-1-area-6-main.git
cd G-DEV-500-NCY-5-1-area-6-main
```

---

### 2. Configurer les Secrets (Variables d'Environnement)

Le projet a besoin de **clés API et de secrets** pour fonctionner (Base de données, SMTP, OAuth).  
Pour le développement, nous les gérons directement dans le fichier `docker-compose.yml`.

 **Important :** Ne commitez **jamais** vos secrets personnels !  
Le fichier `.gitignore` est configuré pour ignorer les fichiers `*.env`, mais comme nous éditons `docker-compose.yml`, soyez vigilants.

Ouvrez le fichier `docker-compose.yml` et complétez la section `environment` du service **backend** :

```yaml
backend:
  build: ./backend
  ports:
    - "8080:8080"
  environment:
    # --- Base de données (déjà configurée pour Docker) ---
    DB_HOST: db
    DB_PORT: 3306
    DB_NAME: area
    DB_USER: root
    DB_PASSWORD: rootpwd # Laissez tel quel pour le dev local

    # --- Clé secrète de l'application (OBLIGATOIRE) ---
    # Générez une clé avec `openssl rand -hex 32` ou utilisez celle-ci
    SECRET_KEY: "c82b090b396f7c5e28a5a5434b9d0e2e1e8b2847a9e6b0c1b4b1a4a1f8e1a6a2"

    # --- Envoi d'email (OBLIGATOIRE pour l'inscription) ---
    # Doit être un compte Gmail/Google Workspace avec un "Mot de passe d'application"
    # (Voir https://myaccount.google.com/apppasswords)
    USER_SMTP_EMAIL: "votre-email@gmail.com"
    USER_SMTP_PASSWORD: "votre-mot-de-passe-d-application-a-16-lettres"

    # --- Clés OAuth (Ajoutez celles dont vous avez besoin) ---
    SPOTIFY_CLIENT_ID: "VOTRE_ID_CLIENT_SPOTIFY"
    SPOTIFY_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_SPOTIFY"
    
    TWITTER_CLIENT_ID: "VOTRE_ID_CLIENT_TWITTER_X"
    TWITTER_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_TWITTER_X"
    
    GOOGLE_CLIENT_ID: "VOTRE_ID_CLIENT_GOOGLE"
    GOOGLE_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_GOOGLE"
    
    MS_CLIENT_ID: "VOTRE_ID_CLIENT_MICROSOFT"
    MS_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_MICROSOFT"
    
    DISCORD_CLIENT_ID: "VOTRE_ID_CLIENT_DISCORD"
    DISCORD_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_DISCORD"
    
    FACEIT_CLIENT_ID: "VOTRE_ID_CLIENT_FACEIT"
    FACEIT_CLIENT_SECRET: "VOTRE_SECRET_CLIENT_FACEIT"
    
    STEAM_WEB_API_KEY: "VOTRE_CLE_API_STEAM"
    
    TOKEN_BOT: "VOTRE_TOKEN_BOT_DISCORD"
```

---

### 3. Lancer les Services

Une fois vos secrets configurés, lancez l'ensemble de la stack (**Backend**, **Frontend**, **Mobile**, **DB**) :

```bash
docker-compose up --build
```

L’option `--build` force la reconstruction des images si vous avez modifié le code  
(ex : `requirements.txt` ou `package.json`).

Pour ne lancer que le backend et la base de données :

```bash
docker-compose up --build backend
```

---

### 4. Accéder aux Services

Votre environnement est maintenant en cours d'exécution :

| Service | URL | Description |
|----------|-----|-------------|
| **Backend (API)** | [http://localhost:8080](http://localhost:8080) | API FastAPI |
| **Frontend (Web)** | [http://localhost:8081](http://localhost:8081) | Interface web |
| **Mobile (Dev Server)** | [http://localhost:19000](http://localhost:19000) | Serveur Expo |
| **Base de données (MariaDB)** | Port **3306** | Connexion via DBeaver ou TablePlus (`root` / `rootpwd`) |

---

## Structure du Projet

Le projet est divisé en trois composants principaux :

```
/backend
│   ├── /app/routers       → Endpoints (routes) de l’API
│   ├── /app/services      → Logique métier (email, OAuth, réactions)
│   ├── /app/models        → Modèles SQLAlchemy (structure DB)
│   └── /app/schemas       → Schémas Pydantic (validation)
/frontend
│   ├── /src/components    → Composants React réutilisables
│   └── /src/App.jsx       → Point d’entrée principal
/mobile
│   └── /src/screens       → Vues (pages) de l’application mobile
```

---

## Comment Contribuer

Nous utilisons le modèle standard **"Fork & Pull Request"**.

1. **Forkez** le dépôt sur votre compte GitHub.  
2. **Créez une nouvelle branche** pour votre fonctionnalité ou correctif :

   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```
   _(Utilisez des préfixes clairs comme `feature/`, `fix/`, `docs/`.)_

3. **Commitez** vos changements avec des messages clairs.  
4. **Poussez** votre branche vers votre fork :

   ```bash
   git push origin feature/ma-nouvelle-feature
   ```
5. **Ouvrez une Pull Request (PR)** depuis votre branche vers `main` du dépôt principal.  
6. Décrivez vos changements et attendez la relecture.

---

## Lancer les Tests

Avant de soumettre votre PR, assurez-vous que **tous les tests passent**.

1. Vérifiez que votre environnement `docker-compose` est lancé.  
2. Exécutez le script de test d'intégration :

   ```bash
   python3 mytest.py
   ```

> Vous devrez récupérer manuellement le **code de vérification** dans votre base de données pour le premier test.

---

## Merci pour votre Contribution !

Votre aide rend ce projet meilleur chaque jour.  
N’hésitez pas à proposer des idées, signaler des bugs ou améliorer la documentation.
