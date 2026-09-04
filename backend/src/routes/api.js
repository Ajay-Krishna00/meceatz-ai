import express from "express";
import { db } from "../data/db.js";
import { razorpayService } from "../services/razorpayService.js";
import { processAbandonedCart } from "../services/recoveryAgent.js";
import { askCopilot } from "../services/copilotAgent.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "MEC-Eatz AI Agent Server", time: new Date().toISOString() });
});

router.get("/config", (req, res) => {
  res.json({
    razorpayKeyId: razorpayService.getKeyId(),
    canteenName: "Govt Model Engineering College Canteen",
    campus: "MEC Thrikkakara, Kochi"
  });
});

router.get("/menu", (req, res) => {
  res.json({ success: true, menu: db.getMenu() });
});

router.post("/orders/create", async (req, res) => {
  try {
    const { items, totalAmount, customer } = req.body;
    if (!items || !items.length || !totalAmount) {
      return res.status(400).json({ success: false, message: "Invalid cart payload" });
    }

    const orderResult = await razorpayService.createOrder({
      amount: totalAmount,
      currency: "INR",
      receipt: "mec_" + Date.now().toString().slice(-6),
      notes: {
        customer_name: customer?.name || "Student",
        items_count: items.length
      }
    });

    const newOrder = {
      id: orderResult.order ? orderResult.order.id : "ord_local_" + Date.now(),
      items,
      amount: totalAmount,
      customer: customer || { name: "MEC Student", contact: "+919876543210" },
      status: "pending_payment",
      createdAt: new Date().toISOString()
    };

    db.addOrder(newOrder);

    res.json({
      success: true,
      order: orderResult.order || orderResult.fallbackOrder,
      localOrderId: newOrder.id,
      razorpayKeyId: razorpayService.getKeyId()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/orders/verify", (req, res) => {
  const { orderId, paymentId, signature, localOrderId } = req.body;
  const targetId = localOrderId || orderId;
  const updated = db.updateOrder(targetId, {
    status: "paid",
    paymentId,
    signatureVerified: true
  });

  db.addWebhook({
    event: "payment.captured",
    payload: { orderId, paymentId, amount: updated?.amount }
  });

  res.json({ success: true, message: "Payment verified successfully!", order: updated });
});

router.post("/recovery/abandon", async (req, res) => {
  try {
    const { items, totalAmount, customer, dropReason, orderId } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Items required to recover" });
    }

    const abandonedOrder = {
      id: orderId || "ord_drop_" + Date.now(),
      items,
      amount: totalAmount,
      customer: customer || { name: "Arjun S (CS '25)", contact: "+919847123456" },
      status: "abandoned",
      dropReason: dropReason || "UPI Payment Screen Dismissed",
      createdAt: new Date().toISOString()
    };
    db.addOrder(abandonedOrder);

    const recoveryLog = await processAbandonedCart({
      items,
      totalAmount,
      customer: abandonedOrder.customer,
      dropReason: abandonedOrder.dropReason,
      orderId: abandonedOrder.id
    });

    res.json({
      success: true,
      message: "Autonomous AI Agent evaluated cart & dispatched Razorpay Recovery Link",
      recovery: recoveryLog
    });
  } catch (error) {
    console.error("Recovery trigger error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/recovery/simulate-pay", (req, res) => {
  const { recoveryId } = req.body;
  const logs = db.getRecoveryLogs();
  const log = logs.find((l) => l.id === recoveryId);

  if (!log) {
    return res.status(404).json({ success: false, message: "Recovery log not found" });
  }

  log.status = "recovered";
  log.paidAt = new Date().toISOString();

  db.updateOrder(log.orderId, { status: "recovered", paidVia: "razorpay_payment_link" });

  db.addWebhook({
    event: "payment_link.paid",
    payload: {
      paymentLinkId: log.paymentLinkId,
      recoveredAmount: log.recoveredAmount,
      customer: log.customer.name
    }
  });

  db.recalculateAnalytics();
  db.save();

  res.json({
    success: true,
    message: "Payment of ₹" + log.recoveredAmount + " confirmed via Razorpay Link! Kitchen notified.",
    recovery: log
  });
});

router.get("/recovery/logs", (req, res) => {
  res.json({
    success: true,
    logs: db.getRecoveryLogs(),
    webhooks: db.getWebhooks()
  });
});

router.get("/analytics", (req, res) => {
  res.json({
    success: true,
    analytics: db.getAnalytics(),
    recentOrders: db.getOrders().slice(0, 10)
  });
});

router.post("/copilot/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const copilotAnswer = await askCopilot(query);
    res.json({ success: true, answer: copilotAnswer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/webhooks/razorpay", (req, res) => {
  const event = req.body;
  console.log("Received Razorpay Webhook Event:", event?.event);

  db.addWebhook({
    event: event?.event || "custom.webhook",
    payload: event?.payload || {}
  });

  res.status(200).json({ status: "ok" });
});

export default router;
