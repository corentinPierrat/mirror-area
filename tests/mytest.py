import requests
import uuid
import json

BASE_URL = "http://localhost:8080"

def print_status(message, success):
    status_icon = "✅" if success else "❌"
    print(f"{status_icon} {message}")

def run_tests():
    print("Démarrage des tests de l'API backend...")

    session = requests.Session()
    unique_id = uuid.uuid4().hex[:8]
    test_user = {
        "username": f"testuser_{unique_id}",
        "email": f"test_{unique_id}@example.com",
        "password": "StrongPassword123!",
        "new_password": "EvenStrongerPassword456!"
    }
    jwt_token = None

    print("\n## Test du Flux d'Authentification ##")

    try:
        reg_response = session.post(f"{BASE_URL}/auth/register", json=test_user)
        is_success = reg_response.status_code == 200
        print_status(f"Enregistrement de l'utilisateur {test_user['email']}", is_success)
        if not is_success:
            print(f"   -> Réponse: {reg_response.text}")
            return
    except requests.exceptions.ConnectionError as e:
        print_status("Connexion à l'API", False)
        print(f"   -> Impossible de se connecter à {BASE_URL}. Le backend est-il lancé ?")
        return

    login_fail_response = session.post(f"{BASE_URL}/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    print_status("Tentative de connexion (non vérifié) - échec attendu", login_fail_response.status_code == 403)

    print(f"Un code de vérification a été envoyé à {test_user['email']}.")
    print("Veuillez vérifier la table 'users' de votre BDD pour cet utilisateur et trouver le 'verification_token'.")
    verification_code = input("Entrez le code de vérification pour continuer: ")

    verify_response = session.post(f"{BASE_URL}/auth/verify", json={"email": test_user["email"], "code": verification_code})
    is_verified = verify_response.status_code == 200
    print_status("Vérification de l'email", is_verified)
    if not is_verified:
        print(f"   -> Réponse: {verify_response.text}")
        return

    wrong_pw_response = session.post(f"{BASE_URL}/auth/login", json={"email": test_user["email"], "password": "mauvaismotdepasse"})
    print_status("Tentative de connexion (mauvais mot de passe) - échec attendu", wrong_pw_response.status_code == 401)

    login_response = session.post(f"{BASE_URL}/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    is_logged_in = login_response.status_code == 200
    print_status("Connexion de l'utilisateur (vérifié)", is_logged_in)
    if is_logged_in:
        jwt_token = login_response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {jwt_token}"})
        print(f"   -> Jeton JWT obtenu avec succès.")
    else:
        print(f"   -> Réponse: {login_response.text}")
        return

    me_response = session.get(f"{BASE_URL}/auth/me")
    is_me_success = me_response.status_code == 200 and me_response.json()['email'] == test_user['email']
    print_status("Accès à la route protégée (/auth/me)", is_me_success)

    print("\n## Test des Points de Terminaison Protégés ##")
    
    actions_response = session.get(f"{BASE_URL}/catalog/actions")
    print_status("Récupération du catalogue d'actions", actions_response.status_code == 200)

    reactions_response = session.get(f"{BASE_URL}/catalog/reactions")
    print_status("Récupération du catalogue de réactions", reactions_response.status_code == 200)

    services_response = session.get(f"{BASE_URL}/oauth/services")
    is_services_success = services_response.status_code == 200 and "services" in services_response.json()
    print_status("Récupération de la liste des services OAuth (/oauth/services)", is_services_success)


    print("\n## Test de la Gestion des Workflows (5 workflows) ##")
    
    workflow_payload_1 = {
      "name": "Test 1: Discord -> Twitter", "description": "Workflow de test 1", "visibility": "private",
      "steps": [
        {"type": "action", "service": "discord", "event": "member_join", "params": {"guild_id": "123"}},
        {"type": "reaction", "service": "twitter", "event": "tweet", "params": {"message": "Test 1"}}
      ]}
    workflow_payload_2 = {
      "name": "Test 2: Discord -> Google Mail", "description": "Workflow de test 2", "visibility": "private",
      "steps": [
        {"type": "action", "service": "discord", "event": "member_join", "params": {"guild_id": "456"}},
        {"type": "reaction", "service": "google", "event": "send_mail", "params": {"to": ["test@example.com"], "subject": "Test 2"}}
      ]}
    workflow_payload_3 = {
      "name": "Test 3: Discord -> Microsoft Mail", "description": "Workflow de test 3", "visibility": "private",
      "steps": [
        {"type": "action", "service": "discord", "event": "member_join", "params": {"guild_id": "789"}},
        {"type": "reaction", "service": "microsoft", "event": "send_mail", "params": {"to": ["test@example.com"], "subject": "Test 3"}}
      ]}
    workflow_payload_4 = {
      "name": "Test 4: Discord -> Twitter (Public)", "description": "Workflow de test public", "visibility": "public",
      "steps": [
        {"type": "action", "service": "discord", "event": "member_join", "params": {"guild_id": "101"}},
        {"type": "reaction", "service": "twitter", "event": "tweet", "params": {"message": "Test 4 Public"}}
      ]}
    workflow_payload_5 = {
      "name": "Test 5: Discord -> Google (Ami)", "description": "Workflow de test ami", "visibility": "friend_only",
      "steps": [
        {"type": "action", "service": "discord", "event": "member_join", "params": {"guild_id": "202"}},
        {"type": "reaction", "service": "google", "event": "send_mail", "params": {"to": ["friend@example.com"], "subject": "Test 5 Ami"}}
      ]}

    created_workflow_ids = []
    workflows_to_create = [workflow_payload_1, workflow_payload_2, workflow_payload_3, workflow_payload_4, workflow_payload_5]

    for i, payload in enumerate(workflows_to_create, 1):
        create_wf_response = session.post(f"{BASE_URL}/workflows/", json=payload)
        is_wf_created = create_wf_response.status_code == 200
        print_status(f"Création du Workflow #{i} ({payload['name']})", is_wf_created)
        
        if is_wf_created:
            workflow_id = create_wf_response.json().get("id")
            created_workflow_ids.append(workflow_id)
            print(f"   -> Workflow #{i} créé avec l'ID: {workflow_id}")
        else:
            print(f"   -> Échec de la création du Workflow #{i}: {create_wf_response.text}")

    if len(created_workflow_ids) == 5:
        list_wf_response = session.get(f"{BASE_URL}/workflows/")
        is_list_ok = list_wf_response.status_code == 200
        
        if is_list_ok:
            workflows_from_db = [wf['id'] for wf in list_wf_response.json()]
            all_found = all(wf_id in workflows_from_db for wf_id in created_workflow_ids)
            print_status("Lister les workflows et trouver les 5 workflows créés", all_found)
        else:
            print_status("Échec de la récupération de la liste des workflows", False)
    else:
        print_status(f"Seulement {len(created_workflow_ids)}/5 workflows ont été créés, test de listing annulé.", False)

    if created_workflow_ids:
        print("   -> Nettoyage des workflows créés...")
        delete_success_count = 0
        for wf_id in created_workflow_ids:
            delete_wf_response = session.delete(f"{BASE_URL}/workflows/{wf_id}")
            if delete_wf_response.status_code == 204:
                delete_success_count += 1
        
        print_status(f"Suppression des {len(created_workflow_ids)} workflows", delete_success_count == len(created_workflow_ids))


    print("\n## Finalisation des Tests & Nettoyage ##")

    change_pw_response = session.patch(f"{BASE_URL}/auth/change-password", json={
        "old_password": test_user["password"],
        "new_password": test_user["new_password"]
    })
    print_status("Changement de mot de passe", change_pw_response.status_code == 200)

    session.headers.pop("Authorization")
    new_login_response = session.post(f"{BASE_URL}/auth/login", json={"email": test_user["email"], "password": test_user["new_password"]})
    is_new_login_success = new_login_response.status_code == 200
    print_status("Connexion avec le nouveau mot de passe", is_new_login_success)
    if is_new_login_success:
        jwt_token = new_login_response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {jwt_token}"})

    delete_user_response = session.delete(f"{BASE_URL}/auth/me")
    is_user_deleted = delete_user_response.status_code == 200
    print_status("Suppression du compte utilisateur (Nettoyage)", is_user_deleted)

    final_login_attempt = session.post(f"{BASE_URL}/auth/login", json={"email": test_user["email"], "password": test_user["new_password"]})
    print_status("Vérification de la suppression (connexion doit échouer)", final_login_attempt.status_code == 401)

    print("Tests terminés.")

if __name__ == "__main__":
    run_tests()