import { mkdir, cp, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { root, client, npm, run } from "./common.mjs";
await npm(["run", "build"]);
const webroot = resolve(root, "ViralGame.Server/wwwroot");
const serverRoot = resolve(root, "ViralGame.Server") + sep;
if (!webroot.startsWith(serverRoot))
  throw new Error("Refusing to clean a webroot outside ViralGame.Server.");
await rm(webroot, { recursive: true, force: true });
await mkdir(webroot, { recursive: true });
await cp(resolve(client, "dist"), webroot, { recursive: true });
await run("dotnet", [
  "publish",
  "ViralGame.Server",
  "-c",
  "Release",
  "-o",
  resolve(root, ".artifacts/publish"),
]);
console.log(
  "TRUTH RUSH production bundle ready in .artifacts/publish. Run npm start.",
);
