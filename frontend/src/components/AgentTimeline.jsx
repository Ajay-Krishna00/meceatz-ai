import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, ArrowUpRight, MessageSquare, QrCode, Smartphone } from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal.jsx';

export function AgentTimeline({ logs, webhooks, onSimulatePayment }) {
  const [payingId, setPayingId] = useState(null);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [activeQrId, setActiveQrId] = useState(null);

  const handlePay = async (id) => {
    setPayingId(id);
    await onSimulatePayment(id);
    setPayingId(null);
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Smartphone Simulator Modal */}
      <WhatsAppModal
        isOpen={Boolean(selectedWhatsApp)}
        onClose={() => setSelectedWhatsApp(null)}
        recoveryData={selectedWhatsApp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Autonomous AI Recovery Stream */}
        <div className="lg:col-span-2 space-y-4">
          {/* Merchant Explanatory Banner */}
          <div className="comic-card p-3.5 bg-[var(--paper-2)] border-2 border-[var(--ink)] flex items-start gap-3 text-xs font-bold shadow-[2px_2px_0px_var(--ink)]">
            <span className="text-xl shrink-0">🏪</span>
            <div>
              <span className="font-black text-[var(--ink)] uppercase">Merchant Live Activity Feed: </span>
              <span className="text-[var(--ink-soft)]">
                This dashboard streams students whose canteen checkouts dropped or timed out today.
                The AI autonomously analyzes each order, creates a personalized Razorpay Payment Link, and dispatches it.
                Try clicking <b>"Simulate Payment Failure"</b> in the cart or <b>"⚡ Auto-Pilot Recovery"</b> above to watch your own order appear here in real time!
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl border-2 border-[var(--ink)] bg-[var(--pop-yellow)] flex items-center justify-center font-black shadow-[2px_2px_0px_var(--ink)] shrink-0">
                🤖
              </div>
              <div>
                <h3 className="font-black text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Autonomous Recovery Agent Feed
                </h3>
                <p className="text-xs font-extrabold text-[var(--ink-soft)] uppercase tracking-wide">
                  Powered by Groq Llama-3.3 & Gemini · Real-time Razorpay Payment Links API</p>
              </div>
            </div>

            <span className="sticker sticker-teal text-xs self-start sm:self-auto">
              Agent Active
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="comic-card p-10 text-center space-y-3 bg-[var(--paper-2)]">
              <Bot className="w-12 h-12 mx-auto text-[var(--ink-soft)]" />
              <h4 className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                No drop-offs currently detected!
              </h4>
              <p className="text-xs font-bold text-[var(--ink-soft)] max-w-sm mx-auto">
                Go to the Student Canteen tab, add items, and click "Simulate Payment Failure & Trigger AI Recovery" to watch the agent generate instant payment links and recovery copy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const isPaid = log.status === 'recovered';
                const showQr = activeQrId === log.id;
                // Encode native UPI Intent URI for 1-click scanning in Google Pay / PhonePe / Paytm
                const upiData = log.upiIntentUri || `upi://pay?pa=razorpay@icici&pn=MEC%20Canteen&am=${log.recoveredAmount}&cu=INR&tr=${log.id}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiData)}`;

                return (
                  <div
                    key={log.id}
                    className="comic-card p-4 sm:p-5 relative overflow-hidden"
                    style={{
                      borderLeft: isPaid ? '8px solid var(--pop-teal-deep)' : '8px solid var(--pop-purple)',
                      background: isPaid ? 'var(--paper)' : 'var(--paper-2)'
                    }}
                  >
                    {/* Status Banner */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`sticker ${isPaid ? 'sticker-teal' : 'sticker-purple'} text-[11px]`}>
                          {isPaid ? '✅ Recovered via Razorpay Link' : '⚡ AI Recovery Dispatched'}
                        </span>
                        {log.antiGamingEnforced && (
                          <span className="sticker sticker-purple text-[10px]" title="Anti-gaming guardrail active: Cash discount locked to prevent moral hazard">
                            🛑 Anti-Gaming Cooldown
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-[var(--ink-soft)]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-right">
                        {log.discountAmount > 0 && (
                          <span className="text-xs line-through font-bold text-[var(--ink-soft)] mr-2">
                            ₹{log.originalAmount}
                          </span>
                        )}
                        <span className="text-lg font-black text-[var(--pop-teal-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                          ₹{log.recoveredAmount}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Items */}
                    <div className="mb-3">
                      <h4 className="font-black text-base" style={{ fontFamily: 'var(--font-display)' }}>
                        {log.headline || 'Cart Saved for ' + log.customer?.name}
                      </h4>
                      <p className="text-xs font-bold text-[var(--ink-soft)] mt-0.5">
                        Student: <strong>{log.customer?.name}</strong> · Items: {log.items?.map((i) => i.name).join(', ')}
                      </p>
                    </div>

                    {/* AI Agent Reasoning Box */}
                    <div className="comic-card-solid p-3 text-xs bg-[var(--paper-3)] space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 font-black text-[var(--ink)]">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--pop-purple)]" />
                        <span>Autonomous AI Strategy & Financial Guardrails:</span>
                      </div>
                      <p className="font-bold text-[var(--ink-soft)] leading-relaxed">
                        {log.reasoning}
                      </p>
                    </div>

                    {/* Interactive Simulated WhatsApp Trigger Bar */}
                    <div className="p-3 rounded-xl border-2 border-[var(--ink)] bg-[#dcf8c6] text-xs font-bold text-[#075e54] flex flex-wrap items-center justify-between gap-2 mb-3 shadow-[2px_2px_0px_var(--ink)]">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#128c7e]" />
                        <span className="font-black">WhatsApp Dispatch Ready</span>
                      </div>
                      <button
                        onClick={() => setSelectedWhatsApp(log)}
                        className="comic-btn bg-[#25d366] text-[#075e54] hover:bg-[#1ebd56] text-[11px] py-1 px-3 shadow-[1px_1px_0px_var(--ink)]"
                      >
                        📱 Open WhatsApp Simulator
                      </button>
                    </div>

                    {/* Inline QR Code Section if toggled */}
                    {showQr && (
                      <div className="comic-card-solid p-4 mb-3 bg-[var(--paper)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <img
                          src={qrUrl}
                          alt="Native Razorpay UPI Intent QR"
                          className="w-36 h-36 border-2 border-[var(--ink)] rounded-lg shadow-[2px_2px_0px_var(--ink)]"
                        />
                        <div className="space-y-1">
                          <span className="sticker sticker-teal text-[10px]">Native upi:// Intent QR</span>
                          <h5 className="font-black text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                            Scan to Pay ₹{log.recoveredAmount} (Direct UPI App)
                          </h5>
                          <p className="text-xs font-bold text-[var(--ink-soft)] max-w-xs">
                            Scannable with Google Pay, PhonePe, Paytm, or CRED. Triggers native UPI payment sheet without browser redirect.
                          </p>
                          <a
                            href={log.paymentLinkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-black text-[var(--pop-teal-deep)] underline decoration-2 pt-1"
                          >
                            <span>Open Web Payment Link instead</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actions & Links */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--ink)]/20">
                      <div className="flex items-center gap-2">
                        <a
                          href={log.paymentLinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="comic-pill text-xs hover:bg-[var(--pop-yellow)] transition-colors"
                        >
                          <span>Open Razorpay Link</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => setActiveQrId(showQr ? null : log.id)}
                          className="comic-pill text-xs hover:bg-[var(--pop-teal)] hover:text-white transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                        </button>
                      </div>

                      {!isPaid ? (
                        <button
                          onClick={() => handlePay(log.id)}
                          disabled={payingId === log.id}
                          className="comic-btn comic-btn-brand text-xs font-black py-1.5 px-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[var(--ink)]" />
                          <span>{payingId === log.id ? 'Verifying...' : 'Simulate Customer Payment'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-black text-[var(--pop-teal-deep)] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Paid & Synced to Kitchen</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Live Razorpay Webhook Event Stream */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border-2 border-[var(--ink)] bg-[var(--pop-teal)] flex items-center justify-center font-black shadow-[2px_2px_0px_var(--ink)] shrink-0">
              ⚡
            </div>
            <div>
              <h3 className="font-black text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                Webhook Activity
              </h3>
              <p className="text-xs font-extrabold text-[var(--ink-soft)] uppercase">
                Razorpay Signatures Verified
              </p>
            </div>
          </div>

          <div className="comic-card p-4 bg-[var(--paper-2)] space-y-3">
            {webhooks.length === 0 ? (
              <p className="text-xs font-bold text-[var(--ink-soft)] text-center py-6">
                Listening for Razorpay events...
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="comic-card-solid p-2.5 text-xs bg-[var(--paper)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[11px] text-[var(--pop-teal-deep)]">
                        {wh.event}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                        {new Date(wh.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-[10px] font-mono bg-[var(--paper-3)] p-1.5 rounded border border-[var(--ink)]/30 overflow-x-auto">
                      {JSON.stringify(wh.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
