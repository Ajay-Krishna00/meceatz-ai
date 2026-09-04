import React from 'react';
import { ShoppingBag, Bot, UtensilsCrossed } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, cartCount, setIsCartOpen, analytics }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md" style={{
      background: 'rgba(255, 253, 247, 0.95)',
      borderBottom: 'var(--ink-w-bold) solid var(--ink)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('counter')}>
          <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] overflow-hidden bg-[var(--pop-yellow)] flex items-center justify-center shadow-[2px_2px_0px_var(--ink)] shrink-0">
            <img src="/logo.jpg" alt="MEC-Eatz Logo" className="w-full h-full object-cover" onError={(e) => {
              e.target.style.display = 'none';
            }} />
            <UtensilsCrossed className="w-6 h-6 text-[var(--ink)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                MEC-Eatz <span className="text-[var(--pop-red)]">AI</span>
              </h1>
              <span className="sticker sticker-teal text-[10px] hidden sm:inline-block">
                Razorpay Live
              </span>
            </div>
            <p className="text-xs font-extrabold text-[var(--ink-soft)] uppercase tracking-wider">
              Govt Model Engineering College · Autonomous Canteen
            </p>
          </div>
        </div>

        {/* Unified Nav & Action Pill Bar (Single Div) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--paper-2)] p-1.5 rounded-full border-2 border-[var(--ink)] shadow-[3px_3px_0px_var(--ink)]">
          <button
            onClick={() => setActiveTab('counter')}
            className={`tab-btn text-xs sm:text-sm ${activeTab === 'counter' ? 'active' : ''}`}
          >
            🍔 Student Canteen
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`tab-btn text-xs sm:text-sm flex items-center gap-1.5 ${activeTab === 'agent' ? 'active !bg-[var(--pop-teal)] !text-[#053b2d]' : ''}`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot & Recovery</span>
            {analytics?.recoveredOrders > 0 && (
              <span className="w-2 h-2 rounded-full bg-[var(--pop-red)] anim-pulse inline-block" />
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="comic-btn comic-btn-brand relative text-xs sm:text-sm py-1.5 px-3.5 sm:px-4 ml-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-black">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--pop-red)] text-white text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[var(--ink)] flex items-center justify-center shadow-[1px_1px_0px_var(--ink)]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
