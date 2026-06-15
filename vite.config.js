import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// --host is set in package.json scripts so the dev server
// is reachable from your phone on the same Wi-Fi network.
export default defineConfig({
  plugins: [react()],
});
