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
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_TY6AGJsq3z1kEy');

  // Load Menu & Initial Analytics
  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => d.menu && setMenu(d.menu))
      .catch(console.error);

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
      .then((d) => d.analytics && setAnalytics(d.analytics))
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
          await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              localOrderId: data.localOrderId
            })
          });
          alert('🎉 Payment confirmed via Razorpay! Kitchen ticket issued.');
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="halftone-overlay" />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 comic-card p-4 bg-[var(--pop-yellow)] border-3 border-[var(--ink)] shadow-[5px_5px_0px_var(--ink)] max-w-sm animate-bounce">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-black text-sm text-[var(--ink)]">{toastMessage.title}</h4>
            <button onClick={() => setToastMessage(null)} className="font-black text-xs">✕</button>
          </div>
          <p className="text-xs font-bold text-[var(--ink-soft)] mt-1">{toastMessage.detail}</p>
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
            <KitchenPredictor onTriggerFlashRecovery={() => handleSimulateAbandon({ reason: 'Kitchen Rush Auto-Recovery' })} />

            {/* Feature 2: Autonomous Agent Timeline with WhatsApp Simulator & QR code */}
            <AgentTimeline
              logs={recoveryLogs}
              webhooks={webhooks}
              onSimulatePayment={handleSimulateLinkPayment}
            />

            {/* Feature 3: Merchant Financial AI Copilot Chat */}
            <CopilotChat />
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
