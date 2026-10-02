import { run, npm } from "./common.mjs";
await run("dotnet", ["run", "--project", "ViralGame.Tests"]);
await npm(["test"]);
await npm(["run", "test:integration"]);
