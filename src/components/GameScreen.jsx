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

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll her mesaj eklendiğinde sona gitsin
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Textarea'yı dinamik olarak büyüt
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.scrollTop = textarea.scrollHeight; // caret görünür kalsın
    }
  }, [input, interimText]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/game/message", {
        scenario_id: currentScenario.id,
        messages: [...messages, userMessage],
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      console.error("Message send error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) setInput((prev) => prev + " " + final.trim());
      setInterimText(interim);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleStopAndConfirm = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
    if (interimText) setInput((prev) => prev + " " + interimText);
    setInterimText("");
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 48px 12px 12px",
    backgroundColor: "#2c2c2c",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "8px",
    outline: "none",
    fontSize: "16px",
  };

  const stopButton = {
    position: "absolute",
    right: "8px",
    top: "8px",
    backgroundColor: "#ff5c5c",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "#0078ff" : "#333",
                maxWidth: "80%",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={input + (interimText ? " " + interimText : "")}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              const { selectionStart, selectionEnd, value } = e.target;
              const newValue =
                value.substring(0, selectionStart) +
                "\n" +
                value.substring(selectionEnd);
              setInput(newValue);
              requestAnimationFrame(() => {
                e.target.selectionStart = e.target.selectionEnd =
                  selectionStart + 1;
              });
            } else if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={
            listening
              ? "Konuşun..."
              : "Mesajınızı yazın… (Shift + Enter: Alt satır)"
          }
          disabled={loading || listening}
          rows={1}
          style={{
            ...inputStyle,
            color: listening ? "#ffbe5c" : "#fff",
            fontStyle: interimText ? "italic" : "normal",
            resize: "none",
            overflow: "hidden",
          }}
        />
        {listening ? (
          <button
            onClick={handleStopAndConfirm}
            style={stopButton}
            title="Konuşmayı bitir ve onayla"
          >
            ✓
          </button>
        ) : (
          <button
            onClick={handleVoiceInput}
            style={{
              ...stopButton,
              backgroundColor: "#0078ff",
            }}
            title="Dikte Et"
          >
            🎤
          </button>
        )}
      </div>
    </div>
  );
}
