import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // LAN par expose karta hai - taake phone/tablet isi WiFi se access kar saken
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
