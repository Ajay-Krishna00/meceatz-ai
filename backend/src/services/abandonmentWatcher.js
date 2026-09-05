import { db } from "../data/db.js";
import { processAbandonedCart } from "./recoveryAgent.js";

const STALE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
const POLL_INTERVAL_MS = 90 * 1000; // Check every 90 seconds
const processedOrderIds = new Set();

/**
 * Server-Side Autonomous Abandonment Watcher
 * Scans for orders stuck in "pending_payment" for >3 minutes.
 * Auto-marks them as abandoned and fires the AI recovery agent.
 */
async function scanForStaleOrders() {
  const orders = db.getOrders();
  const now = Date.now();

  const staleOrders = orders.filter((order) => {
    if (order.status !== "pending_payment") return false;
    if (processedOrderIds.has(order.id)) return false;
    const createdAt = new Date(order.createdAt).getTime();
    return (now - createdAt) > STALE_THRESHOLD_MS;
  });

  if (staleOrders.length === 0) return;

  console.log("Abandonment Watcher: Found " + staleOrders.length + " stale order(s) pending > 3 min");

  for (const order of staleOrders) {
    try {
      processedOrderIds.add(order.id);
      db.updateOrder(order.id, {
        status: "abandoned",
        dropReason: "Server-Side Auto-Detection: Payment not completed within 3 minutes"
      });

      const recoveryLog = await processAbandonedCart({
        items: order.items,
        totalAmount: order.amount,
        customer: order.customer,
        dropReason: "Auto-Detected: Payment pending > 3 min (server-side watcher)",
        orderId: order.id
      });

      db.addWebhook({
        event: "ai.abandonment.auto_detected",
        payload: {
          orderId: order.id,
          recoveryId: recoveryLog.id,
          detectionMethod: "server_side_stale_order_watcher",
          staleDurationMs: Date.now() - new Date(order.createdAt).getTime(),
          paymentLinkId: recoveryLog.paymentLinkId
        }
      });

      console.log("  Auto-recovered order " + order.id + " for " + (order.customer?.name || "Student"));
    } catch (err) {
      console.error("  Failed to auto-recover order " + order.id + ":", err.message);
    }
  }
}

let watcherInterval = null;

export function startAbandonmentWatcher() {
  if (watcherInterval) return;
  console.log("Abandonment Watcher started: Scanning every 90s for stale pending_payment orders");
  setTimeout(() => scanForStaleOrders(), 30 * 1000);
  watcherInterval = setInterval(() => scanForStaleOrders(), POLL_INTERVAL_MS);
}

export function stopAbandonmentWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    console.log("Abandonment Watcher stopped");
  }
}
