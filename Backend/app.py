
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from functools import wraps
import requests
import jwt
import os
import re
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration depuis variables d'environnement
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'dev-jwt-secret')
app.config['JWT_ALGORITHM'] = os.getenv('JWT_ALGORITHM', 'HS256')

# Connexion MongoDB
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'diabetes_chatbot')
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# === FONCTION - Validation Email ===
def validate_email_format(email):
    """Valide le format de l'email de manière stricte"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

# === FONCTION - Générer JWT Token ===
def generate_token(user_id):
    """Génère un JWT token pour l'utilisateur"""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['JWT_SECRET'], algorithm=app.config['JWT_ALGORITHM'])

# === FONCTION - Vérifier JWT Token ===
def verify_token(token):
    """Vérifie et décide un JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=[app.config['JWT_ALGORITHM']])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# === DÉCORATEUR - Authentification JWT ===
def token_required(f):
    """Décorateur pour protéger les endpoints avec JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Format d'authentification invalide"}), 401
        
        if not token:
            return jsonify({"error": "Token manquant"}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "Token invalide ou expiré"}), 401
        
        return f(payload['user_id'], *args, **kwargs)
    return decorated

# === Endpoint pour l'inscription ===
@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    name = data.get("name", "").strip()
    age = data.get("age")
    diabetes_type = data.get("diabetes_type", "").strip()

    # Validation des champs
    if not email or not password or not name or not age or not diabetes_type:
        return jsonify({"error": "Tous les champs sont requis"}), 400

    # Validation de l'email (STRICT)
    if not validate_email_format(email):
        return jsonify({"error": "Email invalide"}), 400

    # Validation de la longueur du mot de passe
    if len(password) < 8:
        return jsonify({"error": "Le mot de passe doit contenir au moins 8 caractères"}), 400

    # Vérifier que l'email n'existe pas déjà
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "Cet email est déjà utilisé"}), 409

    # Valider le type de diabète
    if diabetes_type not in ["Type 1", "Type 2", "Gestationnel"]:
        return jsonify({"error": "Type de diabète invalide"}), 400

    # Valider l'âge
    try:
        age_int = int(age)
        if age_int < 0 or age_int > 150:
            return jsonify({"error": "Âge invalide"}), 400
    except ValueError:
        return jsonify({"error": "Âge invalide"}), 400

    # Hacher le mot de passe
    hashed_password = generate_password_hash(password)

    user_data = {
        "email": email,
        "password": hashed_password,
        "name": name,
        "age": age_int,
        "diabetes_type": diabetes_type,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(user_data)
    user_id = result.inserted_id

    # Générer JWT token
    token = generate_token(user_id)

    return jsonify({
        "message": "Utilisateur enregistré avec succès",
        "user_id": str(user_id),
        "token": token,
        "email": email,
        "name": name
    }), 201

# === Endpoint pour la connexion ===
@app.route("/api/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    if not validate_email_format(email):
        return jsonify({"error": "Email invalide"}), 400

    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Identifiants incorrects"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Identifiants incorrects"}), 401

    # Générer JWT token
    token = generate_token(user["_id"])

    return jsonify({
        "message": "Connexion réussie",
        "user_id": str(user["_id"]),
        "token": token,
        "name": user.get("name", ""),
        "age": user.get("age", ""),
        "diabetes_type": user.get("diabetes_type", ""),
        "email": user.get("email", "")
    }), 200

# === Endpoint pour récupérer le profil utilisateur ===
@app.route("/api/profile", methods=["GET"])
@token_required
def get_profile(user_id):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        return jsonify({
            "email": user.get("email", "Non renseigné"),
            "name": user.get("name", "Non renseigné"),
            "age": user.get("age", "Non renseigné"),
            "diabetes_type": user.get("diabetes_type", "Non renseigné"),
            "created_at": user.get("created_at", "").isoformat() if user.get("created_at") else ""
        }), 200
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour enregistrer la glycémie ===
@app.route("/api/glycemia", methods=["POST"])
@token_required
def record_glycemia(user_id):
    data = request.json
    
    try:
        glycemia = float(data.get("glycemia"))
    except (ValueError, TypeError):
        return jsonify({"error": "Glycémie invalide (doit être un nombre)"}), 400

    if glycemia < 0 or glycemia > 3.0:
        return jsonify({"error": "Valeur de glycémie non valide (doit être entre 0 et 3.0)"}), 400

    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        today = datetime.utcnow().strftime("%Y-%m-%d")
        count = db.glycemia_records.count_documents({
            "user_id": str(user_id),
            "date": today
        })
        
        if count >= 2:
            return jsonify({
                "error": "Vous avez atteint le nombre maximum de saisies pour aujourd'hui (2 fois par jour)."
            }), 400

        diabetes_type = user.get("diabetes_type", "Type 2")

        # Définir les seuils selon le type de diabète
        if diabetes_type == "Type 1":
            low_threshold = 0.7
            high_threshold = 1.5
        elif diabetes_type == "Gestationnel":
            low_threshold = 0.75
            high_threshold = 1.4
        else:  # Type 2
            low_threshold = 0.8
            high_threshold = 1.8

        # Déterminer le statut
        if glycemia < low_threshold:
            status = "hypoglycémie"
            color = "orange"
        elif glycemia > high_threshold:
            status = "hyperglycémie"
            color = "red"
        else:
            status = "normal"
            color = "green"

        record = {
            "user_id": str(user_id),
            "glycemia": glycemia,
            "timestamp": datetime.utcnow().isoformat(),
            "date": today,
            "status": status,
            "color": color
        }
        db.glycemia_records.insert_one(record)
        
        return jsonify({
            "message": f"Glycémie enregistrée ({status})",
            "status": status,
            "color": color
        }), 201
        
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour récupérer les enregistrements de glycémie ===
@app.route("/api/glycemia", methods=["GET"])
@token_required
def get_glycemia_records(user_id):
    try:
        records = list(db.glycemia_records.find(
            {"user_id": str(user_id)},
            {"_id": 0}
        ).sort("timestamp", -1).limit(100))
        
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour créer une nouvelle discussion ===
@app.route("/api/chat/new", methods=["POST"])
@token_required
def create_chat(user_id):
    data = request.json
    chat_name = data.get("chat_name", f"Discussion du {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")

    if not chat_name or not isinstance(chat_name, str) or len(chat_name.strip()) == 0:
        return jsonify({"error": "Nom de discussion invalide"}), 400

    try:
        new_chat = {
            "user_id": str(user_id),
            "chat_id": str(ObjectId()),
            "chat_name": chat_name.strip(),
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = db.chat_history.insert_one(new_chat)
        
        return jsonify({
            "message": "Nouvelle discussion créée",
            "chat_id": new_chat["chat_id"],
            "chat_name": new_chat["chat_name"]
        }), 201
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour envoyer un message à Rasa ===
@app.route("/api/chat", methods=["POST"])
@token_required
def send_message_to_rasa(user_id):
    data = request.json
    message = data.get("message", "").strip()
    chat_id = data.get("chat_id")

    if not message or len(message) == 0:
        return jsonify({"error": "Message vide"}), 400

    if not chat_id:
        return jsonify({"error": "Chat ID requis"}), 400

    try:
        # Vérifier que la discussion appartient à l'utilisateur
        chat = db.chat_history.find_one({"chat_id": chat_id, "user_id": str(user_id)})
        if not chat:
            return jsonify({"error": "Discussion non trouvée"}), 404

        # Envoyer à Rasa
        try:
            rasa_response = requests.post(
                os.getenv('RASA_SERVER_URL', 'http://localhost:5005') + "/webhooks/rest/webhook",
                json={"sender": str(user_id), "message": message},
                timeout=5
            )
            if rasa_response.status_code != 200:
                return jsonify({"error": "Erreur lors de la communication avec Rasa"}), 500
        except requests.exceptions.RequestException as e:
            return jsonify({"error": "Service de chatbot indisponible"}), 503

        bot_responses = rasa_response.json()
        bot_reply = bot_responses[0]["text"] if bot_responses else "Désolé, je n'ai pas pu traiter votre message."

        # Enregistrer les messages dans MongoDB
        now = datetime.utcnow().isoformat()
        db.chat_history.update_one(
            {"chat_id": chat_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"sender": "user", "text": message, "timestamp": now},
                            {"sender": "bot", "text": bot_reply, "timestamp": now}
                        ]
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        return jsonify({"reply": bot_reply}), 200
        
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour récupérer les messages d'une discussion ===
@app.route("/api/chat/<chat_id>", methods=["GET"])
@token_required
def get_chat_messages(user_id, chat_id):
    try:
        chat = db.chat_history.find_one(
            {"chat_id": chat_id, "user_id": str(user_id)},
            {"_id": 0}
        )
        if not chat:
            return jsonify({"error": "Discussion non trouvée"}), 404

        return jsonify(chat), 200
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour récupérer l'historique des discussions ===
@app.route("/api/chat/history", methods=["GET"])
@token_required
def get_chat_history(user_id):
    try:
        chats = list(db.chat_history.find(
            {"user_id": str(user_id)},
            {"_id": 0, "messages": 0}  # Exclure les messages pour plus de perf
        ).sort("updated_at", -1))
        
        return jsonify(chats), 200
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500

# === Endpoint pour supprimer une discussion ===
@app.route("/api/chat/<chat_id>", methods=["DELETE"])
@token_required
def delete_chat(user_id, chat_id):
    try:
        result = db.chat_history.delete_one({
            "chat_id": chat_id,
            "user_id": str(user_id)
        })
        
        if result.deleted_count == 0:
            return jsonify({"error": "Discussion non trouvée"}), 404
        
        return jsonify({"message": "Discussion supprimée avec succès"}), 200
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur"}), 500


if __name__ == "__main__":
    # Endpoint de santé (sans authentification)
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "message": "Serveur fonctionnel"}), 200
    
    # Endpoint pour tester l'authentification
    @app.route("/api/verify-token", methods=["GET"])
    @token_required
    def verify_token_endpoint(user_id):
        return jsonify({
            "message": "Token valide",
            "user_id": str(user_id)
        }), 200
    
    app.run(debug=True)
