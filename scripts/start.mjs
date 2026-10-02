import { resolve } from "node:path";
import { root, run } from "./common.mjs";
await run("dotnet", ["ViralGame.Server.dll", "--urls", "http://0.0.0.0:5001"], {
  cwd: resolve(root, ".artifacts/publish"),
  env: { ...process.env, ASPNETCORE_ENVIRONMENT: "Production" },
});
