import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this app from /client-onboarding-portal/
export default defineConfig({
  base: "/client-onboarding-portal/",
  plugins: [react()],
});
