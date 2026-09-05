import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, Sparkles, Loader2 } from 'lucide-react';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  totalAmount,
  onCheckout,
  onSimulateAbandon
}) {
  const [customerName, setCustomerName] = useState('Rahul Nair (EC 2026)');
  const [customerContact, setCustomerContact] = useState('+919847123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setLoadingText('Connecting to Razorpay Checkout...');
    await onCheckout({ name: customerName, contact: customerContact });
    setIsProcessing(false);
    setLoadingText('');
  };

  const handleAbandonSim = async (reason) => {
    setIsProcessing(true);
    setLoadingText('AI Agent Analyzing Cart & Creating Razorpay Link...');
    await onSimulateAbandon({ name: customerName, contact: customerContact, reason });
    setIsProcessing(false);
    setLoadingText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" style={{ background: 'rgba(24, 24, 27, 0.4)' }}>
      <div className="w-full max-w-md bg-[var(--paper)] h-full border-l-4 border-[var(--ink)] shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[var(--ink)] flex items-center justify-between bg-[var(--paper-2)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border-2 border-[var(--ink)] bg-[var(--pop-yellow)] flex items-center justify-center font-black">
              🛍️
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Your Canteen Cart
              </h2>
              <span className="text-[11px] font-extrabold text-[var(--ink-soft)] uppercase">
                {cart.length} item{cart.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center hover:bg-[var(--pop-red)] hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto">
          {isProcessing && (
            <div className="comic-card p-4 bg-[var(--pop-yellow-soft)] border-2 border-[var(--ink)] text-center space-y-2 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--ink)]" />
              <p className="text-xs font-black text-[var(--ink)]">{loadingText}</p>
              <p className="text-[10px] font-bold text-[var(--ink-soft)]">Calling Gemini 2.5 & Razorpay Payment Links API...</p>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🥪</div>
              <h3 className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Your cart is empty!
              </h3>
              <p className="text-xs font-bold text-[var(--ink-soft)] max-w-xs mx-auto">
                Add some Shawarma, Meals, or Cold Coffee to place an order or test the AI recovery flow.
              </p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="comic-card-solid p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm truncate" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.name}
                      </h4>
                      <p className="text-xs font-bold text-[var(--ink-soft)]">
                        ₹{item.price} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border-2 border-[var(--ink)] rounded-full bg-[var(--paper)] px-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={isProcessing}
                          className="w-6 h-6 flex items-center justify-center font-black hover:opacity-75 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={isProcessing}
                          className="w-6 h-6 flex items-center justify-center font-black hover:opacity-75 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={isProcessing}
                        className="text-[var(--pop-red)] hover:opacity-75 p-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Student Details Form */}
              <div className="comic-card p-3 space-y-2 bg-[var(--paper-2)]">
                <span className="text-[11px] font-black uppercase text-[var(--ink-soft)]">
                  Student Details (MEC Pickup)
                </span>
                <input
                  type="text"
                  value={customerName}
                  disabled={isProcessing}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Student Name & Roll"
                  className="w-full px-3 py-1.5 text-xs font-bold border-2 border-[var(--ink)] rounded-lg bg-[var(--paper)] focus:outline-none"
                />
                <input
                  type="text"
                  value={customerContact}
                  disabled={isProcessing}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="WhatsApp / Phone Number"
                  className="w-full px-3 py-1.5 text-xs font-bold border-2 border-[var(--ink)] rounded-lg bg-[var(--paper)] focus:outline-none"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="comic-card p-3 space-y-1.5 text-xs font-extrabold bg-[var(--paper-3)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-[var(--pop-teal-deep)]">
                  <span>MEC Canteen Surcharge</span>
                  <span>₹0 (Waived)</span>
                </div>
                <div className="border-t-2 border-[var(--ink)] pt-1.5 flex justify-between text-base font-black">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Buttons */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t-2 border-[var(--ink)] bg-[var(--paper-2)] space-y-2.5">
            {/* Real Razorpay Checkout */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full comic-btn comic-btn-brand py-3 text-base font-black shadow-[3px_3px_0px_var(--ink)] flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{totalAmount} via Razorpay</span>
                </>
              )}
            </button>

            {/* Simulated Drop Trigger */}
            <div className="pt-2 border-t border-[var(--ink)]/20 text-center">
              <span className="text-[11px] font-black uppercase text-[var(--ink-soft)] block mb-1.5">
                ⚡ Demo: Test Recovery Agent
              </span>
              <button
                onClick={() => handleAbandonSim('UPI Screen Switched / Timeout')}
                disabled={isProcessing}
                className="w-full comic-btn comic-btn-purple py-2 text-xs font-black flex items-center justify-center gap-2"
                title="Force a cart abandonment event. In production this fires automatically when students close the Razorpay modal."
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Generating Razorpay Link...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Demo: Force Cart Drop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
