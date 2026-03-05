import React, { useState, useEffect } from "react";
import axios from "axios";
import userAvatar from "../assets/user.png";
import botAvatar from "../assets/bot.png";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Configuration pour les requêtes avec JWT
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Vous devez être connecté pour accéder au chatbot");
      return;
    }
    fetchChatHistory();
  }, [token]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/history`, axiosConfig);
      setChatHistory(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Votre session a expiré");
      } else {
        console.error("Erreur lors de la récupération de l'historique :", error);
      }
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${chatId}`, axiosConfig);
      setMessages(response.data.messages || []);
      setError("");
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
      if (error.response?.status === 404) {
        setError("Discussion non trouvée");
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) {
      setError("Veuillez sélectionner une discussion et écrire un message");
      return;
    }

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: input,
          chat_id: selectedChat.chat_id,
        },
        axiosConfig
      );

      if (response.status === 200) {
        const botMessage = {
          sender: "bot",
          text: response.data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMsg = error.response?.status === 401 ? "Session expirée" : "Erreur lors de l'envoi du message";
      setError(errorMsg);
      console.error("Send message error:", error);
      // Retirer le message utilisateur en cas d'erreur
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    const chatName = prompt("Entrez un nom pour la nouvelle discussion :") || `Discussion du ${new Date().toLocaleDateString("fr-FR")}`;
    if (!chatName.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/chat/new`,
        { chat_name: chatName },
        axiosConfig
      );
      fetchChatHistory();
      setError("");
    } catch (error) {
      setError("Erreur lors de la création de la discussion");
      console.error("Create chat error:", error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette discussion ?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}`, axiosConfig);
      setChatHistory(chatHistory.filter(chat => chat.chat_id !== chatId));
      if (selectedChat?.chat_id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      setError("");
    } catch (error) {
      setError("Erreur lors de la suppression de la discussion");
      console.error("Delete chat error:", error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError("")}></button>
      </div>}

      <div className="row">
        {/* Historique des discussions */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Discussions</h5>
            </div>
            <div className="card-body">
              <button className="btn btn-success btn-sm w-100 mb-3" onClick={handleNewChat}>
                ➕ Nouvelle discussion
              </button>
              <ul className="list-group list-group-flush">
                {chatHistory.length === 0 ? (
                  <p className="text-muted text-center mt-3">Aucune discussion</p>
                ) : (
                  chatHistory.map((chat) => (
                    <li 
                      key={chat.chat_id} 
                      className={`list-group-item p-2 d-flex justify-content-between align-items-center cursor-pointer ${
                        selectedChat?.chat_id === chat.chat_id ? "active bg-light" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <span 
                        onClick={() => {
                          setSelectedChat(chat);
                          fetchChatMessages(chat.chat_id);
                        }}
                        style={{ flex: 1 }}
                        className="text-truncate"
                      >
                        {chat.chat_name}
                      </span>
                      <button 
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleDeleteChat(chat.chat_id)}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Zone de discussion */}
        <div className="col-md-9">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                {selectedChat ? `💬 ${selectedChat.chat_name}` : "Sélectionnez une discussion"}
              </h5>
            </div>
            <div className="card-body">
              {selectedChat ? (
                <>
                  <div 
                    className="chat-box"
                    style={{ 
                      height: "400px", 
                      overflowY: "auto", 
                      border: "1px solid #ccc", 
                      borderRadius: "10px", 
                      padding: "10px", 
                      backgroundColor: "#f8f9fa",
                      marginBottom: "10px"
                    }}
                  >
                    {messages.length === 0 ? (
                      <p className="text-muted text-center mt-5">Aucun message. Commencez la conversation!</p>
                    ) : (
                      messages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`d-flex align-items-start my-2 ${
                            msg.sender === "user" ? "justify-content-end" : "justify-content-start"
                          }`}
                        >
                          <img 
                            src={msg.sender === "user" ? userAvatar : botAvatar} 
                            alt="Avatar" 
                            className="rounded-circle me-2" 
                            style={{ width: "40px", height: "40px" }}
                          />
                          <div 
                            className={`p-2 rounded ${
                              msg.sender === "user" ? "bg-primary text-white" : "bg-secondary text-white"
                            }`}
                            style={{ 
                              maxWidth: "70%", 
                              whiteSpace: "pre-wrap", 
                              wordWrap: "break-word"
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Champ pour envoyer un message */}
                  <form onSubmit={handleSend}>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Posez une question..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="text-center text-muted mt-5">Sélectionnez ou créez une discussion pour commencer</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
