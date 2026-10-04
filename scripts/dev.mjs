import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { root, client } from "./common.mjs";
const env = {
  ...process.env,
  ASPNETCORE_ENVIRONMENT: "Development",
};
const children = [
  spawn(
    "dotnet",
    [
      "run",
      "--project",
      "ViralGame.Server",
      "--no-restore",
      "--no-launch-profile",
      "--urls",
      "http://0.0.0.0:5001",
    ],
    { cwd: root, env, stdio: "inherit", windowsHide: true },
  ),
  spawn(process.execPath, [resolve(client, "node_modules/vite/bin/vite.js")], {
    cwd: client,
    stdio: "inherit",
    windowsHide: true,
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === "win32")
      spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    else child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 500);
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
console.log(
  "TRUTH RUSH: http://localhost:5173 — teacher dashboard at /teacher. Ctrl+C stops both servers.",
);
