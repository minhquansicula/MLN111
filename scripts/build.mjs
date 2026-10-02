import { mkdir, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { root, client, npm, run } from "./common.mjs";
await npm(["run", "build"]);
const webroot = resolve(root, "ViralGame.Server/wwwroot");
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
  "Production bundle ready in .artifacts/publish. Run npm start (35 players required).",
);
