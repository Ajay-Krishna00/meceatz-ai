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
1. When a student abandons a cart or fails checkout, the **Autonomous AI Recovery Agent** assesses order value, meal shelf-life, and live kitchen congestion.
2. It autonomously generates a time-sensitive **Razorpay Payment Link** (`razorpay.paymentLink.create`) embedded with a dynamic incentive (e.g., ₹15 instant recovery discount or Express Kitchen Counter pass).
3. It dispatches a personalized, urgency-optimized recovery message via WhatsApp / SMS.
4. If the student prefers instant counter scanning, an **Inline Dynamic UPI QR Code** is generated for 1-click payment with GPay, PhonePe, or Paytm.
5. Canteen merchants control and audit everything through a **Natural Language Financial AI Copilot** and an **AI Kitchen Rush-Hour Load Predictor**.

---

## 🏗️ System Architecture & Workflow

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  Student Canteen Web Store                  │
   │      (Neo-Brutalist Comic Pop UI · Live Menu & Cart)        │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
      [Razorpay Checkout Modal]       [Checkout Drop / Abandoned]
       (Standard Web Checkout)                    │
                  │                               ▼
                  │                  ┌───────────────────────────┐
                  │                  │  Autonomous AI Recovery   │
                  │                  │   Agent (Groq & Gemini)   │
                  │                  └────────────┬──────────────┘
                  │                               │
                  ▼                               ▼
       [Razorpay Orders API]         [Razorpay Payment Links API]
        (Signature Verified)          (Dynamic Micro-Incentive)
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  Merchant Operations Hub                    │
   │  • Live Autonomous Feed     • Kitchen Rush-Hour Predictor   │
   │  • WhatsApp Simulator Modal • Dynamic Inline UPI QR Codes   │
   │  • Merchant AI Copilot (LLM Natural Language Analytics)     │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Features Built for Hackathon

### 1. Autonomous Revenue Recovery Agent (Razorpay Payment Links API)
- Detects checkout drop-offs and uses **Google Gemini 2.5 Flash** with **Groq Llama-3.3** fallback to determine:
  - **Churn Risk Score:** High / Medium / Low based on order composition, basket value, and campus delay.
  - **Deterministic Financial Guardrails:** Strictly server-enforced margin bounds (capped at max 10% or ₹15) — zero risk of prompt injection manipulating rupee figures.
  - **Anti-Gaming Shield:** Detects repeat drop-off attempts per student phone number within 12 hours. Replaces monetary discounts with non-monetary queue tokens ("Priority Pickup Pass") to eliminate moral hazard.
  - **Real Razorpay Payment Link Creation:** Integrates directly with Razorpay `/v1/payment_links` API with accurate 20-minute expiry and merchant reference tracking.

### 2. WhatsApp Smartphone Simulator
- An interactive, smartphone frame modal previewing the exact automated message received by the student.
- Includes personalized student salutations, dynamic urgency copywriting, and a high-converting **Complete Payment via Razorpay** CTA button.

### 3. AI Canteen Rush-Hour & Dynamic Kitchen Engine
- Continuously calculates campus traffic windows (Peak Lunch Rush 12:45–1:30 PM, Evening Snack Rush 4:00–5:15 PM) with dynamic kitchen load %, live queue lengths, and prep wait times.
- Features **⚡ Trigger Auto-Pilot Recovery** to deploy batch recovery passes with Razorpay links to queue dropouts.

### 4. Native Inline 1-Click UPI Intent QR Code
- Because Indian college students primarily transact via UPI, each recovery card encodes a **native `upi://pay` URI** (`upi://pay?pa=razorpay@icici&pn=MEC%20Canteen&am=...&cu=INR&tr=...`).
- Directly triggers the Google Pay, PhonePe, Paytm, or CRED payment sheet when scanned, without browser redirection.

### 5. Autonomous Merchant Financial AI Copilot (Tool Calling / Function Execution)
- An active intelligence agent capable of executing actions on the canteen system:
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
| **Payment Links API** | `razorpay.paymentLink.create({ amount, description, customer, notify, expire_by })` | Generates secure, personalized payment recovery links with automated SMS/email reminders. |
| **Cryptographic Webhook Verification** | `crypto.timingSafeEqual(expected, actual)` | Authenticates incoming `payment_link.paid` and `order.paid` webhooks with raw body buffers. |
| **Order Signature Verification** | `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)` | Cryptographically authenticates client checkout integrity before issuing kitchen tokens. |
| **Native UPI Intent Protocol** | `upi://pay?pa=...&pn=...&am=...&tr=...` | Direct UPI intent QR generator for instant 1-scan mobile payments via GPay/PhonePe. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend:** Node.js, Express.js, CORS, Dotenv.
- **Payment Gateway:** Razorpay Node.js SDK (`razorpay`), Razorpay Checkout.js.
- **AI & LLMs:**
  - Primary: Google Gemini 2.5 Flash (`@google/genai`)
  - Secondary / High-Speed: Groq Llama-3.3 / Qwen (`groq-sdk`)
- **Version Control:** Git with clean, semantic commit history.

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
The backend starts at `http://localhost:5000`.

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

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. The app lands directly on the **AI Copilot & Recovery** dashboard.
3. Review the live **Autonomous Recovery Agent Feed** populated with recovered orders and active Razorpay Payment Links.
4. Click **📱 Open WhatsApp Simulator** on any card to view the simulated recovery notification and test the direct checkout button.
5. Click **Show QR** on any card to display the dynamic UPI QR code.
6. Scroll to the **AI Copilot** at the bottom and ask:
   - *"How much revenue was recovered today?"*
   - *"What are students dropping off on?"*
7. Switch to the **🍔 Student Canteen** tab to browse the menu, add items to cart, and experience standard Razorpay Checkout.

---

## 👨‍💻 Author & Acknowledgements

- **Created by:** [Ajay Krishna](https://github.com/Ajay-Krishna00)
- **Institution:** Govt Model Engineering College (MEC), Kochi
- **Event:** Razorpay AI Builder Internship / Buildathon 2026
