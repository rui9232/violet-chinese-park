import { cpSync } from "fs";
import { spawnSync } from "child_process";
import { resolve } from "path";

const outDir = "獨屬於Violet";
const result = spawnSync(
  "npx",
  ["vite", "build", "--base", "./", "--outDir", outDir],
  { stdio: "inherit", shell: true }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

for (const file of ["啟動遊戲.bat", "啟動伺服器.ps1", "請先看我.txt"]) {
  cpSync(resolve("portable", file), resolve(outDir, file));
}

console.log(`\n已完成：請把「${outDir}」整個資料夾複製到朋友電腦，再雙擊「啟動遊戲.bat」。`);
