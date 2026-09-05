import { generateAICompletion } from "../config/ai.js";
import { razorpayService } from "./razorpayService.js";
import { db } from "../data/db.js";

function sanitizeInput(text, maxLength = 60) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[{}[\]<>`$]/g, "")
    .replace(/ignore previous instructions/gi, "")
    .replace(/system override/gi, "")
    .replace(/set discount/gi, "")
    .trim()
    .slice(0, maxLength);
}

const SYSTEM_PROMPT = `You are the MEC-Eatz Autonomous Revenue Recovery AI Agent for the Govt Model Engineering College (MEC) Canteen.
When a student abandons their food order or experiences a payment failure (UPI timeout, gateway drop, closed tab), your job is to:
1. Analyze the basket items, total value, failure reason, and campus time context.
2. Select an engaging dynamic customer hook:
   - For high value (>₹150): "Fresh meal reserved in kitchen! Complete in 1-click"
   - For snacks/beverages: "Queue-Bypass Active! Pick up at express counter"
3. Write a punchy, warm, high-converting WhatsApp recovery message (under 50 words) tailored to MEC college students with emojis.
4. Output strict JSON with the following schema:
{
  "headline": string,
  "reasoning": string,
  "whatsappMessage": string,
  "urgencyScore": number
}`;

export async function processAbandonedCart(orderData) {
  const { customer, dropReason = "checkout_abandoned", orderId } = orderData;
  const items = orderData.items || [];
  const totalAmount = Number(orderData.totalAmount ?? orderData.amount ?? 0);
  const recoveryId = "rec-" + Date.now();
  const safeName = sanitizeInput(customer?.name || "Student", 40);
  const safeContact = sanitizeInput(customer?.contact || "+919847123456", 15);
  const safeDropReason = sanitizeInput(dropReason, 50);

  const itemsSummary = items.map((i) => `${sanitizeInput(i.name, 30)} (x${Number(i.quantity) || 1})`).join(", ");

  // -------------------------------------------------------------
  // 🛡️ FINANCIAL GUARDRAIL & ANTI-GAMING MORAL HAZARD PROTECTION
  // -------------------------------------------------------------
  const recoveryHistory = db.getCustomerRecoveryHistory(safeContact);
  const isAbuseRisk = recoveryHistory.length >= 1; // Student already got recovery discount today

  let verifiedDiscount = 0;
  let incentiveType = "priority_pickup";
  let guardrailReason = "";

  if (isAbuseRisk) {
    // Prevent intentional cart abandonment loops: 0 monetary discount, only queue pass
    verifiedDiscount = 0;
    incentiveType = "priority_pickup";
    guardrailReason = "Anti-Gaming Guardrail: Student already claimed a recovery perk in the last 12 hours. Cash discount restricted to prevent moral hazard; Priority Pickup token assigned.";
  } else if (totalAmount < 120) {
    // Low value baskets cannot sustain margin loss
    verifiedDiscount = 0;
    incentiveType = "free_addon";
    guardrailReason = "Margin Protection Guardrail: Cart under ₹120 threshold. Cash discount disabled; complimentary Toum/Dip addon granted.";
  } else {
    // Strictly cap discount: max 10% of cart or ₹15, whichever is lower
    const maxAllowedDiscount = Math.min(15, Math.floor(totalAmount * 0.10));
    verifiedDiscount = Math.max(5, maxAllowedDiscount);
    incentiveType = "discount";
    guardrailReason = `Dynamic Micro-Discount: ₹${verifiedDiscount} (capped at 10% / ₹15 max ceiling to guarantee positive canteen contribution margin).`;
  }

  // Server strictly calculates charge amount — never trust unconstrained LLM output for rupee figures
  const finalAmountToCharge = Math.max(10, totalAmount - verifiedDiscount);

  const userPrompt = `Customer: ${safeName}
Cart Items: ${itemsSummary}
Total Cart Value: ₹${totalAmount}
Assigned Incentive: ${incentiveType} (${verifiedDiscount > 0 ? "₹" + verifiedDiscount + " OFF" : "Express Queue Token"})
Drop Reason: ${safeDropReason}
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

  const defaultHeadline = verifiedDiscount > 0
    ? `Fresh Meal Reserved! Grab ₹${verifiedDiscount} Off`
    : `Express Counter Pickup Token Reserved!`;

  const defaultMessage = verifiedDiscount > 0
    ? `Hey ${safeName}! 👋 Your ${items[0]?.name || "canteen order"} is being prepared fresh. Complete payment in 1-click via Razorpay and enjoy ₹${verifiedDiscount} OFF before the lunch counter closes! 🍔⚡`
    : `Hey ${safeName}! 👋 Counter lines are moving fast. Complete payment in 1-click via Razorpay and flash your Express Pickup Pass at Counter 2 to collect your ${items[0]?.name || "meal"} immediately! ⏱️⚡`;

  const finalHeadline = decision?.headline || defaultHeadline;
  const finalMessage = decision?.whatsappMessage || defaultMessage;
  const finalReasoning = `${guardrailReason} ${decision?.reasoning || "Optimized for quick campus conversion during rush hour."}`;

  // Call Real Razorpay Payment Links API with strict server-computed amount
  const linkResult = await razorpayService.createPaymentLink({
    amount: finalAmountToCharge,
    description: `MEC-Eatz Recovery: ${items[0]?.name || "Canteen Meal"} (${verifiedDiscount > 0 ? "₹" + verifiedDiscount + " OFF" : "Express Pass"})`,
    customer: {
      name: safeName,
      email: customer?.email || "student@mec.ac.in",
      contact: safeContact
    },
    notes: {
      orderId: orderId || `ord_${recoveryId}`,
      recoveryId: recoveryId,
      original_amount: totalAmount,
      discount_applied: verifiedDiscount,
      incentive_type: incentiveType,
      anti_gaming_passed: !isAbuseRisk,
      reasoning: finalReasoning.slice(0, 150)
    },
    expireInMinutes: 20
  });

  const paymentLink = linkResult.success ? linkResult.paymentLink : linkResult.fallbackLink;
  const paymentUrl = paymentLink.short_url || `https://rzp.io/i/mec_${Date.now()}`;
  const upiIntentUri = linkResult.upiIntentUri || razorpayService.generateUpiIntent({
    amount: finalAmountToCharge,
    orderId: paymentLink.id,
    note: "MEC Canteen Recovery"
  });

  const formattedNotification = `${finalMessage}\n\n👉 Pay Now: ${paymentUrl}\n*(Valid for 20 mins · Razorpay UPI)*`;

  const recoveryLog = {
    id: recoveryId,
    timestamp: new Date().toISOString(),
    orderId: orderId || "ord_" + Date.now().toString().slice(-6),
    customer: { name: safeName, contact: safeContact },
    items,
    originalAmount: totalAmount,
    discountAmount: verifiedDiscount,
    recoveredAmount: finalAmountToCharge,
    reasoning: finalReasoning,
    headline: finalHeadline,
    incentiveType,
    urgencyScore: decision?.urgencyScore || 85,
    antiGamingEnforced: isAbuseRisk,
    aiMeta: decision?._aiMeta || { aiModelUsed: "heuristic-fallback", aiProvider: "local", aiLatencyMs: 0, fallbackUsed: true },
    paymentLinkUrl: paymentUrl,
    paymentLinkId: paymentLink.id,
    upiIntentUri,
    whatsappMessage: formattedNotification,
    status: "dispatched",
    antiGamingEnforced: isAbuseRisk
  };

  db.addRecoveryLog(recoveryLog);
  db.addWebhook({
    event: "ai.recovery.dispatched",
    payload: {
      recoveryId: recoveryLog.id,
      amount: finalAmountToCharge,
      paymentLinkId: paymentLink.id,
      discountApplied: verifiedDiscount,
      antiGamingPassed: !isAbuseRisk
    }
  });

  return recoveryLog;
}

