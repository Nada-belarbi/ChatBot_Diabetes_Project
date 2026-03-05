import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const GlycemiaPage = () => {
  const [glycemia, setGlycemia] = useState("");
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Configuration pour les requêtes avec JWT
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Fonction pour récupérer les enregistrements de glycémie
  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/glycemia`, axiosConfig);
      setRecords(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage("Session expirée. Veuillez vous reconnecter.");
      } else {
        setMessage("Erreur lors de la récupération des enregistrements");
      }
      console.error("Fetch records error:", error);
    }
  };

  // Soumettre une nouvelle glycémie
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!glycemia) {
      setMessage("Veuillez entrer une valeur de glycémie.");
      setLoading(false);
      return;
    }

    const glycemiaValue = parseFloat(glycemia);
    if (isNaN(glycemiaValue) || glycemiaValue < 0 || glycemiaValue > 3.0) {
      setMessage("Glycémie invalide (doit être entre 0 et 3.0)");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/glycemia`,
        { glycemia: glycemiaValue },
        axiosConfig
      );
      setMessage(response.data.message);
      setGlycemia("");
      fetchRecords();
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage("Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Erreur lors de l'enregistrement");
      }
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage("Vous devez être connecté pour accéder à cette page");
      return;
    }
    fetchRecords();
  }, [token]);

  // Transformation des données pour le graphe
  const chartData = {
    labels: records.map((record) => new Date(record.timestamp).toLocaleDateString("fr-FR")),
    datasets: [
      {
        label: "Évolution de la Glycémie",
        data: records.map((record) => record.glycemia),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointBackgroundColor: records.map((record) => record.color),
        pointRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h2>📊 Enregistrer votre glycémie</h2>
      
      <div className="card p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <input
              type="number"
              step="0.1"
              className="form-control"
              placeholder="Entrez votre glycémie (0-3.0)..."
              value={glycemia}
              onChange={(e) => setGlycemia(e.target.value)}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
        {message && (
          <div className={`alert ${message.includes("Session") || message.includes("invalide") || message.includes("maximum") ? "alert-danger" : "alert-info"}`}>
            {message}
          </div>
        )}
      </div>

      {/* 📊 Graphe d'évolution */}
      {records.length > 0 && (
        <div className="card p-4 mb-4">
          <h2>Évolution de votre glycémie</h2>
          <div style={{ width: "100%", height: "300px" }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* 📌 Historique des glycémies */}
      {records.length > 0 && (
        <div className="card p-4">
          <h2>Historique des glycémies</h2>
          <ul className="list-group">
            {records.map((record, index) => (
              <li 
                key={index} 
                className={`list-group-item d-flex justify-content-between align-items-center`}
                style={{ borderLeft: `5px solid ${record.color}` }}
              >
                <div>
                  <strong>Glycémie : {record.glycemia}</strong>
                  <br />
                  <small className="text-muted">
                    {new Date(record.timestamp).toLocaleString("fr-FR")}
                  </small>
                </div>
                <span className="badge bg-primary">
                  {record.status === "normal" ? "✔ Normal" : record.status === "hypoglycémie" ? "⚠ Basse" : "❌ Haute"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {records.length === 0 && !message && (
        <div className="alert alert-info">
          Aucun enregistrement pour le moment. Commencez à enregistrer votre glycémie!
        </div>
      )}
    </div>
  );
};

export default GlycemiaPage;
