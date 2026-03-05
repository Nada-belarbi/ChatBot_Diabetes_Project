import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaCalendarAlt, FaHeartbeat, FaSignOutAlt } from "react-icons/fa";
import userAvatar from "../assets/user.png";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Configuration pour les requêtes avec JWT
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("Vous devez être connecté pour accéder à cette page");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/profile`, axiosConfig);
        setProfile(response.data);
        
        // Formater la date de création
        if (response.data.created_at) {
          setCreatedAt(new Date(response.data.created_at).toLocaleDateString("fr-FR"));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
          // Rediriger vers login après 2 secondes
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("Erreur lors de la récupération du profil");
        }
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      localStorage.removeItem("age");
      localStorage.removeItem("diabetes_type");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg p-4" style={{ maxWidth: "600px", width: "100%" }}>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : profile ? (
          <>
            <div className="text-center">
              <h2 className="mb-4">Mon Profil</h2>
              <img
                src={userAvatar}
                alt="Utilisateur"
                className="rounded-circle mb-3"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
            </div>

            {/* Informations utilisateur */}
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center">
                <FaUser className="me-2 text-primary" />
                <strong className="me-3">Nom :</strong>
                <span className="ms-auto">{profile.name}</span>
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-success" />
                <strong className="me-3">Âge :</strong>
                <span className="ms-auto">{profile.age} ans</span>
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaHeartbeat className="me-2 text-danger" />
                <strong className="me-3">Type de diabète :</strong>
                <span className="ms-auto">{profile.diabetes_type}</span>
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaEnvelope className="me-2 text-warning" />
                <strong className="me-3">Email :</strong>
                <span className="ms-auto">{profile.email}</span>
              </li>
              {createdAt && (
                <li className="list-group-item d-flex align-items-center">
                  <FaCalendarAlt className="me-2 text-info" />
                  <strong className="me-3">Inscrit depuis :</strong>
                  <span className="ms-auto">{createdAt}</span>
                </li>
              )}
            </ul>

            {/* Bouton de déconnexion */}
            <button
              className="btn btn-danger w-100 mt-4"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" />
              Se déconnecter
            </button>
          </>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
