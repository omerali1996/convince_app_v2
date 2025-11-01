import React from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const { startGame } = useGame();

  return (
    <div style={wrap}>
      <motion.div
        initial={{ scale: .98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: .35 }}
        style={card}
      >
        <h1 style={title}>🕊️ İkna Oyunu</h1>
        <p style={subtitle}>Kriz anlarında müzakere becerini test et.</p>
        <button className="btn btn-primary" onClick={startGame} style={{ marginTop: 16 }}>
          Başla
        </button>
      </motion.div>
    </div>
  );
}

const wrap = { display: "flex", alignItems: "center", justifyContent: "center", flex: 1 };
const card = { textAlign: "center", padding: 28, background: "#0f162f", borderRadius: 16, border: "1px solid rgba(255,255,255,.06)" };
const title = { fontSize: 28, marginBottom: 8 };
const subtitle = { fontSize: 16, color: "var(--muted)" };
