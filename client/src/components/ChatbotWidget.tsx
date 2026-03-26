import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "ما هي خدماتكم؟",
  "كم أسعار الدزات؟",
  "هل تتوفر دروع تكريمية؟",
  "كيف أطلب خدمة؟",
  "ما هي ساعات العمل؟",
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "أهلاً وسهلاً! 👋 أنا مساعد مركز بدر الذكي. يسعدني مساعدتك في الاستفسار عن خدماتنا وأسعارنا ومناسباتنا. كيف أقدر أساعدك؟",
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chatbot.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "عذراً، حدث خطأ مؤقت. يرجى التواصل معنا مباشرة عبر واتساب: 22675826 📞",
        },
      ]);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setShowSuggestions(false);

    // Only send the last 10 messages to keep context manageable
    const contextMessages = updatedMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    chatMutation.mutate({ messages: contextMessages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (q: string) => {
    sendMessage(q);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-4 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "min(360px, calc(100vw - 2rem))",
            height: "min(520px, calc(100vh - 8rem))",
            background: "#F7F3EC",
            border: "1px solid rgba(156,122,60,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(156,122,60,0.08)",
            animation: "fadeInUp 0.25s ease forwards",
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #2C2416, #2A2010)",
              borderBottom: "2px solid #B89050",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #B89050, #8B6914)",
              }}
            >
              <Bot size={18} className="text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm leading-tight"
                style={{ color: "#F7F3EC", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                مساعد مركز بدر
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                <span
                  className="text-xs"
                  style={{ color: "#9A8A70", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  متاح الآن
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="transition-colors flex-shrink-0"
              style={{ color: "#9A8A70" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#B89050")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9A8A70")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#D4C4A0 transparent", background: "#F2EDE4" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #B89050, #8B6914)" }}
                  >
                    <Bot size={13} className="text-black" />
                  </div>
                )}
                <div
                  className="max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                    ...(msg.role === "assistant"
                      ? {
                          background: "#F7F3EC",
                          border: "1px solid rgba(156,122,60,0.2)",
                          color: "#3A2E1A",
                          borderTopRightRadius: "4px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }
                      : {
                          background: "linear-gradient(135deg, #B89050, #A8873C)",
                          color: "#2C2416",
                          fontWeight: 600,
                          borderTopLeftRadius: "4px",
                        }),
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatMutation.isPending && (
              <div className="flex gap-2 flex-row">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #B89050, #8B6914)" }}
                >
                  <Bot size={13} className="text-black" />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-1"
                  style={{
                    background: "#F7F3EC",
                    border: "1px solid rgba(156,122,60,0.2)",
                    borderTopRightRadius: "4px",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{
                        background: "#B89050",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {showSuggestions && messages.length === 1 && (
              <div className="pt-1">
                <p
                  className="text-xs mb-2 text-right"
                  style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  أسئلة شائعة:
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                      style={{
                        background: "rgba(156,122,60,0.08)",
                        border: "1px solid rgba(156,122,60,0.25)",
                        color: "#9C7A3C",
                        fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(156,122,60,0.15)", background: "#F7F3EC" }}
          >
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #B89050, #8B6914)"
                  : "rgba(156,122,60,0.12)",
              }}
            >
              {chatMutation.isPending ? (
                <Loader2 size={15} className="text-white animate-spin" />
              ) : (
                <Send size={15} className={input.trim() ? "text-black" : ""} style={{ color: input.trim() ? "#000" : "#9C7A3C", transform: "scaleX(-1)" }} />
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              disabled={chatMutation.isPending}
              className="flex-1 bg-transparent text-sm outline-none disabled:opacity-60"
              style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", color: "#2C2416" }}
              maxLength={500}
            />
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 left-20 z-50 w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-300 hover:scale-110"
        style={{
          background: isOpen
            ? "#F7F3EC"
            : "linear-gradient(135deg, #B89050, #8B6914)",
          boxShadow: isOpen
            ? "0 4px 20px rgba(156,122,60,0.25)"
            : "0 4px 20px rgba(156,122,60,0.5)",
          border: "2px solid rgba(156,122,60,0.4)",
        }}
        title="مساعد مركز بدر الذكي"
        aria-label="فتح المساعد الذكي"
      >
        {isOpen ? (
          <ChevronDown size={20} style={{ color: "#9C7A3C" }} />
        ) : (
          <>
            {/* AI Sparkle SVG icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main sparkle star */}
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              {/* Small sparkle top-right */}
              <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="white" opacity="0.85"/>
              {/* Small sparkle bottom-left */}
              <path d="M5 15L5.6 16.8L7.4 17.4L5.6 18L5 19.8L4.4 18L2.6 17.4L4.4 16.8L5 15Z" fill="white" opacity="0.7"/>
            </svg>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "#fff", lineHeight: 1, letterSpacing: "0.05em" }}>AI</span>
          </>
        )}
      </button>

      {/* Bounce keyframes for typing indicator */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
