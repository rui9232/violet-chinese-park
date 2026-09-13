import { copyFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function spaFallback() {
  return {
    name: "spa-fallback",
    closeBundle() {
      const index = resolve("dist/index.html");
      if (!existsSync(index)) return;
      copyFileSync(index, resolve("dist/404.html"));
      writeFileSync(resolve("dist/.nojekyll"), "");
    },
  };
}

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/violet-chinese-park/" : "/",
  plugins: [vue(), spaFallback()],
  server: {
    host: true,
    port: 5173,
  },
});
