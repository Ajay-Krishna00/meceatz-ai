import crypto from "crypto";
import { razorpay, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } from "../config/razorpay.js";

export const razorpayService = {
  getKeyId() {
    return RAZORPAY_KEY_ID;
  },

  /**
   * Generates a native UPI Intent URI for 1-click scanning via GPay, PhonePe, Paytm, CRED
   */
  generateUpiIntent({ amount, orderId, note = "MEC Canteen Order" }) {
    const vpa = "razorpay@icici"; // Standard Merchant VPA or customized
    const payeeName = encodeURIComponent("Govt Model Engineering College Canteen");
    const txnNote = encodeURIComponent(note);
    const txnRef = encodeURIComponent(orderId || "MEC" + Date.now().toString().slice(-6));
    return `upi://pay?pa=${vpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${txnNote}&tr=${txnRef}`;
  },

  async createOrder({ amount, currency = "INR", receipt, notes = {} }) {
    try {
      const options = {
        amount: Math.round(amount * 100),
        currency,
        receipt: receipt || "rec_" + Date.now().toString().slice(-6),
        notes: {
          platform: "MEC-Eatz AI",
          ...notes
        }
      };
      const order = await razorpay.orders.create(options);
      return { success: true, order };
    } catch (error) {
      console.error("Razorpay order creation error:", error.message);
      return {
        success: false,
        error: error.message,
        fallbackOrder: {
          id: "order_mock_" + Date.now(),
          amount: Math.round(amount * 100),
          currency,
          receipt
        }
      };
    }
  },

  /**
   * Create Real Razorpay Payment Link
   */
  async createPaymentLink({ amount, description, customer, notes = {}, expireInMinutes = 30 }) {
    try {
      // Razorpay requires expire_by to be at least 16+ minutes in future
      const expireBy = Math.floor(Date.now() / 1000) + Math.max(20, expireInMinutes) * 60;
      
      let contact = customer?.contact || "+919847123456";
      if (!contact.startsWith("+91") && contact.length === 10) {
        contact = "+91" + contact;
      }

      const payload = {
        amount: Math.round(amount * 100),
        currency: "INR",
        accept_partial: false,
        description: description || "MEC-Eatz Canteen Recovery Order",
        customer: {
          name: customer?.name || "MEC Student",
          email: customer?.email || "student@mec.ac.in",
          contact: contact
        },
        notify: {
          sms: false,
          email: false
        },
        reminder_enable: false,
        expire_by: expireBy,
        notes: {
          agent: "MEC-Eatz-AI-Recovery-Agent",
          canteen: "Govt Model Engineering College",
          ...notes
        }
      };

      console.log("Calling Razorpay paymentLink.create with amount:", payload.amount);
      const paymentLink = await razorpay.paymentLink.create(payload);
      console.log("✅ REAL RAZORPAY PAYMENT LINK CREATED:", paymentLink.short_url, "ID:", paymentLink.id);
      
      const upiIntentUri = this.generateUpiIntent({
        amount,
        orderId: paymentLink.id,
        note: `MEC Canteen ${description}`.slice(0, 50)
      });

      return { success: true, paymentLink, upiIntentUri };
    } catch (error) {
      console.error("❌ Razorpay payment link error:", error.message || error);
      const mockId = "plink_" + Date.now();
      return {
        success: false,
        error: error.message,
        fallbackLink: {
          id: mockId,
          short_url: "https://rzp.io/rzp/HKWSgYic",
          amount: Math.round(amount * 100),
          status: "created"
        },
        upiIntentUri: this.generateUpiIntent({
          amount,
          orderId: mockId,
          note: "MEC Canteen Recovery"
        })
      };
    }
  },

  /**
   * Cryptographically verify standard Checkout signature:
   * HMAC-SHA256(order_id + '|' + payment_id, RAZORPAY_KEY_SECRET) === signature
   */
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      return { valid: false, reason: "Missing orderId, paymentId, or signature" };
    }

    const secret = RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes("your_razorpay_secret")) {
      // In development mode without real secret, reject if explicitly bad signature
      if (signature === "fake" || signature === "invalid") {
        return { valid: false, reason: "Invalid simulated signature" };
      }
      return { valid: true, testMode: true, reason: "Dev Test Mode signature accepted" };
    }

    try {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const bufA = Buffer.from(generatedSignature, "utf-8");
      const bufB = Buffer.from(signature, "utf-8");
      if (bufA.length !== bufB.length) {
        return { valid: false, reason: "Signature length mismatch" };
      }

      const isValid = crypto.timingSafeEqual(bufA, bufB);
      return { valid: isValid, reason: isValid ? "Verified successfully" : "Cryptographic signature mismatch" };
    } catch (err) {
      return { valid: false, reason: err.message };
    }
  },

  /**
   * Cryptographically verify Webhook raw body signature against x-razorpay-signature header
   */
  verifyWebhookSignature(rawBody, signature, secret = RAZORPAY_WEBHOOK_SECRET) {
    if (!signature || !secret || !rawBody) return false;
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      const bufExpected = Buffer.from(expectedSignature, "utf-8");
      const bufActual = Buffer.from(signature, "utf-8");
      if (bufExpected.length !== bufActual.length) return false;

      return crypto.timingSafeEqual(bufExpected, bufActual);
    } catch (err) {
      console.error("Webhook signature verification error:", err.message);
      return false;
    }
  }
};

