import React from "react";
import { useNavigate } from "react-router-dom";

const NavbarAuth = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <a className="navbar-brand" href="/">Accueil</a>
        <div>
          <button
            className="btn btn-link"
            onClick={() => navigate("/register")}
          >
            Inscription
          </button>
          <button
            className="btn btn-link"
            onClick={() => navigate("/login")}
          >
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAuth;
