import React, { useState } from 'react';
import { Plus, Clock, Sparkles, AlertCircle } from 'lucide-react';

export function CanteenMenu({ menu, addToCart, onSimulateCartDrop }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Quick Bites', 'Main Course', 'Beverages', 'Snacks'];

  const filteredItems = selectedCategory === 'All'
    ? menu
    : menu.filter((item) => item.category === selectedCategory);

  return (
    <section className="space-y-6">
      {/* Banner / Header */}
      <div className="comic-card p-6 sm:p-8 bg-[var(--paper-2)] relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="sticker tilt-left">⚡ Lunch Rush Express</span>
            <span className="text-xs font-black uppercase text-[var(--ink-soft)]">
              Break Ends in 20 mins
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Fresh Canteen Grub. Zero Counter Queues.
          </h2>
          <p className="font-semibold text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed">
            Order online, pick up hot food at the express counter, or let our AI agent recover your meal with dynamic discounts if your payment drops!
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={onSimulateCartDrop}
              className="comic-btn comic-btn-brand text-xs sm:text-sm"
              title="Test the Razorpay AI Autonomous Recovery Engine"
            >
              <Sparkles className="w-4 h-4 text-[var(--ink)]" />
              <span>Try Instant Recovery Demo</span>
            </button>
          </div>
        </div>

        {/* Background decorative accent */}
        <div className="hidden md:block absolute -right-6 -bottom-6 w-48 h-48 opacity-15 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(var(--ink) 2px, transparent 2px)',
          backgroundSize: '10px 10px'
        }} />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`tab-btn text-xs sm:text-sm whitespace-nowrap ${
              selectedCategory === cat ? 'active' : ''
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredItems.map((item) => (
          <div key={item.id} className="comic-card p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="sticker sticker-teal text-[11px]">
                  {item.category}
                </span>
                {item.tag && (
                  <span className="sticker tilt-right text-[10px] !bg-[var(--pop-yellow)]">
                    {item.tag}
                  </span>
                )}
              </div>

              <h3 className="font-black text-lg sm:text-xl leading-snug mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                {item.name}
              </h3>

              <p className="text-xs font-semibold text-[var(--ink-soft)] line-clamp-2 mt-1 mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t-2 border-[var(--ink)] flex items-center justify-between">
              <div>
                <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                  ₹{item.price}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[var(--ink-soft)]">
                  <Clock className="w-3 h-3" />
                  <span>{item.prepTime}</span>
                </div>
              </div>

              <button
                onClick={() => addToCart(item)}
                className="comic-btn comic-btn-brand py-1.5 px-3 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
