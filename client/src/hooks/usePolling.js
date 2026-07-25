import { useEffect, useRef } from "react";

// Har `intervalMs` baad `callback` ko dobara chalata hai - Socket.io ki jagah
// "real-time jaisa" (near real-time) update dene ke liye. Kisi bhi hosting platform
// par bina extra config ke chalta hai (koi WebSocket/CORS masla nahi).
export const usePolling = (callback, intervalMs = 6000) => {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
};
