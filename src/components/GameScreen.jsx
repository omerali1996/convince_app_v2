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
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [currentScenario?.id]);

  if (!currentScenario)
    return <div style={empty}>Senaryo seçilmedi.</div>;

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

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

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div style={container}>
      {/* 🎭 Üst Kart: Başlık + Hikaye */}
      <div style={topCard}>
        <h2 style={title}>{currentScenario.name}</h2>
        <div style={storyContainer}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentScenario.story || "Bu senaryo için hikaye bulunamadı."}
          </ReactMarkdown>
        </div>
      </div>

      {/* 💬 Chat Alanı */}
      <div style={chatContainer}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={m.sender === "user" ? userMessage : aiMessage}
          >
            <strong style={{ opacity: 0.85 }}>
              {m.sender === "user" ? "Sen" : "Müzakere Botu"}:
            </strong>
            <div style={{ marginTop: 6 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      {/* 📝 Input Alanı */}
      <div style={inputSection}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesajınızı yazın…"
          disabled={loading}
          style={inputStyle}
        />

        <div style={buttonGroup}>
          <button onClick={sendMessage} disabled={loading} style={buttonPrimary}>
            Gönder
          </button>
          <button onClick={resetChat} style={buttonSecondary}>
            Yeni Oturum
          </button>
          <button onClick={exitGame} style={buttonSecondary}>
            Çıkış
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const container = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 10,
  maxWidth: 700,
  margin: "0 auto",
  height: "100vh",
  boxSizing: "border-box",
};

/* 🎭 Hikaye Kartı */
const topCard = {
  background: "#0f162f",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  padding: 14,
  maxHeight: "25vh",
  overflowY: "auto",
  wordBreak: "break-word",
  lineHeight: 1.6,
};

const title = {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 8,
  color: "#ffbe5c",
  textAlign: "center",
};

const storyContainer = {
  color: "rgba(255,255,255,0.9)",
  fontSize: "0.95rem",
  overflowY: "auto",
  maxHeight: "18vh",
  paddingRight: 4,
};

/* 💬 Mesaj Alanı */
const chatContainer = {
  flex: 1,
  padding: 12,
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  background: "#0f162f",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  overflowY: "auto",
  maxHeight: "45vh",
  scrollbarWidth: "thin",
};

/* Mesaj Balonları */
const bubbleBase = {
  padding: "10px 14px",
  borderRadius: 16,
  maxWidth: "85%",
  wordWrap: "break-word",
  boxShadow: "0 4px 10px rgba(0,0,0,.2)",
  fontSize: "0.9rem",
};

const userMessage = {
  ...bubbleBase,
  alignSelf: "flex-end",
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  color: "#101010",
  borderTopRightRadius: 4,
};

const aiMessage = {
  ...bubbleBase,
  alignSelf: "flex-start",
  background: "#121a34",
  color: "#eaf0ff",
  borderTopLeftRadius: 4,
  border: "1px solid rgba(255,255,255,.06)",
};

/* 📝 Input ve Butonlar */
const inputSection = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 10,
  paddingBottom: 10,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#0f162f",
  color: "#fff",
  fontSize: 15,
  boxSizing: "border-box",
};

const buttonGroup = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 8,
};

const buttonPrimary = {
  flex: 1,
  minWidth: 100,
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  color: "#101010",
  fontWeight: 600,
};

const buttonSecondary = {
  flex: 1,
  minWidth: 100,
  background: "#182240",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  color: "#eaf0ff",
  fontWeight: 500,
};

const empty = {
  textAlign: "center",
  fontSize: 18,
  color: "var(--muted)",
  marginTop: 40,
};
