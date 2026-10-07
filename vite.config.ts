import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset paths, so the built folder works at a domain root or in any sub-folder
  base: "./",
  plugins: [tailwindcss(), react()],
});
