import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
import { startAbandonmentWatcher } from "./services/abandonmentWatcher.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const allowed = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://meceatz-ai.vercel.app",
        process.env.FRONTEND_URL
      ].filter(Boolean);

      if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for hackathon demo evaluation
    },
    credentials: true
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    app: "MEC-Eatz AI Agent Server",
    status: "online",
    razorpay: "connected",
    endpoints: [
      "/api/health",
      "/api/config",
      "/api/menu",
      "/api/orders/create",
      "/api/recovery/abandon",
      "/api/recovery/logs",
      "/api/copilot/chat",
      "/api/analytics"
    ]
  });
});

app.listen(PORT, () => {
  console.log("⚡ MEC-Eatz AI Backend running on http://localhost:" + PORT);
  console.log("🤖 Razorpay AI Builder: Autonomous Revenue Recovery & Merchant Copilot");
  startAbandonmentWatcher();
});
