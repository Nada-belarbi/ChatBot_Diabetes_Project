from mongodb_connection import save_user, get_user, save_glycemia_record, get_glycemia_records

# Tester les fonctions définies dans mongodb_connection.py
if __name__ == "__main__":
    # Ajouter un utilisateur
    user_id = save_user({
        "user_id": "12345",
        "name": "Alice",
        "age": 35,
        "diabetes_type": "type_1"
    })
    print(f"Utilisateur ajouté avec l'ID : {user_id}")

    # Récupérer un utilisateur
    user = get_user("12345")
    print("Utilisateur récupéré :", user)

    # Ajouter un enregistrement de glycémie
    record_id = save_glycemia_record("12345", 110)
    print(f"Enregistrement de glycémie ajouté avec l'ID : {record_id}")

    # Récupérer tous les enregistrements de glycémie
    records = get_glycemia_records("12345")
    print("Enregistrements de glycémie :", records)
