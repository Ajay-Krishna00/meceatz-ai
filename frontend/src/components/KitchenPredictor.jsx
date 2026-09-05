import React, { useState } from 'react';
import { Flame, Clock, Users, Zap, Loader2, ShieldCheck } from 'lucide-react';

export function KitchenPredictor({ kitchenData, onTriggerFlashRecovery }) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleSurge = async () => {
    setIsDeploying(true);
    await onTriggerFlashRecovery();
    setIsDeploying(false);
  };

  const loadPercentage = kitchenData?.kitchenLoadPercentage || 84;
  const waitTime = kitchenData?.avgWaitMinutes || 18;
  const queueLength = kitchenData?.queueLength || 42;
  const windowLabel = kitchenData?.windowLabel || "Peak Lunch Window · Dynamic Capacity";
  const isSurge = kitchenData?.isSurge !== undefined ? kitchenData.isSurge : true;

  return (
    <div className="comic-card p-4 sm:p-5 bg-[var(--paper)] border-2 border-[var(--ink)] shadow-[4px_4px_0px_var(--ink)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Surge Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isSurge ? 'bg-[var(--pop-red)] animate-ping' : 'bg-[var(--pop-teal)]'}`} />
            <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 ${isSurge ? 'text-[var(--pop-red)]' : 'text-[var(--pop-teal-deep)]'}`}>
              <Flame className="w-4 h-4" /> Live Canteen Rush-Hour & Load Engine
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            {windowLabel} · {loadPercentage}% Kitchen Load
          </h3>
          <p className="text-xs font-bold text-[var(--ink-soft)] max-w-xl">
            Real-time queue load monitoring. Autonomous Razorpay agent dispatches queue-bypass links with anti-gaming caps when delays trigger cart drops.
          </p>
        </div>

        {/* Center: Live Stats */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="comic-card p-2.5 bg-[var(--pop-yellow-soft)] border-2 border-[var(--ink)] text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-[var(--ink-soft)]">
              <Clock className="w-3.5 h-3.5" /> Avg Wait
            </div>
            <div className="text-xl font-black text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              {waitTime} min
            </div>
          </div>

          <div className="comic-card p-2.5 bg-[var(--pop-teal-soft)] border-2 border-[var(--ink)] text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-[var(--ink-soft)]">
              <Users className="w-3.5 h-3.5" /> In Queue
            </div>
            <div className="text-xl font-black text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              {queueLength} ppl
            </div>
          </div>

          {/* Right Action: Auto-pilot Recovery */}
          <div className="shrink-0 max-w-[200px]">
            <button
              onClick={handleSurge}
              disabled={isDeploying}
              className="comic-btn comic-btn-yellow py-2 text-xs font-black w-full flex items-center justify-center gap-1.5"
              title="Autonomous Auto-Pilot: Dispatches pre-order pickup Razorpay links with dynamic discounts to prevent students leaving counter queues"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ Auto-Pilot Batch</span>
                </>
              )}
            </button>
            <span className="text-[9px] font-bold text-[var(--ink-soft)] text-center block mt-1">
              Dispatches queue-bypass links
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

