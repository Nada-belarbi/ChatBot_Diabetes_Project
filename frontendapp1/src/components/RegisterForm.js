import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    age: "",
    diabetes_type: "Type 2",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Effacer l'erreur du champ lors de la modification
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Email valide requis";
    }

    // Validation mot de passe
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Confirmation mot de passe
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }

    // Validation nom
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Nom requis";
    }

    // Validation âge
    if (!formData.age || isNaN(formData.age) || formData.age < 0 || formData.age > 150) {
      newErrors.age = "Âge valide requis (0-150)";
    }

    // Validation type de diabète
    if (!["Type 1", "Type 2", "Gestationnel"].includes(formData.diabetes_type)) {
      newErrors.diabetes_type = "Type de diabète invalide";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        email: formData.email.toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        diabetes_type: formData.diabetes_type,
      });

      // Stocker JWT token et infos utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.user_id);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("age", formData.age);
      localStorage.setItem("diabetes_type", formData.diabetes_type);

      // Rediriger vers le chatbot
      navigate("/chatbot");
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ email: "Cet email est déjà utilisé" });
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: "Erreur lors de l'enregistrement" });
      }
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Inscription</h2>
            
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Confirmer mot de passe</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  className={`form-control ${errors.passwordConfirm ? "is-invalid" : ""}`}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.passwordConfirm && <div className="invalid-feedback d-block">{errors.passwordConfirm}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Âge</label>
                <input
                  type="number"
                  name="age"
                  className={`form-control ${errors.age ? "is-invalid" : ""}`}
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.age && <div className="invalid-feedback d-block">{errors.age}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Type de diabète</label>
                <select
                  name="diabetes_type"
                  className={`form-select ${errors.diabetes_type ? "is-invalid" : ""}`}
                  value={formData.diabetes_type}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="Type 1">Type 1</option>
                  <option value="Type 2">Type 2</option>
                  <option value="Gestationnel">Gestationnel</option>
                </select>
                {errors.diabetes_type && <div className="invalid-feedback d-block">{errors.diabetes_type}</div>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>

            <p className="text-center mt-3">
              Déjà inscrit ?{" "}
              <a href="/login" className="text-decoration-none">Se connecter ici</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;