# Bienvenue sur AREA !

AREA est une plateforme d'automatisation qui vous permet de connecter vos services préférés (comme Discord, Twitter, Spotify, Google, etc.) et de créer des flux de travail (workflows) personnalisés.

Un workflow est composé d'une **Action** (un événement qui se produit) et d'une **Réaction** (ce que vous voulez faire en réponse).

**Exemple :**
* **Action :** Quand un nouveau membre rejoint mon serveur Discord...
* **Réaction :** ...publier un tweet de bienvenue sur mon compte Twitter.

---

## Démarrage Rapide

Voici comment utiliser AREA en quelques étapes simples.

### 1. Créer un compte
Rendez-vous sur la page d'inscription et créez un compte avec votre nom d'utilisateur, votre email et un mot de passe.

### 2. Vérifier votre email
Nous vous enverrons un email avec un code de vérification à 6 chiffres. Entrez ce code sur la page de vérification pour activer votre compte. C'est une étape obligatoire pour pouvoir vous connecter.

*(Note : Si vous ne recevez pas l'email, vérifiez votre dossier spam.)*

### 3. Se connecter
Une fois votre compte vérifié, connectez-vous avec votre email et votre mot de passe. Vous arriverez sur votre tableau de bord.

---

## Utilisation de l'Application

### Connecter vos services
Avant de pouvoir créer des workflows, vous devez autoriser AREA à accéder à vos services.

1.  Allez dans l'onglet **"Services"** ou **"Mon Profil"**.
2.  Vous verrez la liste des services disponibles (Discord, Google, Twitter, etc.).
3.  Cliquez sur **"Connecter"** à côté des services que vous souhaitez utiliser.
4.  Vous serez redirigé vers la page d'autorisation du service (par exemple, Google) pour approuver la connexion. Une fois connecté, le service apparaîtra comme "Connecté".

### Créer un Workflow (L'interface Blueprint)
1.  Allez sur la page **"Créer un Workflow"** (ou "Créer une AREA").
2.  Donnez un nom à votre workflow (ex: "Alerte Nouveaux Membres").

Vous accédez à l'interface **Blueprint** : un éditeur visuel où vous glissez et connectez différentes "boîtes" (nœuds) pour construire votre automatisation.

Voici les principaux types de boîtes :

* **Action "Hooker" (Déclencheur) :**
    * C'est le point de départ qui **lance le workflow** et récupère les premières informations lorsqu'un événement se produit.
    * *Exemple : "Quand un nouveau membre rejoint le serveur Discord".*

* **Action "Timer" (Déclencheur temporel) :**
    * Un type d'action spécifique qui permet de lancer le workflow à un **intervalle de temps régulier** que vous choisissez (par exemple, "toutes les 5 minutes", "tous les jours à 8h").

* **Réaction :**
    * C'est l'action qui sera effectuée en réponse au déclencheur.
    * *Exemple : "...publier un tweet de bienvenue".*

* **Action "Getter" (Récupération de données) :**
    * Cette boîte permet de **récupérer des informations supplémentaires en direct** d'un service pour les utiliser dans votre réaction.
    * *Exemple : "Récupérer les statistiques d'un joueur" pour les inclure dans un message Discord.*

**Comment construire :**

1.  **Choisir le Déclencheur :** Placez votre première boîte (une "Action Hooker" ou une "Action Timer") sur le canevas et configurez-la.
2.  **Choisir la Réaction :** Placez la boîte de réaction.
3.  **(Optionnel) Ajouter un "Getter" :** Si besoin, ajoutez un "Getter" pour enrichir vos données.
4.  **Connecter les boîtes :** Reliez les nœuds pour créer le flux logique.
5.  Cliquez sur **"Sauvegarder"** (ou "Verify" / "Send").

### Gérer vos Workflows
Sur votre tableau de bord (page "Mes Workflows" ou "Dashboard"), vous pouvez voir tous les workflows que vous avez créés. Vous pouvez les activer, les désactiver ou les supprimer à tout moment.

---

## FAQ / Dépannage

**Q : Mon workflow n'a pas fonctionné !**
**R :** Vérifiez plusieurs choses :
1.  Votre workflow est-il activé dans votre tableau de bord ?
2.  Les services utilisés (ex: Google et Twitter) sont-ils toujours connectés ? (Vérifiez dans l'onglet "Services"). Parfois, les connexions expirent et vous devez les reconnecter.
3.  Avez-vous bien rempli tous les paramètres requis pour l'action et la réaction (par exemple, l'ID du serveur Discord) ?

**Q : Comment puis-je révoquer l'accès à mes comptes ?**
**R :** Vous pouvez déconnecter un service à tout moment depuis l'onglet "Services" dans AREA. Vous pouvez également révoquer l'accès directement depuis les paramètres de sécurité de vos comptes (Google, Discord, etc.).
