import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./index.css"; // CSS Import

const socket = io("http://localhost:3000");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("loadMessages", (msgs) => setMessages(msgs));
    socket.on("chatMessage", (data) => setMessages((prev) => [...prev, data]));

    return () => socket.off();
  }, []);

  const sendMessage = () => {
    if (message.trim() && username.trim()) {
      socket.emit("chatMessage", { username, message });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2 style={{ textAlign: "center" }}>💬 Chat Room</h2>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Your Name..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>📩</button>
      </div>
    </div>
  );
};

export default Chat;
