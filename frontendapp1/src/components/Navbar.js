import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <span className="navbar-brand">Chatbot Diabète</span>
        <div>
          {location.pathname === "/chatbot" && (
            <>
              <button
                className="btn btn-info mx-2"
                onClick={() => navigate("/profile")}
              >
                Profil
              </button>
              <button
                className="btn btn-warning mx-2"
                onClick={() => navigate("/glycemia")}
              >
                Gestion Glycémie
              </button>
            </>
          )}
          {location.pathname === "/profile" && (
            <>
              <button
                className="btn btn-primary mx-2"
                onClick={() => navigate("/chatbot")}
              >
                Discussions Chatbot
              </button>
              <button
                className="btn btn-warning mx-2"
                onClick={() => navigate("/glycemia")}
              >
                Gestion Glycémie
              </button>
            </>
          )}
          {location.pathname === "/glycemia" && (
            <>
              <button
                className="btn btn-primary mx-2"
                onClick={() => navigate("/chatbot")}
              >
                Discussions Chatbot
              </button>
              <button
                className="btn btn-info mx-2"
                onClick={() => navigate("/profile")}
              >
                Profil
              </button>
            </>
          )}
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
