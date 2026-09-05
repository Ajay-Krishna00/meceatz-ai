// API Base URL configuration
// In local development, defaults to '' (proxied by Vite to http://localhost:5000)
// In production on Vercel, defaults to https://meceatz-ai.onrender.com or VITE_API_URL
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
   window.location.hostname !== "localhost" &&
   window.location.hostname !== "127.0.0.1"
    ? "https://meceatz-ai.onrender.com"
    : "");
