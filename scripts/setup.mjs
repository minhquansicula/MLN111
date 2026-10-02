import { run, npm } from "./common.mjs";
await npm(["ci"]);
await run("dotnet", ["restore", "ViralGame.Server"]);
await run("dotnet", ["restore", "ViralGame.Tests"]);
console.log("Ready. Run npm run dev from the project root.");
