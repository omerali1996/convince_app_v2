import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ScenariosScreen() {
  const { scenarios, fetchScenarios, selectScenario, loading, error } = useGame();
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchScenarios(); }, []); // eslint-disable-line

  if (loading) return <div style={status}>Yükleniyor…</div>;
  if (error) return <div style={status}>{error}</div>;
  if (!scenarios.length) return <div style={status}>Senaryo bulunamadı.</div>;

  return (
    <div style={container}>
      <div style={headerRow}>
        <h2 style={title}>Senaryolar</h2>
        <span className="badge">Yeni</span>
      </div>

      <div style={grid}>
        <div className="scroll-area" style={listCol}>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setPreview(s)}
              className="btn btn-secondary"
              style={scenarioBtn(s, preview)}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div style={detailCol}>
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key={preview.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: .25 }}
                style={detailCard}
              >
                <h3 style={{ marginBottom: 8 }}>{preview.name}</h3>
                <p style={story}><strong>Hikâye:</strong> {preview.story}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={() => selectScenario(preview)}>
                    Oyna
                  </button>
                  <button className="btn btn-secondary" onClick={() => setPreview(null)}>
                    Geri
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={emptyDetail}>Soldan bir senaryo seç.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Styles
const container = { display: "flex", flexDirection: "column", gap: 14 };
const headerRow = { display: "flex", alignItems: "center", justifyContent: "space-between" };
const title = { fontSize: 22 };

const grid = { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, minHeight: 360 };

const listCol = { display: "flex", flexDirection: "column", gap: 10, paddingRight: 6, maxHeight: 420 };
const detailCol = { minHeight: 360 };

const detailCard = { height: "100%", padding: 16, background: "#0f162f", borderRadius: 16, border: "1px solid rgba(255,255,255,.06)" };
const story = { marginTop: 6, color: "var(--text)", opacity: .95, lineHeight: 1.5 };
const goal  = { marginTop: 10, color: "var(--accent)" };

const emptyDetail = { height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 16 };

const status = { padding: 20, textAlign: "center", fontSize: 18, color: "var(--muted)" };

const scenarioBtn = (s, preview) => ({
  justifyContent: "flex-start",
  width: "100%",
  background: preview?.id === s.id ? "#182242" : "#161d36",
  border: "1px solid rgba(255,255,255,.08)"
});

