import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "database.json");

const initialMenu = [
  {
    id: "item-1",
    name: "MEC Special Chicken Shawarma",
    category: "Quick Bites",
    price: 130,
    available: true,
    prepTime: "5 mins",
    tag: "Bestseller",
    description: "Spiced chicken cubes rolled in fluffy rumali roti with garlic toum & fries."
  },
  {
    id: "item-2",
    name: "Malabar Dum Biryani",
    category: "Main Course",
    price: 180,
    available: true,
    prepTime: "8 mins",
    tag: "Campus Favorite",
    description: "Aromatic kaima rice layered with tender chicken, fried onions, and dates pickle."
  },
  {
    id: "item-3",
    name: "Crispy Canteen Cheeseburger",
    category: "Quick Bites",
    price: 140,
    available: true,
    prepTime: "6 mins",
    tag: "Hot Pick",
    description: "Crispy grilled patty, cheddar slice, crunchy lettuce, and house mayo on a toasted bun."
  },
  {
    id: "item-4",
    name: "Kerala Porotta & Roast",
    category: "Main Course",
    price: 110,
    available: true,
    prepTime: "5 mins",
    tag: "Classic",
    description: "Two flaky layered porottas paired with slow-roasted gravy and curry leaves."
  },
  {
    id: "item-5",
    name: "Cold Coffee & Choco Drizzle",
    category: "Beverages",
    price: 70,
    available: true,
    prepTime: "3 mins",
    tag: "Refreshing",
    description: "Frothy chilled coffee blended with milk, dark chocolate sauce, and ice cream scoop."
  },
  {
    id: "item-6",
    name: "Mango Passion Shake",
    category: "Beverages",
    price: 85,
    available: true,
    prepTime: "4 mins",
    tag: "Seasonal",
    description: "Thick mango pulp shake blended with chilled milk and honey drizzle."
  },
  {
    id: "item-7",
    name: "South Indian Canteen Meals",
    category: "Main Course",
    price: 90,
    available: true,
    prepTime: "2 mins",
    tag: "Wholesome",
    description: "Steaming boiled rice, sambar, thoran, pulissery, pickle, and crisp papadam."
  },
  {
    id: "item-8",
    name: "Masala Chai & Hot Samosas (2 pcs)",
    category: "Snacks",
    price: 45,
    available: true,
    prepTime: "2 mins",
    tag: "Evening Rush",
    description: "Cardamom ginger tea paired with hot potato-pea stuffed crispy samosas."
  }
];

class Database {
  constructor() {
    this.data = {
      menu: initialMenu,
      orders: [],
      recoveryLogs: [],
      webhooks: [],
      analytics: {
        totalOrders: 0,
        recoveredOrders: 0,
        recoveredRevenue: 0,
        abandonedRevenue: 0,
        recoveryRate: 0
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn("DB load error:", e.message);
    }
  }

  reset() {
    this.data.orders = [
      {
        id: "ord_178856001",
        items: [
          { id: "item-1", name: "MEC Special Chicken Shawarma", price: 130, quantity: 1 },
          { id: "item-5", name: "Cold Coffee & Choco Drizzle", price: 70, quantity: 1 }
        ],
        amount: 200,
        customer: { name: "Rahul Nair (EC 2026)", contact: "+919847123456" },
        status: "recovered",
        dropReason: "UPI Window Timed Out during Lunch Rush",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        id: "ord_178856002",
        items: [
          { id: "item-2", name: "Malabar Chicken Dum Biryani", price: 160, quantity: 1 }
        ],
        amount: 160,
        customer: { name: "Sneha Rao (CS 2025)", contact: "+919847654321" },
        status: "abandoned",
        dropReason: "18-Min Counter Queue Hesitation",
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      }
    ];
    this.data.recoveryLogs = [
      {
        id: "rec-101",
        timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
        orderId: "ord_178856001",
        customer: { name: "Rahul Nair (EC 2026)", contact: "+919847123456" },
        items: [
          { name: "MEC Special Chicken Shawarma", price: 130, quantity: 1 },
          { name: "Cold Coffee & Choco Drizzle", price: 70, quantity: 1 }
        ],
        originalAmount: 200,
        discountAmount: 15,
        recoveredAmount: 185,
        reasoning: "High-value cart during peak rush. A ₹15 instant recovery micro-incentive and express counter token overcame the UPI timeout.",
        headline: "Shawarma reserved! Grab ₹15 off before the batch sells out ⚡",
        incentiveType: "discount",
        urgencyScore: 8,
        paymentLinkUrl: "https://rzp.io/rzp/wG5JdKG",
        paymentLinkId: "plink_TY8vqUOfoBf8Zn",
        whatsappMessage: "Hey Rahul! 👋 Your MEC Special Chicken Shawarma & Cold Coffee were reserved. We applied a ₹15 discount to help you skip the queue!\n\n👉 Pay Now: https://rzp.io/rzp/wG5JdKG",
        status: "recovered",
        paidAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      },
      {
        id: "rec-102",
        timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        orderId: "ord_178856002",
        customer: { name: "Sneha Rao (CS 2025)", contact: "+919847654321" },
        items: [
          { name: "Malabar Chicken Dum Biryani", price: 160, quantity: 1 }
        ],
        originalAmount: 160,
        discountAmount: 10,
        recoveredAmount: 150,
        reasoning: "Perishable lunch order abandoned due to long counter queue. Proactive ₹10 discount with 1-click Razorpay payment link dispatched.",
        headline: "Skip the Biryani Counter line with Express Pickup 🍛",
        incentiveType: "discount",
        urgencyScore: 7,
        paymentLinkUrl: "https://rzp.io/rzp/ZW8IIx3",
        paymentLinkId: "plink_TY8uTRZJYv7Kbp",
        whatsappMessage: "Hey Sneha! Don't wait in the 18-min queue. Complete payment via Razorpay for ₹150 and collect directly from the Express Counter.\n\n👉 Pay: https://rzp.io/rzp/ZW8IIx3",
        status: "dispatched"
      }
    ];
    this.data.webhooks = [
      {
        id: "wh-101",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        event: "payment_link.paid",
        payload: {
          paymentLinkId: "plink_TY8vqUOfoBf8Zn",
          recoveredAmount: 185,
          customer: "Rahul Nair (EC 2026)"
        }
      },
      {
        id: "wh-102",
        timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        event: "ai.recovery.dispatched",
        payload: {
          recoveryId: "rec-102",
          amount: 150,
          paymentLinkId: "plink_TY8uTRZJYv7Kbp"
        }
      }
    ];
    this.recalculateAnalytics();
    this.save();
    return this.data;
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("DB save error:", e.message);
    }
  }

  getMenu() {
    return this.data.menu;
  }

  getOrders() {
    return this.data.orders;
  }

  addOrder(order) {
    this.data.orders.unshift(order);
    this.recalculateAnalytics();
    this.save();
    return order;
  }

  updateOrder(orderId, updates) {
    const idx = this.data.orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
      this.recalculateAnalytics();
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  addRecoveryLog(log) {
    this.data.recoveryLogs.unshift(log);
    this.recalculateAnalytics();
    this.save();
    return log;
  }

  getRecoveryLogs() {
    return this.data.recoveryLogs;
  }

  addWebhook(event) {
    this.data.webhooks.unshift({
      id: "wh-" + Date.now(),
      timestamp: new Date().toISOString(),
      ...event
    });
    this.save();
  }

  getWebhooks() {
    return this.data.webhooks.slice(0, 20);
  }

  toggleMenuItem(itemId, available) {
    const item = this.data.menu.find((m) => m.id === itemId || m.name.toLowerCase().includes(itemId.toLowerCase()));
    if (item) {
      item.available = available !== undefined ? available : !item.available;
      this.save();
      return item;
    }
    return null;
  }

  getCustomerRecoveryHistory(contact) {
    if (!contact) return [];
    const normalized = contact.replace(/\D/g, "").slice(-10);
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    return this.data.recoveryLogs.filter((log) => {
      const logContact = (log.customer?.contact || "").replace(/\D/g, "").slice(-10);
      const isMatch = logContact === normalized;
      const isRecent = new Date(log.timestamp).getTime() > twelveHoursAgo;
      return isMatch && isRecent;
    });
  }

  getUnrecoveredOrders() {
    return this.data.orders.filter((o) => o.status === "abandoned");
  }

  getKitchenMetrics() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeDecimal = hours + minutes / 60;

    // Peak lunch rush at MEC: 12:30 PM (12.5) to 1:45 PM (13.75)
    // Evening snack rush: 4:00 PM (16.0) to 5:15 PM (17.25)
    let baseLoad = 35;
    let windowLabel = "Off-Peak Window";
    let isSurge = false;

    if (timeDecimal >= 12.5 && timeDecimal <= 13.8) {
      baseLoad = 82;
      windowLabel = "Peak Lunch Rush (MEC 12:45–1:30 PM)";
      isSurge = true;
    } else if (timeDecimal >= 15.75 && timeDecimal <= 17.25) {
      baseLoad = 68;
      windowLabel = "Evening Snack Rush (Chai & Samosa)";
      isSurge = true;
    } else if (timeDecimal >= 9.0 && timeDecimal <= 11.5) {
      baseLoad = 55;
      windowLabel = "Morning Breakfast Counter";
    }

    const pendingCount = this.data.orders.filter((o) => o.status === "paid" || o.status === "recovered").length;
    const dynamicLoad = Math.min(98, Math.max(20, baseLoad + Math.floor(pendingCount % 12)));
    const estimatedQueue = Math.max(6, Math.round((dynamicLoad / 100) * 48));
    const avgWaitMinutes = Math.max(3, Math.round((estimatedQueue * 1.8) / 3));

    return {
      windowLabel,
      isSurge,
      kitchenLoadPercentage: dynamicLoad,
      queueLength: estimatedQueue,
      avgWaitMinutes,
      activePendingPrep: pendingCount,
      timestamp: now.toISOString()
    };
  }

  recalculateAnalytics() {
    const orders = this.data.orders || [];
    const totalOrders = orders.length;
    const recoveredOrders = orders.filter((o) => o.status === "recovered" || o.status === "paid_via_recovery").length;
    const recoveredRevenue = orders
      .filter((o) => o.status === "recovered" || o.status === "paid_via_recovery")
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const abandonedOrders = orders.filter((o) => o.status === "abandoned" || o.status === "failed" || o.status === "pending_payment").length;
    const abandonedRevenue = orders
      .filter((o) => o.status === "abandoned" || o.status === "failed" || o.status === "pending_payment")
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const totalDrops = recoveredOrders + abandonedOrders;
    const recoveryRate = totalDrops > 0 ? Number(((recoveredOrders / totalDrops) * 100).toFixed(1)) : 0;

    this.data.analytics = {
      totalOrders,
      recoveredOrders,
      recoveredRevenue,
      abandonedRevenue,
      recoveryRate
    };
    return this.data.analytics;
  }

  getAnalytics() {
    return this.data.analytics;
  }
}

export const db = new Database();
