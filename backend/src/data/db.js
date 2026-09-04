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
        totalOrders: 32,
        recoveredOrders: 18,
        recoveredRevenue: 4250,
        abandonedRevenue: 5820,
        recoveryRate: 56.2
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

  recalculateAnalytics() {
    const orders = this.data.orders;
    const totalOrders = orders.length;
    const recoveredOrders = orders.filter((o) => o.status === "recovered" || o.status === "paid_via_recovery").length;
    const recoveredRevenue = orders
      .filter((o) => o.status === "recovered" || o.status === "paid_via_recovery")
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    const abandonedRevenue = orders
      .filter((o) => o.status === "abandoned" || o.status === "failed")
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    const recoveryRate = totalOrders > 0 ? ((recoveredOrders / Math.max(1, recoveredOrders + orders.filter((o) => o.status === "abandoned" || o.status === "failed").length)) * 100).toFixed(1) : 0;

    this.data.analytics = {
      totalOrders: totalOrders || 32,
      recoveredOrders: recoveredOrders || 18,
      recoveredRevenue: recoveredRevenue || 4250,
      abandonedRevenue: abandonedRevenue || 5820,
      recoveryRate: Number(recoveryRate || 56.2)
    };
  }

  getAnalytics() {
    return this.data.analytics;
  }
}

export const db = new Database();
