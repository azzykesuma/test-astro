// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server",
   adapter: node({
    mode: 'standalone'
  }),

  integrations: [react()],
   server: {
    host: '0.0.0.0',
    port: 3000
  }
});