# 🍔 MEC-Eatz AI — Autonomous Revenue Recovery & Merchant Copilot
> **Engineered for the Razorpay AI Builder Track / Buildathon 2026**  
> *Autonomous AI Financial Agents · Razorpay Orders & Payment Links API · Groq Llama-3.3 & Google Gemini 2.5*  
> **Author:** [Ajay Krishna](https://github.com/Ajay-Krishna00) | Govt Model Engineering College (MEC), Kochi

---

## ⚡ Problem Statement & Executive Summary

College canteens and campus quick-service restaurants (QSRs) operate in extreme, time-compressed traffic spikes — specifically the **12:45 PM – 1:30 PM lunch break** at Govt Model Engineering College (MEC), Kochi.

During these rush hours:
- **35% to 40% of digital cart orders are abandoned** due to high counter queues, campus Wi-Fi dropouts, and UPI app-switch timeouts.
- Canteen cooks prepare high-volume perishable inventory (Chicken Shawarmas, Meals, Porottas, Cold Shakes) anticipating peak demand. Abandoned carts lead to direct daily food spoilage and unrecoverable merchant losses.
- Canteen staff are physically slammed taking counter orders and cannot manually follow up with students who dropped off at checkout.

**MEC-Eatz AI** transforms the traditional canteen ordering workflow into an **autonomous, self-healing revenue recovery engine**:
1. **Three-Layer Autonomous Interception:** Drops are captured instantly via Razorpay modal dismissal hooks, checkout failure events, or a server-side abandonment watcher daemon without requiring manual merchant action.
2. **Cognitive AI Decision Engine:** **Google Gemini 2.5 Flash** (with instant **Groq Llama-3.3** fallback) evaluates basket composition, perishable urgency, and student churn risk under strictly deterministic margin guardrails.
3. **Autonomous Razorpay Link Dispatch:** Autonomously generates a time-sensitive **Razorpay Payment Link** (`razorpay.paymentLink.create`) embedded with a dynamic incentive (e.g., ₹15 instant recovery discount or Express Kitchen Counter pass).
4. **Instant UPI Intent QR & WhatsApp Delivery:** Provides an immediate scannable UPI intent QR code (`upi://pay`) and simulated WhatsApp recovery delivery.
5. **Merchant AI Copilot:** Canteen merchants audit and control operations via natural language tool-calling (stock toggling, financial audits, and automated batch recovery).

---

## 🏗️ System Architecture & Workflow

```
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        Student Canteen Web Store                        │
   │            (Neo-Brutalist Comic Pop UI · Live Menu & Cart)              │
   └────────────────────────────────────┬────────────────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
 [Standard Razorpay Checkout]                         [Autonomous Interception Engine]
   • Cards / Netbanking / UPI                         ├── 1. Client modal.ondismiss Hook
             │                                        ├── 2. Client payment.failed Event
             │                                        ├── 3. Server Abandonment Watcher (90s)
             │                                        └── 4. 🧪 Demo Force-Drop Hook
             │                                                     │
             │                                                     ▼
             │                                        ┌──────────────────────────────┐
             │                                        │ Autonomous AI Recovery Agent │
             │                                        │    (Gemini 2.5 + Groq LLM)   │
             │                                        │  • Churn & Urgency Scoring   │
             │                                        │  • Anti-Gaming Guardrail     │
             │                                        │  • Latency & Model Auditing  │
             │                                        └──────────────┬───────────────┘
             │                                                       │
             ▼                                                       ▼
  [Razorpay Orders API]                                 [Razorpay Payment Links API]
   (crypto HMAC Verified)                                (Dynamic Micro-Incentives)
             │                                                       │
             └──────────────────────────┬────────────────────────────┘
                                        ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        Merchant Operations Hub                          │
   │  • Live Autonomous Feed & AI Audit Trail   • Kitchen Rush-Hour Load     │
   │  • WhatsApp Simulator Modal                • Dynamic Inline UPI QR      │
   │  • Autonomous Merchant AI Copilot (Natural Language Tool Calling)       │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Features Built for Hackathon

### 1. Three-Layer Autonomous Drop Interception
Unlike standard recovery systems requiring manual merchant triggers, MEC-Eatz AI operates continuously and autonomously across 3 layers:
- **Layer 1 (Client Modal Dismissal):** Hooks directly into Razorpay Checkout's `modal.ondismiss` callback. When a student abandons payment by closing the Razorpay sheet, an autonomous drop is fired immediately to `/api/recovery/abandon`.
- **Layer 2 (Client Failure Interception):** Hooks into Razorpay's `payment.failed` event handler to capture UPI timeouts and bank card rejections on the spot.
- **Layer 3 (Server-Side Abandonment Watcher):** A background worker (`abandonmentWatcher.js`) polling every 90 seconds. Any order left in `pending_payment` state for > 3 minutes is automatically recovered without any client or merchant intervention.
- **Layer 4 (Interactive Demo Hook):** A dedicated `🧪 Demo: Force Cart Drop` button in the cart drawer allows hackathon evaluators to test recovery instantly without waiting for timers.

### 2. Autonomous AI Recovery Agent with Real-Time Observability
- Driven by **Google Gemini 2.5 Flash** with **Groq Llama-3.3** fallback to determine:
  - **Churn Risk & Urgency:** High / Medium / Low based on order composition, perishability, and rush-hour window.
  - **Deterministic Financial Guardrails:** Strictly server-enforced margin bounds (capped at max 10% or ₹15) — zero risk of prompt injection manipulating rupee figures.
  - **Anti-Gaming Shield:** Tracks student recovery history in a 12-hour rolling window. Repeat drop-offs are denied monetary discounts and granted non-monetary queue tokens (e.g., *"Priority Kitchen Pass"*) to prevent checkout abuse.
  - **AI Model & Latency Audit Trail:** Every recovery decision and copilot query stamps `aiModelUsed`, `aiLatencyMs`, and `fallbackUsed` for transparent operational auditing.
  - **Real Razorpay Payment Link Creation:** Integrates directly with Razorpay `/v1/payment_links` API with guaranteed 20-30 minute expiry and merchant reference tracking.

### 3. Native Inline 1-Click UPI Intent QR Code
- Indian college students primarily transact via UPI. Each recovery card encodes a native `upi://pay` URI (`upi://pay?pa=razorpay@icici&pn=MEC%20Canteen&am=...&cu=INR&tr=...`).
- Renders an inline scannable QR code that directly triggers Google Pay, PhonePe, Paytm, or CRED on mobile devices without browser redirection.

### 4. WhatsApp Smartphone Simulator
- An interactive smartphone frame modal previewing the exact automated recovery message sent to the student.
- Includes personalized student salutations, kitchen urgency copywriting, and a high-converting **Complete Payment via Razorpay** CTA button.

### 5. Autonomous Merchant Financial AI Copilot (Tool Calling / Function Execution)
- An active intelligence agent capable of executing actions on the canteen database:
  - `toggle_item_availability`: Real-time stock control (*"Mark Shawarma sold out"* or *"Enable Biryani"*).
  - `trigger_batch_recovery`: Automatically scans and recovers all dropped lunch rush orders.
  - `get_financial_audit`: Natural language audit of recovered revenue, margin protected, and anti-gaming interventions.

### 6. FinTech Security & Cryptographic Integrity
- **HMAC-SHA256 Signature Verification:** Standard orders cryptographically verified using `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)`.
- **Timing-Safe Webhook Authentication:** Incoming Razorpay webhooks validated against `x-razorpay-signature` using `crypto.timingSafeEqual`.

### 7. Neo-Brutalist Comic Pop Design System
- Custom visual language inspired by modern interactive web experiences (warm parchment canvas `#fffdf7`, 2.5px solid ink outlines, 4px hard offset drop-shadows, tilted comic badges, tactile micro-animations).

---

## 💳 Razorpay APIs & Endpoints Integrated

| API / Feature | Endpoint / SDK Method | Purpose |
| :--- | :--- | :--- |
| **Razorpay Standard Orders** | `razorpay.orders.create({ amount, currency, receipt })` | Standard menu checkout for students placing live canteen orders. |
| **Payment Links API** | `razorpay.paymentLink.create({ amount, description, customer, notify, expire_by })` | Generates secure, personalized payment recovery links with dynamic micro-incentives. |
| **Checkout Modal Interception** | `modal.ondismiss` & `payment.failed` | Client-side autonomous drop detection when student closes checkout modal without paying. |
| **Cryptographic Webhook Verification** | `crypto.timingSafeEqual(expected, actual)` | Authenticates incoming `payment_link.paid` and `order.paid` webhooks with raw body buffers. |
| **Order Signature Verification** | `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)` | Cryptographically authenticates client checkout integrity before issuing kitchen tokens. |
| **Native UPI Intent Protocol** | `upi://pay?pa=...&pn=...&am=...&tr=...` | Direct UPI intent QR generator for instant 1-scan mobile payments via GPay/PhonePe. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend:** Node.js, Express.js, CORS, Dotenv.
- **Background Daemon:** `abandonmentWatcher.js` (server-side autonomous polling worker).
- **Payment Gateway:** Razorpay Node.js SDK (`razorpay`), Razorpay Checkout.js.
- **AI & LLMs:**
  - Primary: Google Gemini 2.5 Flash (`@google/genai`)
  - Secondary / High-Speed Fallback: Groq Llama-3.3 (`groq-sdk`)
- **Version Control:** Git with clean, semantic commit history.

```
meceatz-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── ai.js                  # Multi-LLM runner (Gemini 2.5 + Groq) with latency auditing
│   │   │   ├── db.js                  # In-memory canteen DB (orders, menu, recovery logs)
│   │   │   └── razorpay.js            # Razorpay SDK initialization
│   │   ├── routes/
│   │   │   └── api.js                 # Orders, recovery, copilot, and webhook routes
│   │   ├── services/
│   │   │   ├── abandonmentWatcher.js  # Server-side background watcher for stale orders
│   │   │   ├── copilotAgent.js        # Merchant copilot with tool calling
│   │   │   └── recoveryAgent.js       # Core AI recovery agent + Anti-Gaming shield
│   │   └── server.js                  # Express app entry & daemon launcher
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentTimeline.jsx      # Live autonomous recovery feed + UPI QR codes
│   │   │   ├── CartDrawer.jsx         # Cart drawer with live checkout & demo test triggers
│   │   │   ├── CopilotTab.jsx         # Natural language merchant copilot
│   │   │   ├── FoodMenu.jsx           # Student canteen food menu
│   │   │   ├── MetricsBar.jsx         # Live financial and recovery KPIs
│   │   │   ├── RushHourPredictor.jsx  # Kitchen load and queue status
│   │   │   └── WhatsAppModal.jsx      # Student WhatsApp recovery message simulator
│   │   ├── App.jsx                    # Core dashboard & checkout modal event listeners
│   │   └── index.css                  # Neo-Brutalist Comic Pop styling
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm installed
- Razorpay Test Key ID & Secret from [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Gemini API Key and/or Groq API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Ajay-Krishna00/meceatz-ai.git
cd meceatz-ai
```

### 2. Configure Backend Environment
Navigate to `backend/` and create a `.env` file:
```env
PORT=5000
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```
The backend starts at `http://localhost:5000` (and starts the background `abandonmentWatcher` daemon automatically).

### 4. Install & Start Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:3000`.

---

## 🧪 Testing the Autonomous Recovery Flow

### Scenario A: Testing Real-Time Modal Dismissal (Zero Merchant Intervention)
1. Switch to the **🍔 Student Canteen** tab.
2. Add any item (e.g. *Chicken Shawarma Roll*) to the cart.
3. Click **Proceed to Checkout** to launch the Razorpay Checkout sheet.
4. Close / dismiss the Razorpay modal (`✕`) without paying.
5. Notice the instant toast notification: the **AI Recovery Agent automatically intercepted the drop**, scored churn risk, and minted a live Razorpay Payment Link!
6. Switch back to **AI Recovery & Copilot** to inspect the newly recovered order in the live feed.

### Scenario B: Testing via the Demo Trigger
1. In the **🍔 Student Canteen** tab, add items to cart and open the Cart Drawer.
2. Click **🧪 Demo: Force Cart Drop** at the bottom of the drawer.
3. The AI agent immediately generates a personalized recovery package.

### Scenario C: Testing UPI QR & WhatsApp Simulation
1. On any card in the **Autonomous Recovery Agent Feed**, click **Show QR** to reveal the scannable UPI Intent QR code.
2. Click **📱 Open WhatsApp Simulator** to view the personalized student message and click the payment CTA.

### Scenario D: Testing the Merchant AI Copilot
1. Scroll down to the **AI Copilot** console.
2. Try commands like:
   - *"How much revenue was recovered today?"*
   - *"What are students dropping off on?"*
   - *"Mark Shawarma sold out"* (watch the live menu update instantly!)

---

## 👨‍💻 Author & Acknowledgements

- **Created by:** [Ajay Krishna](https://github.com/Ajay-Krishna00)
- **Institution:** Govt Model Engineering College (MEC), Kochi
- **Event:** Razorpay AI Builder Track / Buildathon 2026
