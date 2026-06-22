"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  reply: string;
}

export default function ChatPage() {
  const { accessToken, isLoggedIn } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    api<Message[]>(`/chat/history?access_token=${accessToken}`)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [isLoggedIn, accessToken, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend() {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await api<ChatResponse>("/chat/", {
        method: "POST",
        body: JSON.stringify({
          access_token: accessToken,
          message,
        }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
          Health <span className="text-gold">Advisor</span>
        </h1>

        <div className="flex-1 flex flex-col min-h-0 border border-gold/10 rounded-xl bg-card/40 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {historyLoading ? (
              <div className="h-full flex items-center justify-center py-20">
                <p className="text-muted-foreground">Loading chat...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Ask me about your biological age, biomarkers, or health
                    habits.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {[
                      "How am I doing?",
                      "What should I improve?",
                      "Explain my PhenoAge",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-sm px-3 py-1.5 rounded-full border border-gold/20 text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gold/15 text-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-gold/10 p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your health..."
                rows={1}
                className="resize-none bg-background/50 border-gold/20 focus:border-gold min-h-[44px]"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gold hover:bg-gold-light text-background font-semibold shrink-0 cursor-pointer"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
