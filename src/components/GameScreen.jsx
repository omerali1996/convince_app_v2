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
  const scrollRef = useRef();

  // --- Speech Recognition Setup ---
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "tr-TR";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onend = () => setListening(false);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentScenario?.first_message) {
      setMessages([{ sender: "ai", text: currentScenario.first_message }]);
    } else {
      setMessages([]);
    }
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
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Cevap alınamadı." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    if (currentScenario?.first_message) {
      setMessages([{ sender: "ai", text: currentScenario.first_message }]);
    } else {
      setMessages([]);
    }
    setInput("");
  };

  const handleMicClick = () => {
    if (!recognition) {
      alert("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <>
      <style>{animationStyles}</style>
      <div style={container}>
        <div style={topCard}>
          <div style={story}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentScenario.story}
            </ReactMarkdown>
          </div>
        </div>

        <div className="scroll-area" style={chatContainer}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                ...(m.sender === "user" ? userMessage : aiMessage),
                animation: `slideIn 0.6s ease-out ${idx * 0.08}s both`,
              }}
            >
              <strong style={{ opacity: 0.85 }}>
                {m.sender === "user" ? "Sen" : "Karşı Taraf"}:
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

        <div style={inputSection}>
          {/* Çok satırlı mesaj kutusu */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Mesajınızı yazın… (Göndermek için Enter, satır atlamak için Shift + Enter)"
            disabled={loading}
            style={{
              ...inputStyle,
              resize: "none",
              height: "auto",
              minHeight: 50,
              lineHeight: 1.5,
              overflow: "hidden",
            }}
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
            <button
              onClick={handleMicClick}
              style={{
                ...buttonSecondary,
                background: listening ? "#2e8b57" : "#182240",
              }}
            >
              {listening ? "🎙️ Dinleniyor..." : "🎤 Sesle Yaz"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Animation Styles ---------- */
const animationStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* ---------- Styles ---------- */
const container = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  animation: "fadeInSlide 0.5s ease-out",
};

const topCard = {
  background: "#0f162f",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  padding: 14,
};

const story = {
  marginTop: 6,
  color: "var(--text)",
  opacity: 0.95,
  lineHeight: 1.6,
};

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
  gap: 10,
  overflowY: "auto",
};

const bubbleBase = {
  padding: "10px 14px",
  borderRadius: 16,
  maxWidth: "85%",
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
  boxShadow: "0 8px 24px rgba(0,0,0,.22)",
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

const inputSection = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 12,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#0f162f",
  color: "#fff",
  fontSize: 15,
};

const buttonGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const buttonPrimary = {
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  color: "#101010",
  fontWeight: 600,
};

const buttonSecondary = {
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
