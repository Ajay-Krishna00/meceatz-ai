import React from 'react';
import { X, ArrowUpRight, CheckCheck, Phone, Video, MoreVertical } from 'lucide-react';

export function WhatsAppModal({ isOpen, onClose, recoveryData }) {
  if (!isOpen || !recoveryData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(24,24,27,0.5)] backdrop-blur-sm">
      {/* Smartphone Frame */}
      <div className="w-full max-w-sm rounded-[32px] border-4 border-[var(--ink)] bg-[#0b141a] text-white shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* WhatsApp Top Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--pop-yellow)] border-2 border-[var(--ink)] flex items-center justify-center text-sm font-black text-[var(--ink)]">
              🍔
            </div>
            <div>
              <h4 className="text-sm font-bold leading-tight">MEC Canteen Express</h4>
              <span className="text-[10px] text-[#00a884] font-semibold">Official Business Account</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[#aebac1]">
            <Phone className="w-4 h-4 cursor-pointer" />
            <Video className="w-4 h-4 cursor-pointer" />
            <button onClick={onClose} className="hover:text-white p-1">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Chat Canvas */}
        <div
          className="p-4 flex-1 space-y-3 min-h-[380px] flex flex-col justify-end bg-[#0b141a]"
          style={{
            backgroundImage: "radial-gradient(#1f2c34 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px"
          }}
        >
          {/* Security Notice */}
          <div className="text-center">
            <span className="text-[10px] bg-[#182229] text-[#ffd279] px-3 py-1 rounded-md border border-[#2a3942]">
              🔒 Messages are end-to-end encrypted
            </span>
          </div>

          {/* Incoming Message Bubble */}
          <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tl-none p-3.5 max-w-[88%] self-start shadow-md space-y-2 relative border border-[#02735e]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#25d366]">
              <span>MEC Canteen AI Agent</span>
              <span className="text-[9px] text-[#aebac1] font-mono">
                {new Date(recoveryData.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs font-medium leading-relaxed whitespace-pre-line text-[#e9edef]">
              {recoveryData.whatsappMessage?.split("👉")[0]?.trim() || "Hey! Your hot canteen meal is waiting for you in the kitchen."}
            </p>

            {/* Clickable Razorpay CTA Card inside WhatsApp */}
            <div className="mt-2 pt-2 border-t border-[#02735e]/60">
              <a
                href={recoveryData.paymentLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-[#25d366] hover:bg-[#20bd5a] text-[#0b141a] font-black text-center py-2 px-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
              >
                👉 Complete Payment via Razorpay (₹{recoveryData.recoveredAmount})
              </a>
              <span className="text-[9px] text-[#aebac1] block text-center mt-1">
                ⏱️ 1-Click Razorpay UPI · Expires in 15 mins
              </span>
            </div>

            <div className="flex justify-end items-center gap-1 text-[9px] text-[#aebac1] pt-1">
              <span>Delivered</span>
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            </div>
          </div>
        </div>

        {/* Phone Bottom Footer */}
        <div className="bg-[#1f2c34] p-3 border-t border-[#2a3942] flex flex-col items-center gap-2">
          <span className="text-[11px] font-bold text-[#aebac1]">
            Recipient: <strong>{recoveryData.customer?.name}</strong> ({recoveryData.customer?.contact})
          </span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              (recoveryData.whatsappMessage || "Hey! Your hot canteen meal is waiting for you in the kitchen.") +
              (recoveryData.paymentLinkUrl ? `\n\n👉 Complete Payment: ${recoveryData.paymentLinkUrl}` : "")
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Open in Real WhatsApp (Web / Mobile)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
