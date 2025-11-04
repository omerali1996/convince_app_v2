import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion"; // ✅ eklendi

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
        scenario_id: currentScenario.id,
        history: messages,
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
        <div style={story}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentScenario.story}
          </ReactMarkdown>
        </div>
      </div>

      <div className="scroll-area" style={chatContainer}>
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
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
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef}></div>
      </div>

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
