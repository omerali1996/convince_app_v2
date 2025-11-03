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
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
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
    setMessages([]);
    setInput("");
  };

  return (
    <div style={container}>
      {/* Üst Kart: Başlık + Hikaye */}
      <div style={topCard}>
        <h2 style={title}>{currentScenario.name}</h2>
        <div style={storyContainer}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentScenario.story}
          </ReactMarkdown>
        </div>
      </div>

      {/* Chat Alanı */}
      <div className="scroll-area" style={chatContainer}>
        {messages.map((m, idx) => (
          <div key={idx} style={m.sender === "user" ? userMessage : aiMessage}>
            <strong style={{ opacity: 0.85 }}>
              {m.sender === "user" ? "Sen" : "Müzakere Botu"}:
            </strong>
            <div style={{ marginTop: 6 }}>
