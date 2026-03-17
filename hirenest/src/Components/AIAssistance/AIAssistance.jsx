import React, { useState } from "react";
import { useAI } from "../AIContext";
import "./AIAssistance.css";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";

function AIAssistance() {
  const { isOpen, setIsOpen } = useAI();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! How can I help you with HireNest today?" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // JWT token
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: input }),
      });

      if (response.status === 401) {
        // Token missing/expired
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Please log in to use the AI assistant." },
        ]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Handle other errors gracefully
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "AI service is currently unavailable. Please try again later." },
        ]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "AI service is currently unavailable. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mini Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <span>HireNest Assistant</span>
            <FaTimes
              onClick={() => setIsOpen(false)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="ai-chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="chat-bubble ai">Typing...</div>}
          </div>
          <div className="ai-chat-footer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyPress={(e) => e.key === "Enter" && handleChat()}
            />
            <button onClick={handleChat}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      {/* Hovering Button */}
      <div className="ai-assist" onClick={() => !isOpen && setIsOpen(true)}>
        <div className="ai-content">
          <div className="ai-icon">
            <FaRobot />
          </div>
          <div className="ai-text">
            <strong>AI Assistance</strong>
            <p>Need help? Ask our assistant.</p>
            <button className="ai-btn" onClick={() => setIsOpen(true)}>
              {isOpen ? "Chatting..." : "Get AI Assistance"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIAssistance;
