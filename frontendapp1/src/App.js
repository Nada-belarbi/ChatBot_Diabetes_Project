import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import NavbarAuth from "./components/NavbarAuth";
import Homepage from "./components/HomePage";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ChatBot from "./components/ChatBot";
import Profile from "./components/Profile";
import GlycemiaPage from "./components/GlycemiaPage";

const App = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isMainPage = ["/chatbot", "/profile", "/glycemia"].includes(location.pathname);

  return (
    <div>
      {isAuthPage && <NavbarAuth />}
      {isMainPage && <Navbar />}
      {!isAuthPage && !isMainPage && location.pathname === "/" && null}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/glycemia" element={<GlycemiaPage />} />
      </Routes>
    </div>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
