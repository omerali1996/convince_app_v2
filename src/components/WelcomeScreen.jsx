// "use client"; // Next.js kullanıyorsan aç

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";

export default function WelcomeScreen() {
  const { startGame } = useGame();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // 🔊 Tek Audio + metronom + autoplay unlock
  const keyAudioRef = useRef(null);
  const nextTickRef = useRef(0);
  const CLICK_INTERVAL = 180; // ms
  const [audioReady, setAudioReady] = useState(false);

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
    const a = keyAudioRef.current;
    if (!a || !audioReady) return;        // 🔐 hazır değilse çalma (autoplay reddini önler)

    const now = performance.now();
    if (now < nextTickRef.current) return; // metronom
    if (!a.paused) return;                 // üst üste bindirme

    try {
      a.volume = 0.06;
      a.playbackRate = 1.0;
      a.currentTime = 0;
      a.play().catch(() => {});
      nextTickRef.current = now + CLICK_INTERVAL;
    } catch {}
  };

  const stopKeySound = () => {
    const a = keyAudioRef.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  };

  // 🔓 Autoplay “priming” ve fallback unlock
  useEffect(() => {
    keyAudioRef.current = new Audio("/sounds/mechanical-key.mp3");
    const a = keyAudioRef.current;
    a.preload = "auto";
    a.loop = false;

    // 1) Muted autoplay priming (çoğu tarayıcıda sesi “unlock” eder)
    const prime = async () => {
      try {
        a.muted = true;
        await a.play();
        a.pause();
        a.currentTime = 0;
        a.muted = false;
        setAudioReady(true);
      } catch {
        // 2) Fallback: ilk kullanıcı etkileşiminde unlock
        const unlock = async () => {
          try {
            a.muted = true;
            await a.play();
            a.pause();
            a.currentTime = 0;
            a.muted = false;
            setAudioReady(true);
            window.removeEventListener("pointerdown", unlock, { capture: true });
          } catch {}
        };
        window.addEventListener("pointerdown", unlock, { capture: true, once: true });
      }
    };
    prime();

    // Typewriter akışı
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));
          const ch = fullText[index];
          if (ch.trim() !== "" && ch !== "\n") playKeySound();
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          stopKeySound();
          setTimeout(() => setShowButton(true), 500);
        }
      }, 50);

      return () => clearInterval(interval);
    }, 1200);

    return () => {
      clearTimeout(startTimeout);
      stopKeySound();
      keyAudioRef.current = null;
    };
  }, []);

  const handleStart = () => {
    stopKeySound();
    startGame(); // welcome → scenarios
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

const textContainer = { marginBottom: 32 };

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
