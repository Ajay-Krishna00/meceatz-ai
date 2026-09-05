import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn("⚠️ Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing from environment variables.");
}

export const razorpay = new Razorpay({
  key_id: key_id || "",
  key_secret: key_secret || "",
});

export const RAZORPAY_KEY_ID = key_id || "";
export const RAZORPAY_KEY_SECRET = key_secret || "";
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || key_secret || "";
