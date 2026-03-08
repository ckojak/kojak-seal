import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import "./index.css";

// Debug: verify which Supabase project the app is connecting to
console.log('[BOOT] VITE_SUPABASE_URL =', import.meta.env.VITE_SUPABASE_URL);
console.log('[BOOT] VITE_SUPABASE_PUBLISHABLE_KEY ref =', 
  (() => {
    try {
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!key) return 'NOT SET';
      const payload = JSON.parse(atob(key.split('.')[1]));
      return payload.ref;
    } catch { return 'PARSE ERROR'; }
  })()
);

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
