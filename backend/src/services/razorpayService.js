import crypto from "crypto";
import { razorpay, RAZORPAY_KEY_ID } from "../config/razorpay.js";

export const razorpayService = {
  getKeyId() {
    return RAZORPAY_KEY_ID;
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
      return { success: true, paymentLink };
    } catch (error) {
      console.error("❌ Razorpay payment link error:", error.message || error);
      // Fallback
      return {
        success: false,
        error: error.message,
        fallbackLink: {
          id: "plink_" + Date.now(),
          short_url: "https://rzp.io/rzp/HKWSgYic",
          amount: Math.round(amount * 100),
          status: "created"
        }
      };
    }
  },

  verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature || !secret) return false;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return expectedSignature === signature;
  }
};
