import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-primary">Bienvenue sur Chatbot Diabète</h1>
      <p className="lead">Votre assistant pour gérer et suivre votre diabète</p>
      <img
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3hiM3l0NThvaTF5YWMxM3gzOGhiaXZxczZ1MmtmdGtrcjcwd3M4YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8g9pJglyWQxr5xkfky/giphy.gif"
        alt="Diabetes Assistant"
        className="img-fluid mt-4"
        style={{ maxWidth: "400px" }}
      />
      <div className="mt-4">
        <button className="btn btn-primary btn-lg me-3" onClick={() => navigate("/register")}>
          S'inscrire
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
          Se connecter
        </button>
      </div>
    </div>
  );
};

export default HomePage;
