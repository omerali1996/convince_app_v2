import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const { startGame } = useGame();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const audioContextRef = useRef(null);

  const fullText = `Hoş geldin.
Hayat, her gün sayısız küçük müzakerenin içinde geçiyor.
Kimi zaman bir arkadaşla, kimi zaman bir iş toplantısında, kimi zaman da kendinle.
Bu oyun, sadece ne söylediğini değil, neden öyle davrandığını anlaman için tasarlandı.
Gerçek hayattan alınan senaryolarda, sınır koyma, ikna etme ve duygu yönetimi becerilerini sınayacaksın.
Her seçim, farkındalığının bir yansıması.
Her senaryo, iletişim tarzını güçlendirmen için bir meydan okuma.
Burada amaç sadece kendini tanımak değil — daha stratejik, daha etkili, daha güçlü bir müzakereci olmak.
Hazırsan, oyun başlasın. 🧠💥`;

  // Daktilo sesi oluşturma fonksiyonu
  const playTypeSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Daktilo sesi için parametreler
    oscillator.frequency.value = Math.random() * 100 + 400; // 400-500 Hz arası rastgele
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Düşük ses seviyesi
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        
        // Boşluk ve satır başı dışındaki karakterlerde ses çal
        const currentChar = fullText[index];
        if (currentChar !== ' ' && currentChar !== '\n') {
          playTypeSound();
        }
        
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 30); // Her 30ms'de bir karakter ekle

    return () => {
      clearInterval(interval);
      // AudioContext'i temizle
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div style={wrap}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={card}
      >
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          style={title}
        >
          🕊️ İkna Oyunu
        </motion.h1>
        <div style={subtitle}>
          {displayedText}
          {!isComplete && <span style={cursor}>|</span>}
        </div>
        {isComplete && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="btn btn-primary"
            onClick={startGame}
            style={buttonStyle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Başla
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- Styles ---------- */
const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "radial-gradient(circle at center, #0f162f, #0a0f1f)",
};

const card = {
  textAlign: "center",
  padding: 32,
  background: "rgba(15, 22, 47, 0.95)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.06)",
  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
  maxWidth: 500,
  width: "90%",
};

const title = {
  fontSize: 28,
  marginBottom: 10,
  color: "#fff",
  fontWeight: 600,
};

const subtitle = {
  fontSize: 16,
  color: "rgba(255,255,255,0.75)",
  marginBottom: 24,
  lineHeight: 1.6,
  minHeight: 320,
  textAlign: "left",
  whiteSpace: "pre-wrap",
};

const cursor = {
  animation: "blink 1s infinite",
  marginLeft: 2,
  color: "#ffbe5c",
};

const buttonStyle = {
  marginTop: 10,
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  border: "none",
  color: "#101010",
  fontWeight: 600,
  padding: "12px 28px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 16,
  boxShadow: "0 4px 10px rgba(0,0,0,.2)",
  transition: "transform 0.2s ease",
};

// CSS animasyonu için stil ekleme
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);
