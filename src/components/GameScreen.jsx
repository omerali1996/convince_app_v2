import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GameScreen() {
  const { currentScenario, exitGame } = useGame();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || chatEnded) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/ask", {
        user_input: userMessage,
        scenario_id: currentScenario.id,
        history: messages,
      });

      const aiText = (res.data?.answer || "").trim();
      setMessages((prev) => [...prev, { sender: "ai", text: aiText }]);

      // Cümle "görüşmeyi burada sonlandırıyorum" içeriyorsa durdur
      if (aiText.toLowerCase().includes("görüşmeyi burada sonlandırıyorum")) {
        setChatEnded(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Cevap alınamadı." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      alert("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setInput((prev) => prev + " " + transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognition.start();
    setListening(true);
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setInterimText("");
    setChatEnded(false);
  };

  const renderMessage = (msg, index) => (
    <div
      key={index}
      style={{
        textAlign: msg.sender === "user" ? "right" : "left",
        margin: "10px 0",
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: msg.sender === "user" ? "#3B82F6" : "#E5E7EB",
          color: msg.sender === "user" ? "#fff" : "#000",
          padding: "10px 15px",
          borderRadius: "15px",
          maxWidth: "80%",
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div style={container}>
      <div style={header}>
        <h2>{currentScenario.title}</h2>
        <button onClick={exitGame} style={exitButton}>
          Çıkış
        </button>
      </div>

      <div ref={chatContainerRef} style={chatBox}>
        {messages.map((msg, index) => renderMessage(msg, index))}
        {interimText && listening && (
          <div style={{ color: "gray", fontStyle: "italic" }}>
            {interimText}
          </div>
        )}

        {chatEnded && (
          <div
            style={{
              textAlign: "center",
              color: "#555",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            🔒 Görüşme sonlandırıldı.
          </div>
        )}
      </div>

      <div style={inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            chatEnded
              ? "Görüşme sonlandırıldı."
              : listening
              ? "Konuşun..."
              : "Mesajınızı yazın…"
          }
          disabled={loading || chatEnded}
          style={textArea}
        />

        <button
          onClick={sendMessage}
          disabled={loading || chatEnded}
          style={buttonPrimary}
        >
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>

        <button
          onClick={toggleMic}
          disabled={chatEnded}
          style={{
            ...buttonSecondary,
            background: listening ? "#2e8b57" : "#182240",
            opacity: chatEnded ? 0.6 : 1,
            cursor: chatEnded ? "not-allowed" : "pointer",
          }}
        >
          {chatEnded
            ? "🔒 Görüşme bitti"
            : listening
            ? "🔴 Dinleniyor..."
            : "🗣️ Konuşun"}
        </button>

        <button onClick={resetChat} style={buttonTertiary}>
          Yeni Oturum
        </button>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const container = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  backgroundColor: "#f3f4f6",
  color: "#000",
  padding: "20px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const exitButton = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const chatBox = {
  flex: 1,
  overflowY: "auto",
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 0 5px rgba(0,0,0,0.1)",
};

const inputContainer = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const textArea = {
  flex: 1,
  height: "60px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  padding: "10px",
  resize: "none",
};

const buttonPrimary = {
  backgroundColor: "#3B82F6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 15px",
  cursor: "pointer",
};

const buttonSecondary = {
  border: "none",
  borderRadius: "8px",
  padding: "10px 15px",
  color: "white",
};

const buttonTertiary = {
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 15px",
  cursor: "pointer",
};
