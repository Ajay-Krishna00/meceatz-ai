import React, { useState } from 'react';
import { Send, Bot, Sparkles, User, HelpCircle } from 'lucide-react';

export function CopilotChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello Canteen Manager! I am your **MEC-Eatz AI Copilot**.\n\nI monitor live checkout drop-offs, Razorpay payments, and dynamic recovery campaigns across all campus departments. How can I assist you right now?",
      quickActions: [
        "How much revenue was recovered today?",
        "Which canteen items have the highest cart abandonment?",
        "Trigger batch recovery for all pending lunch orders"
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();

      if (data.success && data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer.reply,
            quickActions: data.answer.quickActions || []
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Sorry, I had trouble evaluating that query." }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Backend communication error. Please ensure the backend is running." }
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="comic-card p-4 sm:p-6 bg-[var(--paper-2)] space-y-4 my-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-[var(--ink)] bg-[var(--pop-yellow)] flex items-center justify-center font-black shadow-[2px_2px_0px_var(--ink)]">
            💬
          </div>
          <div>
            <h3 className="font-black text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              Merchant Financial AI Copilot
            </h3>
            <p className="text-xs font-extrabold text-[var(--ink-soft)] uppercase">
              Natural Language Revenue Analytics & Operations Automation
            </p>
          </div>
        </div>

        <span className="sticker sticker-teal text-xs hidden sm:inline-block">
          Llama-3.3 70B
        </span>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-[var(--pop-yellow)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_var(--ink)]">
                <Bot className="w-4 h-4 text-[var(--ink)]" />
              </div>
            )}

            <div className={`comic-card-solid p-3 max-w-xl text-xs sm:text-sm font-semibold ${
              m.role === 'user'
                ? '!bg-[var(--pop-yellow)] text-[var(--ink)]'
                : '!bg-[var(--paper)] text-[var(--ink)]'
            }`}>
              <div className="whitespace-pre-line leading-relaxed">
                {m.content}
              </div>

              {/* Quick Action Chips */}
              {m.quickActions && m.quickActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[var(--ink)]/20 flex flex-wrap gap-1.5">
                  {m.quickActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(action)}
                      className="comic-pill text-[11px] hover:bg-[var(--pop-yellow)] transition-colors cursor-pointer"
                    >
                      <span>{action}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-[var(--pop-teal)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_var(--ink)]">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs font-black text-[var(--ink-soft)]">
            <Bot className="w-5 h-5 text-[var(--pop-purple)] anim-wobble" />
            <span>Copilot is analyzing canteen revenue...</span>
          </div>
        )}
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 pt-2 border-t-2 border-[var(--ink)]"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything: e.g. 'What is our recovery rate?' or 'Which items have highest drop-off?'"
          className="flex-1 px-4 py-2 text-xs sm:text-sm font-bold border-2 border-[var(--ink)] rounded-full bg-[var(--paper)] focus:outline-none shadow-[2px_2px_0px_var(--ink)]"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="comic-btn comic-btn-brand py-2 px-5 text-xs sm:text-sm"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask Copilot</span>
        </button>
      </form>
    </div>
  );
}
