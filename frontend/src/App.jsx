import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { MetricsBar } from './components/MetricsBar.jsx';
import { KitchenPredictor } from './components/KitchenPredictor.jsx';
import { CanteenMenu } from './components/CanteenMenu.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { AgentTimeline } from './components/AgentTimeline.jsx';
import { CopilotChat } from './components/CopilotChat.jsx';

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);
  // Hackathon Default: 'agent' view showcases all autonomous AI recovery features on load
  const [activeTab, setActiveTab] = useState('agent');
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([
    { id: 'item-1', name: 'MEC Special Chicken Shawarma', price: 130, quantity: 1 },
    { id: 'item-5', name: 'Cold Coffee & Choco Drizzle', price: 70, quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [kitchenData, setKitchenData] = useState(null);
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  // Load Menu & Initial Analytics
  const fetchMenu = () => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => d.menu && setMenu(d.menu))
      .catch(console.error);
  };

  useEffect(() => {
    fetchMenu();

    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => d.razorpayKeyId && setRazorpayKeyId(d.razorpayKeyId))
      .catch(console.error);

    fetchAnalytics();
    fetchRecoveryLogs();
  }, []);

  const fetchAnalytics = () => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => {
        if (d.analytics) setAnalytics(d.analytics);
        if (d.kitchen) setKitchenData(d.kitchen);
      })
      .catch(console.error);
  };

  const fetchRecoveryLogs = () => {
    fetch('/api/recovery/logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setRecoveryLogs(d.logs);
        if (d.webhooks) setWebhooks(d.webhooks);
      })
      .catch(console.error);
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Real Razorpay Standard Modal Checkout
  const handleCheckout = async (customer) => {
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount,
          customer
        })
      });
      const data = await res.json();

      if (!data.success) {
        alert('Could not initialize Razorpay order');
        return;
      }

      const options = {
        key: data.razorpayKeyId || razorpayKeyId,
        amount: data.order.amount,
        currency: 'INR',
        name: 'MEC-Eatz Canteen',
        description: 'Order Payment for ' + customer.name,
        image: '/logo.jpg',
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              localOrderId: data.localOrderId
            })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            alert('🚨 Cryptographic Tampering Alert: ' + verifyData.message);
            return;
          }
          alert('🎉 Payment verified via HMAC-SHA256! Kitchen ticket issued.');
          setCart([]);
          setIsCartOpen(false);
          fetchAnalytics();
        },
        prefill: {
          name: customer.name,
          contact: customer.contact,
          email: 'student@mec.ac.in'
        },
        theme: {
          color: '#ffd43b'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay Checkout SDK is loading or unavailable. Using direct simulation.');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout error: ' + err.message);
    }
  };

  // Simulate Cart Abandonment / Drop -> Triggers Autonomous AI Agent
  const handleSimulateAbandon = async (options) => {
    try {
      const res = await fetch('/api/recovery/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.length > 0 ? cart : [
            { id: 'item-1', name: 'MEC Special Chicken Shawarma', price: 130, quantity: 1 },
            { id: 'item-5', name: 'Cold Coffee & Choco Drizzle', price: 70, quantity: 1 }
          ],
          totalAmount: totalAmount > 0 ? totalAmount : 200,
          customer: {
            name: options?.name || 'Rahul Nair (EC 2026)',
            contact: options?.contact || '+919847123456',
            email: 'rahul@mec.ac.in'
          },
          dropReason: options?.reason || 'UPI Payment Window Exited'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
        fetchRecoveryLogs();
        setActiveTab('agent');
        setToastMessage({
          title: '⚡ AI Recovery Link Generated!',
          detail: 'Autonomous Razorpay link generated for ' + (options?.name || 'Customer') + '. Order added to live feed!'
        });
        setTimeout(() => setToastMessage(null), 6000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Customer Paying the Recovered Link
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/recovery/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRecoveryLogs(data.logs);
        setWebhooks(data.webhooks);
        setAnalytics(data.analytics);
        setToastMessage({
          title: '🧹 Demo Stream Reset',
          detail: 'Restored clean 2-order baseline for demo recording.'
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateLinkPayment = async (recoveryId) => {
    try {
      const res = await fetch('/api/recovery/simulate-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryId })
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
        fetchRecoveryLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Autonomous Batch Recovery for Canteen Rush Hours
  const handleBatchRecovery = async () => {
    try {
      const res = await fetch('/api/recovery/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
        fetchRecoveryLogs();
        setToastMessage({
          title: '⚡ Auto-Pilot Batch Complete!',
          detail: data.message
        });
        setTimeout(() => setToastMessage(null), 6000);
      }
    } catch (err) {
      console.error('Batch recovery error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="halftone-overlay" />

      {/* Floating Action Toast Notification - Guaranteed in-viewport positioning */}
      {toastMessage && (
        <div
          id="recovery-toast"
          className="toast-slide-in"
          style={{
            position: 'fixed',
            top: '85px',
            right: '24px',
            zIndex: 99999,
            maxWidth: '380px',
            backgroundColor: '#ffd43b',
            border: '3px solid #18181b',
            borderRadius: '14px',
            boxShadow: '5px 5px 0px #18181b',
            padding: '14px 18px',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-black text-sm text-[var(--ink)]">
                <span>⚡</span>
                <span>{toastMessage.title}</span>
              </div>
              <p className="text-xs font-extrabold text-[var(--ink-soft)] mt-1 leading-snug">
                {toastMessage.detail}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="w-6 h-6 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center font-black text-xs hover:bg-[var(--pop-red)] hover:text-white shrink-0"
              title="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        analytics={analytics}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10 space-y-6">
        {/* Top Metric Strip */}
        <MetricsBar analytics={analytics} />

        {/* Dynamic Views */}
        {activeTab === 'counter' ? (
          <CanteenMenu
            menu={menu}
            addToCart={addToCart}
            onSimulateCartDrop={() => handleSimulateAbandon()}
          />
        ) : (
          <div className="space-y-6">
            {/* Feature 1: AI Canteen Rush-Hour & Kitchen Load Predictor */}
            <KitchenPredictor
              kitchenData={kitchenData}
              onTriggerFlashRecovery={handleBatchRecovery}
            />

            {/* Feature 2: Autonomous Agent Timeline with WhatsApp Simulator & QR code */}
            <AgentTimeline
              logs={recoveryLogs}
              webhooks={webhooks}
              onSimulatePayment={handleSimulateLinkPayment}
              onResetDemo={handleResetDemo}
            />

            {/* Feature 3: Merchant Financial AI Copilot Chat */}
            <CopilotChat
              onToolExecuted={(toolResult) => {
                fetchMenu();
                fetchAnalytics();
                fetchRecoveryLogs();
                setToastMessage({
                  title: '⚡ Autonomous Action Executed',
                  detail: toolResult.message
                });
                setTimeout(() => setToastMessage(null), 6000);
              }}
            />
          </div>
        )}
      </main>

      {/* Cart Drawer Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalAmount={totalAmount}
        onCheckout={handleCheckout}
        onSimulateAbandon={handleSimulateAbandon}
      />

      {/* Neo-brutalist Footer */}
      <footer className="mt-12 border-t-4 border-[var(--ink)] bg-[var(--paper-2)] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 font-black text-xl" style={{ fontFamily: 'var(--font-display)' }}>
            <span>MEC-Eatz AI</span>
          </div>
          <p className="text-xs font-bold text-[var(--ink-soft)] max-w-md mx-auto">
            Autonomous Revenue Recovery & Merchant Intelligence Agent for Govt Model Engineering College, Thrikkakara, Kochi.
          </p>
          <div className="pt-2">
            <p className="text-sm font-extrabold text-[var(--ink)]">
              Made with ❤️ for MEC by{' '}
              <a
                href="https://github.com/Ajay-Krishna00"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-2 underline-offset-4 decoration-[var(--pop-red)] hover:text-[var(--pop-purple)] transition-colors font-black"
              >
                Ajay Krishna
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
