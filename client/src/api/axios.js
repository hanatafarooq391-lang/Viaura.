import axios from "axios";

// Vercel single-project deployment: frontend + backend (serverless /api) are same origin,
// so relative "/api" works both locally (via Vite proxy) and in production. VITE_API_URL
// is only needed if you ever split frontend/backend onto different domains.
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("viaura_admin");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
