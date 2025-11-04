import React, { useState, useRef, useEffect } from "react";

export default function GameScreen() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Merhaba! Sesli yazma özelliğini test edebilirsiniz." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef();
  const recognitionRef = useRef(null);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "tr-TR";

    recognition.onstart = () => {
      console.log("Ses tanıma başladı");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Algılanan metin:", transcript);
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Ses tanıma hatası:", event.error);
      setListening(false);
      
      if (event.error === "no-speech") {
        alert("Ses algılanamadı. Lütfen tekrar deneyin.");
      } else if (event.error === "not-allowed") {
        alert("Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofon erişimine izin verin.");
      } else {
        alert("Ses tanıma hatası: " + event.error);
      }
    };

    recognition.onend = () => {
      console.log("Ses tanıma bitti");
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    // Simüle edilmiş yanıt
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Mesajınız alındı: " + userMessage },
      ]);
      setLoading(false);
    }, 1000);
  };

  const resetChat = () => {
    setMessages([{ sender: "ai", text: "Yeni oturum başladı." }]);
    setInput("");
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız ses tanımayı desteklemiyor. Chrome veya Edge kullanmayı deneyin.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Mikrofon başlatma hatası:", error);
        alert("Mikrofon başlatılamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.");
      }
    }
  };

  return (
    <>
      <style>{animationStyles}</style>
      <div style={container}>
        <div style={topCard}>
          <div style={story}>
            <h3 style={{ margin: "0 0 10px 0", color: "#ffbe5c" }}>Sesli Yazma Test</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>
              🎤 Mikrofon butonuna tıklayın ve konuşmaya başlayın. 
              Konuştuğunuz metin otomatik olarak kutucuğa yazılacak.
            </p>
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
              <div style={{ marginTop: 6 }}>{m.text}</div>
            </div>
          ))}
          <div ref={scrollRef}></div>
        </div>

        <div style={inputSection}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Mesajınızı yazın veya 🎤 butonuna basıp konuşun… (Enter ile gönder, Shift+Enter ile satır atla)"
            disabled={loading}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 60,
              maxHeight: 150,
              lineHeight: 1.5,
            }}
          />

          <div style={buttonGroup}>
            <button onClick={sendMessage} disabled={loading} style={buttonPrimary}>
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={resetChat} style={buttonSecondary}>
                Yeni Oturum
              </button>
              <button
                onClick={handleMicClick}
                style={{
                  ...buttonSecondary,
                  background: listening ? "#2e8b57" : "#182240",
                  flex: 1,
                }}
              >
                {listening ? "🔴 Dinleniyor..." : "🎤 Sesle Yaz"}
              </button>
            </div>
          </div>
        </div>

        {listening && (
          <div style={listeningIndicator}>
            <div style={pulse}></div>
            <span>Konuşun...</span>
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
  animation: "fadeInSlide 0.5s ease-out",
  maxWidth: 800,
  margin: "0 auto",
  padding: 20,
};

const topCard = {
  background: "#0f162f",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  padding: 20,
};

const story = {
  color: "var(--text)",
  lineHeight: 1.6,
};

const chatContainer = {
  flex: 1,
  padding: 16,
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 16,
  background: "#0f162f",
  minHeight: 300,
  maxHeight: 500,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  overflowY: "auto",
};

const bubbleBase = {
  padding: "12px 16px",
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
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#0f162f",
  color: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
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
  padding: "12px 16px",
  cursor: "pointer",
  color: "#101010",
  fontWeight: 600,
  fontSize: 15,
};

const buttonSecondary = {
  background: "#182240",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "12px 16px",
  cursor: "pointer",
  color: "#eaf0ff",
  fontWeight: 500,
  fontSize: 14,
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
  fontWeight: 600,
  zIndex: 1000,
};

const pulse = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "#ff4444",
  animation: "pulse 1.5s ease-in-out infinite",
};
