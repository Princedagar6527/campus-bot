import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Volume2, VolumeX, Mic, MicOff, Sparkles } from "lucide-react";

export default function ChatSection({ onSeedDatabase }) {
  // Dynamic API Base URL for local dev and live Vercel deployment
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your autonomous Campus Navigation and Information Assistant. Ask me about laboratories, administrative offices, exam circulars, or indoor route directions.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleMicToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API. Please use Google Chrome.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      handleSendMessage(text);
    };
    rec.start();
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const handleSendMessage = async (customQuery) => {
    const q = customQuery || input;
    if (!q.trim() || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text: q, time }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "No response received from model.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to Core Server.", time },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 overflow-hidden">
      {/* Updated Professional Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex flex-wrap gap-2 justify-between items-center bg-slate-900/60 shrink-0">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
            Campus AI Assistant <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Autonomous Navigation &bull; Live Institutional Records
          </p>
        </div>
        <button
          onClick={onSeedDatabase}
          className="text-[10px] sm:text-[11px] px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-950 border border-blue-800 text-blue-300 rounded-lg hover:bg-blue-900 transition-all font-mono"
        >
          Reset / Seed DB
        </button>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 sm:gap-3 max-w-full sm:max-w-2xl ${
              m.sender === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                m.sender === "user" ? "bg-blue-600" : "bg-slate-800 border border-slate-700 text-blue-400"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>
            <div
              className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-none ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                <span>{m.time}</span>
                {m.sender === "bot" && (
                  <button onClick={() => speakText(m.text)} className="hover:text-blue-300 p-1" title="Read aloud">
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 sm:gap-3 items-center text-xs text-slate-400">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-[11px] sm:text-xs">
              Querying verified database records via Gemini...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <footer className="p-2.5 sm:p-4 border-t border-slate-800 bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-1.5 sm:gap-2"
        >
          <button
            type="button"
            onClick={handleMicToggle}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all shrink-0 ${
              isListening
                ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title={isListening ? "Listening..." : "Click to speak"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            placeholder="Ask e.g. 'Where is the AI Lab?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
          >
            <span className="hidden sm:inline">Send</span> <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}