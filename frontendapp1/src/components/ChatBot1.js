import React, { useState, useEffect } from "react";
import axios from "axios";
import userAvatar from "../assets/user.png"; // Image pour l'utilisateur
import botAvatar from "../assets/bot.png"; // Image pour le chatbot

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const userId = localStorage.getItem("user_id");

  // Charger l'historique des discussions
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/chat/history/${userId}`);
        setChatHistory(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique :", error);
      }
    };
    fetchChatHistory();
  }, [userId]);

  // Charger les messages d'une discussion existante
  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/chat/${chatId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };

  // Envoyer un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/chat", {
        message: input,
        user_id: userId,
        chat_id: selectedChat?.chat_id,
      });

      if (response.status === 200) {
        const botMessage = {
          sender: "bot",
          text: response.data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error("Erreur lors de la réponse du bot :", response.data);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }

    setInput("");
  };

  // Créer une nouvelle discussion
  const handleNewChat = async () => {
    const chatName = prompt("Entrez un nom pour la nouvelle discussion :") || "Nouvelle discussion";
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/chat/new", {
        user_id: userId,
        chat_name: chatName,
      });
      const newChat = {
        chat_id: response.data.chat_id,
        chat_name: response.data.chat_name,
        messages: [],
        created_at: new Date(),
      };
      setChatHistory((prevChats) => [...prevChats, newChat]);
      setSelectedChat(newChat);
      setMessages([]);
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle discussion :", error);
    }
  };

  // Sélectionner une discussion existante
  const selectChat = (chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.chat_id);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Historique des discussions */}
        <div className="col-md-4">
          <h4>Historique des discussions</h4>
          <button className="btn btn-success mb-3" onClick={handleNewChat}>
            + Nouvelle discussion
          </button>
          <ul className="list-group">
            {chatHistory.map((chat) => (
              <li
                key={chat.chat_id}
                className={`list-group-item ${selectedChat?.chat_id === chat.chat_id ? "active" : ""}`}
                onClick={() => selectChat(chat)}
              >
                {chat.chat_name}
              </li>
            ))}
          </ul>
        </div>

        {/* Zone de discussion */}
        <div className="col-md-8">
          <h4>Discussion</h4>
          <div
            style={{
              height: "400px",
              overflowY: "scroll",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`d-flex align-items-start my-2 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                {/* Avatar de l'utilisateur ou du chatbot */}
                <img
                  src={msg.sender === "user" ? userAvatar : botAvatar}
                  alt={msg.sender === "user" ? "Utilisateur" : "Chatbot"}
                  className="rounded-circle me-2"
                  style={{ width: "40px", height: "40px" }}
                />
                {/* Message affiché sous forme de paragraphe avec styles */}
                <div
                  className={`p-2 rounded ${msg.sender === "user" ? "bg-primary text-white" : "bg-secondary text-white"}`}
                  style={{
                    maxWidth: "70%",
                    whiteSpace: "pre-wrap", // Permet l'affichage des longs messages en plusieurs lignes
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Champ pour envoyer un message */}
          <form onSubmit={handleSend} className="mt-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Posez une question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

