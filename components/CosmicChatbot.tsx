"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, X, Sparkles, User, HelpCircle } from "lucide-react";
import { audio } from "@/lib/audio";

interface CosmicChatbotProps {
  onClose: () => void;
  currentSection: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CosmicChatbot({ onClose, currentSection }: CosmicChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "GREETINGS, SPACE TRAVELER! I AM A.S.T.R.A. (ASTRO RETRIEVAL COMPANION). HOW CAN I ASSIST IN YOUR SECTOR SURVEY TODAY?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll messages to the bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestions = [
    "Tell me about your projects",
    "What are your core skills?",
    "Where is Amey based?",
    "How can I contact you?"
  ];

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    audio.playClickSound();

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!res.ok) throw new Error("Link broken.");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ERROR: COMMS GRID INTERFERENCE. TELEMETRY PACKET LOST. PLEASE TRY TRANSMITTING AGAIN." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") {
      audio.playHoverSound();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.96 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-28 right-10 z-40 w-full max-w-sm h-[480px] border border-cyan-500/35 bg-black/85 backdrop-blur-xl rounded shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col font-mono overflow-hidden pointer-events-auto"
    >
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/20 bg-cyan-950/10 px-4 py-3 text-[9px] text-cyan-400 tracking-[0.25em]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>A.S.T.R.A. // AI_COMPANION</span>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400/50 hover:text-white p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Buffer */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-[10px] space-y-3.5 scrollbar-thin select-text">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded leading-relaxed border whitespace-pre-wrap
                ${m.role === "user"
                  ? "bg-cyan-950/15 border-cyan-500/40 text-cyan-300 font-bold"
                  : "bg-white/5 border-white/5 text-neutral-300"
                }
              `}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              <span className="animate-pulse">DECODING TELEMETRY STREAMS...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-cyan-500/10 flex flex-col gap-1.5">
          <span className="text-[7.5px] text-cyan-400/40 tracking-wider flex items-center gap-1 uppercase">
            <HelpCircle className="w-3 h-3" /> // TRANSMISSION SUGGESTS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s)}
                className="text-[8px] bg-cyan-950/10 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-400/80 hover:text-white px-2.5 py-1.5 rounded transition-all cursor-pointer pointer-events-auto"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="border-t border-cyan-500/20 bg-black/60 px-4 py-3 flex gap-2 items-center">
        <span className="text-[10px] text-cyan-400 font-bold">&gt;_</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isTyping}
          className="flex-1 bg-transparent border-none text-[10px] text-white focus:outline-none focus:ring-0 placeholder-cyan-500/20 font-mono tracking-widest uppercase disabled:opacity-40"
          placeholder="SEND INQUIRY PACKET..."
          maxLength={150}
        />
        <button
          type="submit"
          disabled={isTyping}
          className="text-cyan-400/60 hover:text-white transition-colors p-1.5 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </motion.div>
  );
}
