from pymongo import MongoClient
from bson.objectid import ObjectId  # Import nécessaire
from datetime import datetime  # Import nécessaire

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client.diabetes_chatbot  # Nom de la base de données

### ✅ UTILISATEURS

# Enregistrer un utilisateur
def save_user(user_data):
    """
    Insère un nouvel utilisateur dans la collection 'users'.
    :param user_data: Dictionnaire contenant les informations de l'utilisateur.
    :return: ID de l'utilisateur inséré.
    """
    result = db.users.insert_one(user_data)
    return str(result.inserted_id)

# Récupérer un utilisateur par email
def get_user_by_email(email):
    """
    Récupère un utilisateur par son email.
    :param email: Email de l'utilisateur.
    :return: Dictionnaire contenant les informations de l'utilisateur.
    """
    return db.users.find_one({"email": email})

# Récupérer un utilisateur par ID
def get_user(user_id):
    """
    Récupère un utilisateur par son ID unique.
    :param user_id: ID unique de l'utilisateur.
    :return: Dictionnaire contenant les informations de l'utilisateur.
    """
    return db.users.find_one({"_id": ObjectId(user_id)})

### ✅ GLYCÉMIE

# Enregistrer une glycémie
def save_glycemia_record(user_id, glycemia):
    """
    Enregistre un niveau de glycémie pour un utilisateur.
    :param user_id: ID unique de l'utilisateur.
    :param glycemia: Niveau de glycémie enregistré.
    :return: ID de l'enregistrement inséré.
    """
    record = {
        "user_id": user_id,
        "glycemia": glycemia,
        "timestamp": datetime.utcnow()
    }
    result = db.glycemia_records.insert_one(record)
    return str(result.inserted_id)

# Récupérer les enregistrements de glycémie
def get_glycemia_records(user_id):
    """
    Récupère tous les enregistrements de glycémie d'un utilisateur.
    :param user_id: ID unique de l'utilisateur.
    :return: Liste des enregistrements.
    """
    records = list(db.glycemia_records.find({"user_id": user_id}))
    for record in records:
        record["_id"] = str(record["_id"])  # Convert ObjectId en string
        record["timestamp"] = record["timestamp"].isoformat()  # Convert datetime en format lisible
    return records

### ✅ DISCUSSIONS CHATBOT

# Créer une nouvelle discussion
def create_chat(user_id):
    """
    Crée une nouvelle discussion pour un utilisateur.
    :param user_id: ID unique de l'utilisateur.
    :return: ID de la discussion créée.
    """
    new_chat = {
        "user_id": user_id,
        "chat_id": str(ObjectId()),  # Création d'un ID unique
        "messages": [],
        "created_at": datetime.utcnow()
    }
    result = db.chat_history.insert_one(new_chat)
    return str(result.inserted_id)

# Récupérer l'historique des discussions
def get_chat_history(user_id):
    """
    Récupère l'historique des discussions pour un utilisateur.
    :param user_id: ID unique de l'utilisateur.
    :return: Liste des discussions.
    """
    chats = list(db.chat_history.find({"user_id": user_id}))
    for chat in chats:
        chat["_id"] = str(chat["_id"])  # Convert ObjectId en string
        chat["created_at"] = chat["created_at"].isoformat()
    return chats

# Ajouter un message dans une discussion
def add_message_to_chat(chat_id, message):
    """
    Ajoute un message à une discussion existante.
    :param chat_id: ID unique de la discussion.
    :param message: Dictionnaire contenant le message (texte, auteur, etc.).
    :return: Résultat de la mise à jour.
    """
    result = db.chat_history.update_one(
        {"chat_id": chat_id},
        {"$push": {"messages": message}}
    )
    return result.modified_count > 0  # Retourne True si la mise à jour a été effectuée
