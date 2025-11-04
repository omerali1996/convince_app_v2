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
  const scrollRef = useRef();
  const recognitionRef = useRef(null);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Sürekli dinleme
    recognition.interimResults = true; // Anlık sonuçları göster
    recognition.lang = "tr-TR";

    recognition.onstart = () => {
      console.log("Ses tanıma başladı");
      setListening(true);
      setInterimText("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      // Final metni input'a ekle
      if (final) {
        setInput((prev) => {
          const newText = prev + final;
          return newText;
        });
      }

      // Interim metni göster (henüz kesinleşmemiş)
      setInterimText(interim);
      
      console.log("Final:", final);
      console.log("Interim:", interim);
    };

    recognition.onerror = (event) => {
      console.error("Ses tanıma hatası:", event.error);
      
      if (event.error === "no-speech") {
        // Sessizlik hatası - sadece log
        console.log("Ses algılanamadı, dinlemeye devam ediliyor...");
      } else if (event.error === "not-allowed") {
        alert("Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofon erişimine izin verin.");
        setListening(false);
        setInterimText("");
      } else {
        setListening(false);
        setInterimText("");
      }
    };

    recognition.onend = () => {
      console.log("Ses tanıma bitti");
      // Eğer hala listening true ise (yani kullanıcı kapatmadıysa), yeniden başlat
      if (listening) {
        try {
          recognition.start();
        } catch (error) {
          console.log("Yeniden başlatma hatası:", error);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [listening]);

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

    // Mikrofon açıksa kapat
    if (listening) {
      stopListening();
    }

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
    // Mikrofon açıksa kapat
    if (listening) {
      stopListening();
    }

    if (currentScenario?.first_message) {
      setMessages([{ sender: "ai", text: currentScenario.first_message }]);
    } else {
      setMessages([]);
    }
    setInput("");
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      setListening(false);
      setInterimText("");
      recognitionRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız ses tanımayı desteklemiyor. Chrome veya Edge kullanmayı deneyin.");
      return;
    }

    if (listening) {
      // Dinlemeyi durdur
      stopListening();
    } else {
      // Dinlemeyi başlat
      try {
        setInput(""); // Input'u temizle
        recognitionRef.current.start();
      } catch (error) {
        console.error("Mikrofon başlatma hatası:", error);
        alert("Mikrofon başlatılamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.");
      }
    }
  };

  const handleStopAndConfirm = () => {
    if (listening) {
      stopListening();
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
                animation: `slideIn 0.6s ease-out ${idx * 0.08}s both`
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
          <div style={{ position: "relative" }}>
            <input
              value={input + (interimText ? " " + interimText : "")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={listening ? "Konuşun..." : "Mesajınızı yazın…"}
              disabled={loading || listening}
              style={{
                ...inputStyle,
                color: listening ? "#ffbe5c" : "#fff",
                fontStyle: interimText ? "italic" : "normal",
              }}
            />
            {listening && (
              <button
                onClick={handleStopAndConfirm}
                style={stopButton}
                title="Konuşmayı bitir ve onayla"
              >
                ✓
              </button>
            )}
          </div>

          <div style={buttonGroup}>
            <button onClick={sendMessage} disabled={loading || listening} style={buttonPrimary}>
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
            <button onClick={resetChat} style={buttonSecondary} disabled={listening}>
              Yeni Oturum
            </button>
            <button onClick={exitGame} style={buttonSecondary} disabled={listening}>
              Çıkış
            </button>
            <button
              onClick={handleMicClick}
              style={{
                ...buttonSecondary,
                background: listening ? "#2e8b57" : "#182240",
              }}
            >
              {listening ? "🔴 Dinleniyor..." : "🎤 Sesle Yaz"}
            </button>
          </div>
        </div>

        {listening && (
          <div style={listeningIndicator}>
            <div style={pulse}></div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Konuşun...</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>✓ işaretine basarak bitirin</div>
            </div>
          </div>
        )}
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

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.4;
    }
  }
`;

/* ---------- Styles ---------- */
const container = { 
  display: "flex", 
  flexDirection: "column", 
  gap: 12,
  animation: "fadeInSlide 0.5s ease-out"
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
  lineHeight: 1.6 
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
  paddingRight: "50px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#0f162f",
  color: "#fff",
  fontSize: 15,
};

const stopButton = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  background: "#2e8b57",
  border: "none",
  borderRadius: "50%",
  width: 32,
  height: 32,
  cursor: "pointer",
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(46, 139, 87, 0.4)",
  transition: "all 0.2s",
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

const listeningIndicator = {
  position: "fixed",
  top: 20,
  right: 20,
  background: "rgba(46, 139, 87, 0.95)",
  color: "white",
  padding: "12px 20px",
  borderRadius: 30,
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 4px 20px rgba(46, 139, 87, 0.4)",
  zIndex: 1000,
};

const pulse = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "#ff4444",
  animation: "pulse 1.5s ease-in-out infinite",
};
