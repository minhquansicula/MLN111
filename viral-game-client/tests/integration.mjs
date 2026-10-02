import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
const here = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(here, "../../ViralGame.Server");
const server = spawn(
  "dotnet",
  [
    resolve(serverDir, "bin/Debug/net9.0/ViralGame.Server.dll"),
    "--urls",
    "http://127.0.0.1:5002",
  ],
  {
    cwd: serverDir,
    windowsHide: true,
    env: {
      ...process.env,
      ASPNETCORE_ENVIRONMENT: "Testing",
      ASPNETCORE_URLS: "http://127.0.0.1:5002",
      Game__MinimumPlayersToStart: "35",
      Game__RoleRevealSeconds: "3",
      Game__BreakingNewsSeconds: "2",
      Game__InitialVoteSeconds: "9",
      Game__InvestigationSeconds: "15",
      Game__DiscussionSeconds: "14",
      Game__FinalVoteSeconds: "9",
      Game__RevealSeconds: "2",
      Game__ResultSeconds: "2",
    },
  },
);
let logs = "";
server.stdout.on("data", (b) => (logs += b));
server.stderr.on("data", (b) => (logs += b));
const clients = [];
const timings = [];
let checks = 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(test, label, timeout = 15000) {
  const start = Date.now();
  while (!test()) {
    if (Date.now() - start > timeout) throw new Error("Timeout: " + label);
    await wait(20);
  }
}
async function client() {
  const c = { snapshot: null, history: [], replaced: false };
  c.hub = new HubConnectionBuilder()
    .withUrl("http://127.0.0.1:5002/gameHub", {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .configureLogging(LogLevel.None)
    .build();
  c.hub.on("Snapshot", (s) => {
    c.snapshot = s;
    c.history.push(s);
  });
  c.hub.on("SessionReplaced", () => (c.replaced = true));
  c.call = async (method, ...args) => {
    const start = performance.now();
    const result = await c.hub.invoke(method, ...args);
    timings.push(performance.now() - start);
    return result;
  };
  clients.push(c);
  await c.hub.start();
  return c;
}
function check(value, label) {
  assert.ok(value, label);
  checks++;
  console.log("PASS " + label);
}
async function reject(c, method, ...args) {
  await assert.rejects(() => c.call(method, ...args));
  checks++;
}
function phase(c, name, timeout = 20000) {
  return until(() => c.snapshot?.room.phase === name, name, timeout);
}
try {
  let healthy = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch("http://127.0.0.1:5002/health")).ok) {
        healthy = true;
        break;
      }
    } catch {}
    await wait(100);
  }
  assert.ok(healthy, "Test server started: " + logs);
  const host = await client();
  const room = await host.call("CreateRoom");
  const bad = await client();
  await reject(bad, "JoinRoom", "ZZZZ", "Ghost");
  await reject(bad, "StartGame");
  const players = [];
  for (let i = 0; i < 35; i++) {
    const c = await client();
    c.session = await c.call(
      "JoinRoom",
      room.roomCode,
      "Player " + String(i + 1).padStart(2, "0"),
    );
    players.push(c);
    if (i === 0) {
      await reject(bad, "JoinRoom", room.roomCode, "player 01");
      await reject(host, "StartGame");
    }
  }
  await until(
    () => host.snapshot.room.players.length === 35,
    "roster delivered",
  );
  check(
    host.snapshot.room.players.length === 35,
    "35 players plus separate host connected",
  );
  await reject(bad, "JoinRoom", room.roomCode, "Overflow");
  await reject(players[0], "StartGame");
  check(
    players.every((c) => c.snapshot.player.role === null),
    "Roles hidden in lobby",
  );
  await host.call("StartGame");
  await phase(host, "RoleReveal");
  await until(
    () => players.every((c) => c.snapshot.player.role),
    "roles delivered",
  );
  await reject(host, "StartGame");
  await reject(bad, "JoinRoom", room.roomCode, "Late");
  check(
    players.filter((c) => c.snapshot.player.role === "FactChecker").length ===
      5,
    "Exactly 5 fact checkers",
  );
  check(
    players.filter((c) => c.snapshot.player.role === "Manipulator").length ===
      5,
    "Exactly 5 manipulators",
  );
  check(
    players.filter((c) => c.snapshot.player.role === "User").length === 25,
    "Exactly 25 users",
  );
  check(
    players.every(
      (c) =>
        c.snapshot.player.privateEvidence === null &&
        c.snapshot.room.scenario === null,
    ),
    "Evidence and news not delivered early",
  );
  const fc = players.filter((c) => c.snapshot.player.role === "FactChecker");
  const manipulators = players.filter(
    (c) => c.snapshot.player.role === "Manipulator",
  );
  const users = players.filter((c) => c.snapshot.player.role === "User");
  await reject(users[0], "VerifyEvidence", "E01");
  await reject(users[0], "SubmitInitialVote", "True");
  await phase(host, "BreakingNews");
  check(
    host.snapshot.room.scenario.isFictional,
    "Shared scenario marked fictional",
  );
  await phase(host, "InitialVote");
  await Promise.all(
    players
      .slice(0, 34)
      .map((c, i) =>
        c.call("SubmitInitialVote", i < 24 ? "True" : "Misleading"),
      ),
  );
  await reject(players[0], "SubmitInitialVote", "False");
  await reject(players[34], "SubmitInitialVote", "0");
  await until(
    () => host.snapshot.room.voteProgress === 34,
    "initial progress delivered",
  );
  check(
    host.snapshot.room.voteProgress === 34 &&
      !host.snapshot.room.initialVoteResult,
    "Vote count public, distribution hidden until close",
  );
  await phase(host, "Investigation");
  await until(
    () => players.every((c) => c.snapshot.player.privateEvidence),
    "evidence delivered",
  );
  check(
    host.snapshot.room.initialVoteResult.noVote === 1,
    "Initial NO_VOTE counted",
  );
  check(
    new Set(players.map((c) => c.snapshot.player.privateEvidence.id)).size ===
      7,
    "All seven evidence cards distributed",
  );
  check(
    players.every((c) => !c.snapshot.player.privateEvidence.verificationResult),
    "Unverified metadata hidden",
  );
  await reject(users[0], "SendMessage", "Too early");
  const privateId = fc[0].snapshot.player.privateEvidence.id;
  await fc[0].call("VerifyEvidence", privateId);
  check(
    fc[0].snapshot.player.verifyTokens === 1 &&
      fc[0].snapshot.player.privateEvidence.isVerified,
    "Private verification consumes one token",
  );
  check(
    host.snapshot.room.publicEvidence.length === 0,
    "Private verification does not publish card",
  );
  const strangerId = players.find(
    (c) =>
      c.snapshot.player.privateEvidence.id !==
      fc[1].snapshot.player.privateEvidence.id,
  ).snapshot.player.privateEvidence.id;
  await reject(fc[1], "VerifyEvidence", strangerId);
  await Promise.all(
    players.map((c) =>
      c.call("ShareEvidence", c.snapshot.player.privateEvidence.id),
    ),
  );
  await until(
    () =>
      host.snapshot.room.publicEvidence.length === 7 &&
      host.snapshot.room.publicEvidence.every((e) => e.sharedBy.length === 5),
    "shared evidence delivered",
  );
  check(
    host.snapshot.room.publicEvidence.length === 7,
    "Duplicate cards merge into seven public cards",
  );
  check(
    host.snapshot.room.publicEvidence.find((e) => e.id === privateId)
      .isVerified,
    "Shared private verification becomes public",
  );
  await reject(users[0], "VerifyEvidence", privateId);
  await reject(manipulators[0], "BoostEvidence", privateId);
  const unverified = host.snapshot.room.publicEvidence.filter(
    (e) => !e.isVerified,
  );
  const before =
    fc[1].snapshot.player.verifyTokens + fc[2].snapshot.player.verifyTokens;
  const race = await Promise.allSettled([
    fc[1].call("VerifyEvidence", unverified[0].id),
    fc[2].call("VerifyEvidence", unverified[0].id),
  ]);
  check(
    race.filter((r) => r.status === "fulfilled").length === 1,
    "Concurrent verification succeeds once",
  );
  await until(
    () =>
      fc[1].snapshot.player.verifyTokens +
        fc[2].snapshot.player.verifyTokens ===
      before - 1,
    "verification race delivered",
  );
  check(
    fc[1].snapshot.player.verifyTokens + fc[2].snapshot.player.verifyTokens ===
      before - 1,
    "Concurrent verification consumes exactly one token",
  );
  await until(
    () =>
      host.snapshot.room.publicEvidence.filter((e) => e.isVerified).length ===
      2,
    "public verification delivered",
  );
  const remaining = host.snapshot.room.publicEvidence.find(
    (e) => !e.isVerified,
  );
  await fc[0].call("VerifyEvidence", remaining.id);
  await reject(
    fc[0],
    "VerifyEvidence",
    host.snapshot.room.publicEvidence.find((e) => !e.isVerified).id,
  );
  check(
    fc[0].snapshot.player.verifyTokens === 0,
    "Verification budget cannot be exceeded",
  );
  const old = users[0];
  const newClient = await client();
  newClient.session = old.session;
  await newClient.call("Reconnect", room.roomCode, old.session.sessionToken);
  await until(() => old.replaced, "session replacement delivered");
  check(old.replaced, "New connection replaces old session");
  await reject(old, "ShareEvidence", old.snapshot.player.privateEvidence.id);
  check(
    newClient.snapshot.player.id === old.snapshot.player.id &&
      newClient.snapshot.player.initialVote === old.snapshot.player.initialVote,
    "Reconnect restores identity and locked vote",
  );
  players[players.indexOf(old)] = newClient;
  users[0] = newClient;
  await old.hub.stop();
  check(
    newClient.snapshot.room.players.find(
      (p) => p.id === newClient.snapshot.player.id,
    ).isConnected,
    "Stale disconnect does not mark replacement offline",
  );
  await phase(host, "Discussion");
  const id = host.snapshot.room.publicEvidence[0].id;
  const original = host.snapshot.room.publicEvidence[0].content;
  await reject(users[0], "BoostEvidence", id);
  const boosts = await Promise.allSettled([
    manipulators[0].call("BoostEvidence", id),
    manipulators[1].call("BoostEvidence", id),
  ]);
  check(
    boosts.filter((r) => r.status === "fulfilled").length === 1,
    "Concurrent boost succeeds once",
  );
  await until(
    () =>
      host.snapshot.room.publicEvidence.some((e) => e.id === id && e.isBoosted),
    "boost delivered",
  );
  const boosted = host.snapshot.room.publicEvidence.find((e) => e.id === id);
  check(
    boosted.isBoosted &&
      boosted.content === original &&
      !("boostedBy" in boosted),
    "Boost changes prominence, never content or actor disclosure",
  );
  while (manipulators[0].snapshot.player.boostTokens > 0) {
    const card = manipulators[0].snapshot.room.publicEvidence.find(
      (e) => !e.isBoosted,
    );
    await manipulators[0].call("BoostEvidence", card.id);
  }
  await reject(
    manipulators[0],
    "BoostEvidence",
    manipulators[0].snapshot.room.publicEvidence.find((e) => !e.isBoosted).id,
  );
  check(
    manipulators[0].snapshot.player.boostTokens === 0,
    "Boost budget cannot be exceeded",
  );
  await reject(users[0], "SendMessage", "");
  await reject(users[0], "SendMessage", "x".repeat(201));
  const chatStart = performance.now();
  await Promise.all(
    players.map((c, i) => c.call("SendMessage", "Evidence matters " + i)),
  );
  await until(
    () => players.every((c) => c.snapshot.room.messages.length === 35),
    "chat delivered",
  );
  const delivery = performance.now() - chatStart;
  check(
    players.every((c) => c.snapshot.room.messages.length === 35),
    "All 35 players receive public chat",
  );
  await reject(players[0], "SendMessage", "Cooldown");
  for (const c of [host, ...players])
    for (const s of c.history.filter(
      (s) => !["Reveal", "Result", "Finished"].includes(s.room.phase),
    )) {
      assert.equal(s.room.result, null);
      assert.ok(
        s.room.players.every((p) => !("role" in p) && !("sessionToken" in p)),
      );
      const publicText = JSON.stringify(s.room);
      assert.ok(!publicText.includes("correctVerdict"));
      assert.ok(!publicText.includes("manipulatorTarget"));
    }
  check(
    true,
    "All pre-reveal public snapshots preserve secret roles, tokens and answer",
  );
  await phase(host, "FinalVote");
  await reject(players[0], "SendMessage", "Closed");
  await reject(fc[1], "VerifyEvidence", id);
  await Promise.all(
    players
      .slice(0, 34)
      .map((c, i) =>
        c.call(
          "SubmitFinalVote",
          i < 24
            ? "Misleading"
            : i < 32
              ? "True"
              : i === 32
                ? "False"
                : "NotEnoughEvidence",
        ),
      ),
  );
  await reject(players[0], "SubmitFinalVote", "True");
  await phase(host, "Reveal");
  const result = host.snapshot.room.result;
  check(
    result.correctVerdict === "Misleading" && result.winner === "Truth",
    "Correct answer and winner computed",
  );
  check(
    result.final.noVote === 1 && result.changedOpinion === 34,
    "Missing votes and changed opinions counted correctly",
  );
  check(
    result.initialCorrectPercent === 28.6 &&
      result.finalCorrectPercent === 68.6,
    "Before/after percentages use whole class denominator",
  );
  check(
    result.roles.length === 35 &&
      result.totalEvidenceShared === 7 &&
      result.verifiedEvidenceShared === 3,
    "Role reveal and evidence statistics complete",
  );
  check(
    result.boostedEvidence >= 1 &&
      result.boostedEvidenceIds.length === result.boostedEvidence,
    "Manipulation reveal includes boosted card IDs",
  );
  await phase(host, "Finished");
  check(!host.snapshot.room.aborted, "Full match finishes automatically");
  // Reconnect restores the final report too.
  const finalClient = await client();
  await finalClient.call(
    "Reconnect",
    room.roomCode,
    players[0].session.sessionToken,
  );
  check(
    finalClient.snapshot.room.result.winner === "Truth",
    "Reconnect after completion restores results",
  );
  const host2 = await client();
  const room2 = await host2.call("CreateRoom");
  const participant = await client();
  await participant.call("JoinRoom", room2.roomCode, "Emergency test");
  await reject(participant, "EndGame");
  await host2.call("EndGame");
  await phase(participant, "Finished");
  check(
    participant.snapshot.room.phase === "Finished" &&
      participant.snapshot.room.aborted,
    "Only host can emergency-end room",
  );
  timings.sort((a, b) => a - b);
  console.log(
    JSON.stringify(
      {
        checks,
        players: 35,
        actionP95Ms: Math.round(timings[Math.floor(timings.length * 0.95)]),
        burstChatDeliveryMs: Math.round(delivery),
        result: "PASS",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  console.error(logs.slice(-4000));
  process.exitCode = 1;
} finally {
  await Promise.allSettled(clients.map((c) => c.hub.stop()));
  server.kill();
}
