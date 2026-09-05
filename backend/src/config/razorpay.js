import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TY6AGJsq3z1kEy";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "FcD1AxTgtU207fbE3l6BwY70";

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export const RAZORPAY_KEY_ID = key_id;
export const RAZORPAY_KEY_SECRET = key_secret;
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || key_secret;
