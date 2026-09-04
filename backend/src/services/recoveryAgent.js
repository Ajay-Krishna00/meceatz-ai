import { generateAICompletion } from "../config/ai.js";
import { razorpayService } from "./razorpayService.js";
import { db } from "../data/db.js";

const SYSTEM_PROMPT = `You are the MEC-Eatz Autonomous Revenue Recovery AI Agent for the Govt Model Engineering College (MEC) Canteen.
When a student abandons their food order or experiences a payment failure (UPI timeout, gateway drop, closed tab), your job is to:
1. Analyze the basket items, total value, failure reason, and campus time context (e.g., 1 PM lunch break rush, 4 PM snack rush).
2. Autonomously choose an optimal dynamic micro-incentive:
   - If cart value > ₹150: Offer ₹15 off or a 5-10% discount to instantly convert.
   - If quick beverage/snack: Offer "Priority Express Pickup" (skip the 15-minute queue).
   - If payment failed due to UPI timeout: Provide a frictionless 1-click Razorpay payment link reassurance.
3. Write a punchy, warm, high-converting WhatsApp recovery message (under 60 words) tailored to MEC college students with emojis.
4. Output strict JSON with the following schema:
{
  "incentiveType": "discount" | "priority_pickup" | "free_addon",
  "discountAmount": number,
  "finalAmount": number,
  "headline": string,
  "reasoning": string,
  "whatsappMessage": string,
  "urgencyScore": number
}`;

export async function processAbandonedCart(orderData) {
  const { items, totalAmount, customer, dropReason = "checkout_abandoned", orderId } = orderData;
  const itemsSummary = items.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ");

  const userPrompt = `Customer: ${customer?.name || "Student"} (${customer?.contact || "+919876543210"})
Cart Items: ${itemsSummary}
Total Cart Value: ₹${totalAmount}
Drop Reason: ${dropReason}
Current Time: ${new Date().toLocaleTimeString()} (College Canteen Hours)`;

  let decision = null;
  try {
    decision = await generateAICompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3
    });
  } catch (err) {
    console.error("AI recovery inference failed, using heuristic:", err.message);
  }

  if (!decision || !decision.whatsappMessage) {
    const discount = totalAmount > 150 ? 15 : 10;
    const finalVal = Math.max(10, totalAmount - discount);
    decision = {
      incentiveType: "discount",
      discountAmount: discount,
      finalAmount: finalVal,
      headline: "Fresh Meal Reserved! Grab ₹" + discount + " Off",
      reasoning: "High cart value with hot food items prone to kitchen sellout. Micro-discount triggers immediate conversion.",
      whatsappMessage: `Hey ${customer?.name || "there"}! 👋 Your ${items[0]?.name || "canteen order"} is fresh in the kitchen. Complete payment in 1-click via Razorpay and enjoy ₹${discount} OFF before the counter closes! 🍔⚡`,
      urgencyScore: 88
    };
  }

  const finalAmountToCharge = decision.finalAmount || Math.max(10, totalAmount - (decision.discountAmount || 0));

  const linkResult = await razorpayService.createPaymentLink({
    amount: finalAmountToCharge,
    description: `MEC-Eatz Recovery: ${items[0]?.name || "Canteen Meal"} (₹${decision.discountAmount || 0} OFF Applied)`,
    customer: {
      name: customer?.name || "MEC Student",
      email: customer?.email || "student@mec.ac.in",
      contact: customer?.contact || "+919876543210"
    },
    notes: {
      original_amount: totalAmount,
      discount_applied: decision.discountAmount,
      reasoning: (decision.reasoning || "").slice(0, 200)
    },
    expireInMinutes: 15
  });

  const paymentLink = linkResult.success ? linkResult.paymentLink : linkResult.fallbackLink;
  const paymentUrl = paymentLink.short_url || `https://rzp.io/i/mec_${Date.now()}`;

  const formattedNotification = `${decision.whatsappMessage}\n\n👉 Pay Now: ${paymentUrl}\n*(Valid for 15 mins)*`;

  const recoveryLog = {
    id: "rec-" + Date.now(),
    timestamp: new Date().toISOString(),
    orderId: orderId || "ord_" + Date.now().toString().slice(-6),
    customer: customer || { name: "MEC Student", contact: "+919876543210" },
    items,
    originalAmount: totalAmount,
    discountAmount: decision.discountAmount || 0,
    recoveredAmount: finalAmountToCharge,
    reasoning: decision.reasoning,
    headline: decision.headline,
    incentiveType: decision.incentiveType,
    urgencyScore: decision.urgencyScore,
    paymentLinkUrl: paymentUrl,
    paymentLinkId: paymentLink.id,
    whatsappMessage: formattedNotification,
    status: "dispatched"
  };

  db.addRecoveryLog(recoveryLog);
  db.addWebhook({
    event: "ai.recovery.dispatched",
    payload: {
      recoveryId: recoveryLog.id,
      amount: finalAmountToCharge,
      paymentLinkId: paymentLink.id
    }
  });

  return recoveryLog;
}
