import { cloudflare } from "@cloudflare/vite-plugin";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact(), tailwindcss(), cloudflare()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    },
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"]
  }
});
