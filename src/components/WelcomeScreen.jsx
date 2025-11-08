import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showButton, setShowButton] = useState(false);

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
      const sound = keySoundRef.current.cloneNode();
      sound.volume = 0.06;
      sound.playbackRate = 0.9;
      sound.play().catch(err => console.log("Ses çalınamadı:", err));
    }
  };

  useEffect(() => {
    keySoundRef.current = new Audio("/sounds/mechanical-key.mp3");
    keySoundRef.current.preload = "auto";

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));

          const currentChar = fullText[index];
          // Boşluk, satır sonu veya emoji değilse ve her 10 karakterde bir ses çal
          if (currentChar.trim() !== "" && currentChar !== "\n" && index % 30 === 0) {
            playKeySound();
          }

          index++;
        } else {
          setIsComplete(true);
          setIsTyping(false);
          clearInterval(interval);

          if (keySoundRef.current) {
            keySoundRef.current.pause();
            keySoundRef.current = null;
          }

          setTimeout(() => setShowButton(true), 500);
        }
      }, 50); // 50ms → hızlı akış

      return () => clearInterval(interval);
    }, 1200);

    return () => {
      clearTimeout(startTimeout);
      if (keySoundRef.current) {
        keySoundRef.current.pause();
        keySoundRef.current = null;
      }
    };
  }, []);

  const handleStart = () => {
    console.log("Oyun başladı!");
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
