import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const client = resolve(root, "viral-game-client");
export const npmCli =
  process.env.npm_execpath ||
  resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
export function run(command, args, options = {}) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
      ...options,
    });
    child.on("error", fail);
    child.on("exit", (code) =>
      code === 0
        ? ok()
        : fail(new Error(command + " exited with code " + code)),
    );
  });
}
export const npm = (args) =>
  run(process.execPath, [npmCli, ...args], { cwd: client });
