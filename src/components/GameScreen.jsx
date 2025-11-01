import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function GameScreen() {
  const { currentScenario, exitGame } = useGame();
  const [messages, setMessages] = useState([]); // {sender:'user'|'ai', text:string}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTurn, setUserTurn] = useState(0);
  const [result, setResult] = useState(null); // "win" | "lose" | null
  const scrollRef = useRef();

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!currentScenario) return <div style={empty}>Senaryo seçilmedi.</div>;

  const sendMessage = async () => {
    if (!input.trim() || loading || result) return;

    const userMessage = input.trim();
    const newUserTurn = userTurn + 1;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/ask", {
        user_input: userMessage,
        scenario_id: currentScenario.id,
        history: messages, // çoklu-tur bağlam
      });

      const aiText = (res.data?.answer || "").trim();
      const nextMessages = [...messages, { sender: "user", text: userMessage }, { sender: "ai", text: aiText }];
      setMessages(nextMessages);

      // 5. kullanıcı sorusundan sonra kazan/kaybet kontrolü
      if (newUserTurn >= 5) {
        const normalized = aiText.toLocaleLowerCase("tr-TR");
        const convinced =
          normalized.includes("ikna oldum") ||
          normalized.includes("ikna edildim") ||
          normalized.includes("ikna") && normalized.includes("oldum");

        setResult(convinced ? "win" : "lose");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "ai", text: "Cevap alınamadı." }]);
    } finally {
      setUserTurn(newUserTurn);
      setLoading(false);
    }
  };

  const resetTry = () => {
    setMessages([]);
    setResult(null);
    setUserTurn(0);
    setInput("");
  };

  return (
    <div style={container}>
      <div style={topCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={title}>{currentScenario.name}</h2>
          <span className="badge">Tur: {userTurn}/5</span>
        </div>
        <p style={story}><strong>Hikâye:</strong> {currentScenario.story}</p>
        <p style={goal}><strong>Amaç:</strong> {currentScenario.goal || "—"}</p>
      </div>

      <div className="scroll-area" style={chatContainer}>
        {messages.map((m, idx) => (
          <div key={idx} style={m.sender === "user" ? userMessage : aiMessage}>
            <strong style={{ opacity:.85 }}>{m.sender === "user" ? "Sen" : "Müzakere Botu"}:</strong>
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
          placeholder={result ? "Sonuçlandı – yeniden denemek için 'Yeniden Dene'ye bas." : (userTurn < 5 ? "Mesajınızı yazın…" : "5. soruyu kullandınız")}
          disabled={loading || result || userTurn >= 5}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading || result || userTurn >= 5}>
          Gönder
        </button>
        <button className="btn btn-secondary" onClick={exitGame}>
          Çıkış
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: .25 }}
            style={resultBar(result)}
          >
            <div>
              {result === "win" ? "🎉 Bölümü Geçtin!" : "❌ Bölümü Geçemedin, Tekrar Dene!"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${result === "win" ? "btn-success" : "btn-primary"}`} onClick={resetTry}>
                Yeniden Dene
              </button>
              <button className="btn btn-secondary" onClick={exitGame}>
                Senaryolara Dön
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Styles
const container = { display: "flex", flexDirection: "column", gap: 12 };
const topCard = { background: "#0f162f", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 14 };
const title = { fontSize: 22 };
const story = { marginTop: 6, color: "var(--text)", opacity: .95, lineHeight: 1.5 };
const goal  = { marginTop: 10, color: "var(--accent)" };

const chatContainer = { flex: 1, padding: 12, border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, background: "#0f162f", minHeight: 260, maxHeight: 360, display: "flex", flexDirection: "column", gap: 10 };

const bubbleBase = { padding: "10px 14px", borderRadius: 16, maxWidth: "85%", wordWrap: "break-word", boxShadow: "0 8px 24px rgba(0,0,0,.22)" };
const userMessage = { ...bubbleBase, alignSelf: "flex-end", background: "linear-gradient(180deg, #ffbe5c, #ffb84c)", color: "#101010", borderTopRightRadius: 4 };
const aiMessage   = { ...bubbleBase, alignSelf: "flex-start", background: "#121a34", color: "#eaf0ff", borderTopLeftRadius: 4, border: "1px solid rgba(255,255,255,.06)" };

const inputRow = { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8 };

const empty = { textAlign: "center", fontSize: 18, color: "var(--muted)", marginTop: 40 };

const resultBar = (res) => ({
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: 24,
  background: res === "win" ? "linear-gradient(90deg, #18cf6f, #22c55e)" : "linear-gradient(90deg, #ef4444, #b91c1c)",
  color: res === "win" ? "#07110b" : "#fff",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.08)",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 16px 48px rgba(0,0,0,.35)"
});
