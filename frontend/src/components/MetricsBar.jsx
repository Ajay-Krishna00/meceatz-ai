import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export function MetricsBar({ analytics }) {
  const stats = [
    {
      label: 'AI Recovered Revenue',
      val: `₹${(analytics?.recoveredRevenue ?? 0).toLocaleString()}`,
      sub: `+${analytics?.recoveredOrders ?? 0} orders saved`,
      color: 'var(--pop-teal)',
      icon: TrendingUp
    },
    {
      label: 'Abandoned Carts',
      val: `₹${(analytics?.abandonedRevenue ?? 0).toLocaleString()}`,
      sub: 'Detected at checkout drop',
      color: 'var(--pop-yellow)',
      icon: AlertTriangle
    },
    {
      label: 'AI Recovery Rate',
      val: `${analytics?.recoveryRate ?? 0}%`,
      sub: '% of dropped carts saved',
      color: 'var(--pop-purple)',
      icon: CheckCircle2,
      hint: 'Percentage of dropped or failed canteen orders recovered by the AI'
    },
    {
      label: 'Total Orders Processed',
      val: analytics?.totalOrders ?? 0,
      sub: 'MEC Canteen today',
      color: 'var(--paper-3)',
      icon: DollarSign
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="comic-card p-4 flex flex-col justify-between"
            style={{ borderBottom: `5px solid ${s.color}` }}
            title={s.hint || s.label}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--ink-soft)]">
                {s.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg border-2 border-[var(--ink)] flex items-center justify-center shadow-[1px_1px_0px_var(--ink)]"
                style={{ background: s.color }}
              >
                <Icon className="w-4 h-4 text-[var(--ink)]" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                {s.val}
              </div>
              <p className="text-xs font-bold text-[var(--ink-soft)] mt-0.5">{s.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
