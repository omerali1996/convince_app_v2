import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Gerçek mekanik klavye sesi dosyası
  const keySoundRef = useRef(null);

  const fullText = `Hoş geldin.
Hayat, her gün sayısız küçük müzakerenin içinde geçiyor.
Kimi zaman bir arkadaşla, kimi zaman bir iş toplantısında, kimi zaman da kendinle.
Bu oyun, sadece ne söylediğini değil, neden öyle davrandığını anlaman için tasarlandı.
Gerçek hayattan alınan senaryolarda, sınır koyma, ikna etme ve duygu yönetimi becerilerini sınayacaksın.
Her seçim, farkındalığının bir yansıması.
Her senaryo, iletişim tarzını güçlendirmen için bir meydan okuma.
Burada amaç sadece kendini tanımak değil — daha stratejik, daha etkili, daha güçlü bir müzakereci olmak.
Hazırsan, oyun başlasın. 🧠💥`;

  const playKeySound = () => {
    if (keySoundRef.current) {
      // Ses dosyasını her seferinde yeni bir instance ile çal
      const sound = keySoundRef.current.cloneNode();
      sound.volume = 0.15; // Sabit ses seviyesi
      sound.playbackRate = 0.6; // Sabit tempo
      sound.play().catch(err => console.log("Ses çalınamadı:", err));
    }
  };

  useEffect(() => {
    // Ses dosyasını yükle
    keySoundRef.current = new Audio("/sounds/mechanical-key.mp3");
    keySoundRef.current.preload = "auto";

    // Animasyon başlamadan önce kısa bir gecikme (başlık animasyonunun bitmesi için)
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));

          // Boşluk, satır sonu veya emoji değilse ses çal
          const currentChar = fullText[index];
          if (currentChar !== " " && currentChar !== "\n" && currentChar.trim() !== "") {
            playKeySound();
          }

          index++;
        } else {
          setIsComplete(true);
          setIsTyping(false);
          clearInterval(interval);
          
          // Yazı bittikten sonra butonu göster
          setTimeout(() => {
            setShowButton(true);
          }, 500);
        }
      }, 300); // 300ms - çok yavaş ve sakin tempo

      return () => clearInterval(interval);
    }, 1200); // Başlık animasyonu için 1.2 saniye bekle

    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  const handleStart = () => {
    console.log("Oyun başladı!");
    // Burada oyunu başlatma fonksiyonunu çağırabilirsiniz
    // startGame();
  };

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

        <div style={textContainer}>
          <div style={subtitle}>
            {displayedText}
            {isTyping && <span style={cursor}>|</span>}
          </div>
        </div>

        {showButton && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={handleStart}
            style={buttonStyle}
            whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(255, 190, 92, 0.3)" }}
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
  minHeight: "100vh",
  background: "radial-gradient(circle at center, #0f162f, #0a0f1f)",
  padding: "20px",
};

const card = {
  textAlign: "center",
  padding: "40px 32px",
  background: "rgba(15, 22, 47, 0.95)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.06)",
  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
  maxWidth: 600,
  width: "90%",
  backdropFilter: "blur(10px)",
};

const title = {
  fontSize: 32,
  marginBottom: 24,
  color: "#fff",
  fontWeight: 600,
  letterSpacing: "0.5px",
};

const textContainer = {
  marginBottom: 32,
};

const subtitle = {
  fontSize: 16,
  color: "rgba(255,255,255,0.85)",
  lineHeight: 1.8,
  minHeight: 360,
  textAlign: "left",
  whiteSpace: "pre-wrap",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cursor = {
  display: "inline-block",
  width: "2px",
  height: "1.2em",
  backgroundColor: "#ffbe5c",
  marginLeft: "2px",
  animation: "blink 1s infinite",
  verticalAlign: "middle",
};

const buttonStyle = {
  background: "linear-gradient(135deg, #ffbe5c, #ff9d4c)",
  border: "none",
  color: "#1a1a1a",
  fontWeight: 700,
  padding: "14px 36px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 17,
  boxShadow: "0 4px 12px rgba(255, 190, 92, 0.2)",
  transition: "all 0.2s ease",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

// CSS animasyonu için stil ekleme
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  `;
  if (!document.head.querySelector('[data-welcome-styles]')) {
    styleSheet.setAttribute('data-welcome-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}
