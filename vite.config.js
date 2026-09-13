import { copyFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function spaFallback() {
  let outDir = "dist";
  return {
    name: "spa-fallback",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const index = resolve(outDir, "index.html");
      if (!existsSync(index)) return;
      copyFileSync(index, resolve(outDir, "404.html"));
      writeFileSync(resolve(outDir, ".nojekyll"), "");
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
