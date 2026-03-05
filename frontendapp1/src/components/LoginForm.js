import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation simple côté client
    if (!email || !password) {
      setError("Email et mot de passe sont requis");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email: email.toLowerCase(),
        password,
      });

      // Stocker le JWT token et les infos utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.user_id);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("age", response.data.age);
      localStorage.setItem("diabetes_type", response.data.diabetes_type);

      // Rediriger vers le chatbot
      navigate("/chatbot");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || "Erreur de validation");
      } else {
        setError("Erreur de connexion au serveur");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Connexion</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            <p className="text-center mt-3">
              Pas encore inscrit ?{" "}
              <a href="/register" className="text-decoration-none">S'inscrire ici</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;