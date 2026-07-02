import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGithubPages = process.env.IS_GH_PAGES === "true";

export default defineConfig({
  base: isGithubPages ? "/kanban-flow/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
  },
});
