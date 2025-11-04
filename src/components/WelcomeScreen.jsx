import React from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const { startGame } = useGame();

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

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          style={subtitle}
        >
          Kriz anlarında müzakere becerini test et.
        </motion.p>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          className="btn btn-primary"
          onClick={startGame}
          style={buttonStyle}
        >
          Başla
        </motion.button>
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
  maxWidth: 360,
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
  lineHeight: 1.4,
};

const buttonStyle = {
  marginTop: 10,
  background: "linear-gradient(180deg, #ffbe5c, #ffb84c)",
  border: "none",
  color: "#101010",
  fontWeight: 600,
  padding: "10px 22px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 16,
  boxShadow: "0 4px 10px rgba(0,0,0,.2)",
  transition: "transform 0.2s ease",
};

