import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import api from "../api";

export default function GameScreen() {
  const { currentScenario, exitGame } = useGame();
  const [messages, setMessages] = useState([]); // {sender:'user'|'ai', text:string}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentScenario) return <div style={empty}>Senaryo seçilmedi.</div>;

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/ask", {
        user_input: userMessage,
        scenario_id: currentScenario.id, // tek turluk backend — olduğu gibi
      });

      const aiText = (res.data?.answer || "").trim();
      setMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "ai", text: "Cevap alınamadı." }]);
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
      <div style={topCard}>
        <h2 style={title}>{currentScenario.name}</h2>
        <p style={story}><strong>Hikâye:</strong> {currentScenario.story}</p>
      </div>

      <div className="scroll-area" style={chatContainer}>
        {messages.map((m, idx) => (
          <div key={idx} style={m.sender === "user" ? userMessage : aiMessage}>
            <strong style={{ opacity:.85 }}>
              {m.sender === "user" ? "Sen" : "Müzakere Botu"}:
            </strong>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <div style={inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesajınızı yazın…"
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>
          Gönder
        </button>
        <button className="btn btn-secondary" onClick={resetChat}>
          Yeni Oturum
        </button>
        <button className="btn btn-secondary" onClick={exitGame}>
          Çıkış
        </button>
      </div>
    </div>
  );
}

/* Styles */
const container = { display: "flex", flexDirection: "column", gap: 12 };
const topCard = {
  background: "#0f162f",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  padding: 14
};
const title = { fontSize: 22 };
const story = { marginTop: 6, color: "var(--text)", opacity: .95, lineHeight: 1.5 };
const goal  = { marginTop: 10, color: "var(--accent)" };

const chatContainer = {
  flex: 1,
  padding: 12,
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  background: "#0f162f",
  minHeight: 260,
  maxHeight: 420,
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const bubbleBase = {
  padding: "10px 14px",
  borderRadius: 16,
  maxWidth: "85%",
  wordWrap: "break-word",
  boxShadow: "0 8px 24px rgba(0,0,0,.22)"
};
const userMessage = {
  ...bubbleBase,
  alignSelf: "flex-end",
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  color: "#101010",
  borderTopRightRadius: 4
};
const aiMessage   = {
  ...bubbleBase,
  alignSelf: "flex-start",
  background: "#121a34",
  color: "#eaf0ff",
  borderTopLeftRadius: 4,
  border: "1px solid rgba(255,255,255,.06)"
};

const inputRow = { display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8 };
const empty = { textAlign: "center", fontSize: 18, color: "var(--muted)", marginTop: 40 };

