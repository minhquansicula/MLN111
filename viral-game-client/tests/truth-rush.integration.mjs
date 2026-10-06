import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { VERDICTS, ACTIONS, getCase } from "../src/truth-rush/cases.js";
import { scoreCase } from "../src/truth-rush/gameEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(here, "../../ViralGame.Server");
const baseUrl = "http://127.0.0.1:5003";

async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function caseResult(caseId, initialVerdict, finalVerdict, confidence, responsibleAction, usedInvestigations) {
  return { caseId, initialVerdict, finalVerdict, confidence, responsibleAction, usedInvestigations };
}

const perfectCases = [
  caseResult("case_01", "TRUE", "FALSE", 100, "REPORT", ["check_official", "check_source", "check_author"]),
  caseResult("case_02", "TRUE", "MISLEADING", 100, "ADD_CONTEXT", ["check_statistics", "check_sample", "check_source"]),
  caseResult("case_03", "FALSE", "TRUE", 100, "ADD_CONTEXT", ["view_full_context", "check_official"]),
  caseResult("case_04", "TRUE", "NOT_ENOUGH_EVIDENCE", 100, "WAIT_FOR_MORE_EVIDENCE", ["check_source", "check_image", "check_date", "search_other_news"]),
];

test("classroom HTTP API completes a secure scoring round trip", { timeout: 20_000 }, async () => {
  let logs = "";
  const server = spawn("dotnet", [
    resolve(serverDir, "bin/Debug/net9.0/ViralGame.Server.dll"),
    "--urls",
    baseUrl,
  ], {
    cwd: serverDir,
    windowsHide: true,
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: "Testing" },
  });
  server.stdout.on("data", (value) => { logs += value; });
  server.stderr.on("data", (value) => { logs += value; });

  try {
    let healthy = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try {
        healthy = (await fetch(baseUrl + "/health")).ok;
        if (healthy) break;
      } catch {}
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
    assert.ok(healthy, "API did not start. " + logs.slice(-1000));

    const created = await request("/api/class-sessions", { method: "POST", body: JSON.stringify({ packId: "foundation" }) });
    assert.equal(created.response.status, 201);
    assert.match(created.data.code, /^[A-Z2-9]{6}$/);

    const joined = await request(`/api/class-sessions/${created.data.code}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName: "Minh" }),
    });
    assert.equal(joined.response.status, 200);

    const unfinished = await request(`/api/class-sessions/${created.data.code}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName: "Lan" }),
    });
    assert.equal(unfinished.response.status, 200);

    const earlyStats = await request(`/api/class-sessions/${created.data.code}/stats`, {
      headers: { "X-Session-Token": unfinished.data.participantToken },
    });
    assert.equal(earlyStats.response.status, 401);
    for (const endpoint of ["stats", "leaderboard"]) {
      for (const token of [undefined, "wrong-token", unfinished.data.participantToken]) {
        const denied = await request(`/api/class-sessions/${created.data.code}/${endpoint}`, {
          headers: token ? { "X-Session-Token": token } : {},
        });
        assert.equal(denied.response.status, 401);
      }
    }
    const missingClass = await request("/api/class-sessions/ZZZZZZ/join", { method: "POST", body: JSON.stringify({ playerName: "Missing" }) });
    assert.equal(missingClass.response.status, 404);
    for (const playerName of [null, "", "   ", "a".repeat(25), "Bad\nName"]) {
      const invalidName = await request(`/api/class-sessions/${created.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName }) });
      assert.equal(invalidName.response.status, 400);
    }

    const submitted = await request(`/api/class-sessions/${created.data.code}/results`, {
      method: "POST",
      body: JSON.stringify({
        participantToken: joined.data.participantToken,
        runId: "integration-run",
        durationSeconds: 600,
        cases: perfectCases,
      }),
    });
    assert.equal(submitted.response.status, 200);
    assert.equal(submitted.data.score.total, 400);

    const stats = await request(`/api/class-sessions/${created.data.code}/stats`, {
      headers: { "X-Session-Token": created.data.teacherToken },
    });
    assert.equal(stats.response.status, 200);
    assert.equal(stats.data.playersCompleted, 1);
    assert.equal(stats.data.averageScore, 400);
    assert.equal(stats.data.opinions.length, 4);

    const leaders = await request(`/api/class-sessions/${created.data.code}/leaderboard`, {
      headers: { "X-Session-Token": created.data.teacherToken },
    });
    assert.equal(leaders.response.status, 200);
    assert.equal(leaders.data[0].playerName, "Minh");

    const overBudget = structuredClone(perfectCases);
    overBudget[0].usedInvestigations = ["read_original", "check_official", "check_source"];
    const rejected = await request(`/api/class-sessions/${created.data.code}/results`, {
      method: "POST",
      body: JSON.stringify({
        participantToken: unfinished.data.participantToken,
        runId: "invalid-budget",
        durationSeconds: 600,
        cases: overBudget,
      }),
    });
    assert.equal(rejected.response.status, 400);

    const invalidChanges = [
      { confidence: 55 }, { initialVerdict: "UNKNOWN" }, { finalVerdict: "UNKNOWN" },
      { responsibleAction: "UNKNOWN" }, { usedInvestigations: ["made_up"] },
      { usedInvestigations: ["check_source", "check_source"] }, { usedInvestigations: [null] },
      { caseId: "case_unknown" },
    ];
    for (const change of invalidChanges) {
      const invalidCases = perfectCases.map((item, index) => index === 0 ? { ...item, ...change } : item);
      const invalidResult = await request(`/api/class-sessions/${created.data.code}/results`, {
        method: "POST", body: JSON.stringify({ participantToken: unfinished.data.participantToken, runId: "invalid-fields", durationSeconds: 600, cases: invalidCases }),
      });
      assert.equal(invalidResult.response.status, 400);
    }
    for (const change of [{ runId: null }, { runId: "" }, { runId: "a".repeat(81) }, { durationSeconds: 0 }, { durationSeconds: 7201 }]) {
      const invalidRun = await request(`/api/class-sessions/${created.data.code}/results`, {
        method: "POST", body: JSON.stringify({ participantToken: unfinished.data.participantToken, runId: "invalid-run", durationSeconds: 600, cases: perfectCases, ...change }),
      });
      assert.equal(invalidRun.response.status, 400);
    }

    const invalidPack = await request("/api/class-sessions", { method: "POST", body: JSON.stringify({ packId: "unknown" }) });
    assert.equal(invalidPack.response.status, 400);
    const advanced = await request("/api/class-sessions", { method: "POST", body: JSON.stringify({ packId: "advanced" }) });
    assert.equal(advanced.response.status, 201);
    assert.equal(advanced.data.packId, "advanced");
    const advancedPlayer = await request(`/api/class-sessions/${advanced.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "Advanced Tester" }) });
    assert.equal(advancedPlayer.data.packId, "advanced");
    const advancedCases = [
      caseResult("case_05", "TRUE", "MISLEADING", 100, "ADD_CONTEXT", ["read_method", "check_statistics", "check_sample"]),
      caseResult("case_06", "TRUE", "FALSE", 80, "ADD_CONTEXT", ["reverse_image", "compare_location"]),
      caseResult("case_07", "FALSE", "TRUE", 90, "SHARE", ["read_policy", "check_ticket"]),
      caseResult("case_08", "TRUE", "NOT_ENOUGH_EVIDENCE", 70, "WAIT_FOR_MORE_EVIDENCE", ["trace_recording", "check_detector", "check_official"]),
    ];
    const advancedPayload = { participantToken: advancedPlayer.data.participantToken, runId: "advanced-run", durationSeconds: 600, cases: [...advancedCases].reverse() };
    const wrongPack = await request(`/api/class-sessions/${advanced.data.code}/results`, { method: "POST", body: JSON.stringify({ ...advancedPayload, cases: perfectCases }) });
    assert.equal(wrongPack.response.status, 400);
    for (const cases of [null, [null, null, null, null], advancedCases.map((item, index) => index === 0 ? { ...item, usedInvestigations: null } : item)]) {
      const malformed = await request(`/api/class-sessions/${advanced.data.code}/results`, { method: "POST", body: JSON.stringify({ ...advancedPayload, cases }) });
      assert.equal(malformed.response.status, 400);
    }
    const advancedResult = await request(`/api/class-sessions/${advanced.data.code}/results`, { method: "POST", body: JSON.stringify(advancedPayload) });
    assert.equal(advancedResult.response.status, 200);
    assert.equal(advancedResult.data.score.total, advancedCases.reduce((sum, item) => sum + scoreCase(getCase(item.caseId), item).total, 0));
    const advancedStats = await request(`/api/class-sessions/${advanced.data.code}/stats`, { headers: { "X-Session-Token": advanced.data.teacherToken } });
    assert.deepEqual(advancedStats.data.opinions.map((item) => item.caseId), ["case_05", "case_06", "case_07", "case_08"]);
    assert.ok(advancedStats.data.mostUsedInvestigations.every((item) => item.name.includes(":")));
    // Each rubric, not only its total, must agree across JavaScript and C#.
    for (const item of advancedResult.data.cases) {
      const submittedCase = advancedCases.find((value) => value.caseId === item.caseId);
      assert.deepEqual(item.score, scoreCase(getCase(item.caseId), submittedCase));
    }
    const complete = await request("/api/class-sessions", { method: "POST" });
    assert.equal(complete.response.status, 201);
    assert.equal(complete.data.packId, "complete");
    const completePlayer = await request(`/api/class-sessions/${complete.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "Eight-case player" }) });
    assert.equal(completePlayer.data.packId, "complete");
    const allCases = [...perfectCases, ...advancedCases].map((item) => ({ ...item, confidence: 100 }));
    const completePayload = { participantToken: completePlayer.data.participantToken, runId: "complete-run", durationSeconds: 1200, cases: [...allCases].reverse() };
    for (const cases of [[], allCases.slice(0, 4), allCases.slice(0, 7), [...allCases.slice(0, 7), allCases[0]]]) {
      const incomplete = await request(`/api/class-sessions/${complete.data.code}/results`, { method: "POST", body: JSON.stringify({ ...completePayload, cases }) });
      assert.equal(incomplete.response.status, 400);
    }
    const fullResult = await request(`/api/class-sessions/${complete.data.code}/results`, { method: "POST", body: JSON.stringify(completePayload) });
    assert.equal(fullResult.response.status, 200);
    assert.equal(fullResult.data.cases.length, 8);
    assert.equal(fullResult.data.score.total, 800);
    const unauthorizedSubmission = await request(`/api/class-sessions/${complete.data.code}/results`, {
      method: "POST", body: JSON.stringify({ ...completePayload, participantToken: "wrong-token" }),
    });
    assert.equal(unauthorizedSubmission.response.status, 401);
    const concurrentRetries = await Promise.all(Array.from({ length: 10 }, () => request(`/api/class-sessions/${complete.data.code}/results`, {
      method: "POST", body: JSON.stringify(completePayload),
    })));
    for (const retried of concurrentRetries) {
      assert.equal(retried.response.status, 200);
      assert.deepEqual(retried.data, fullResult.data);
    }
    const secondRun = await request(`/api/class-sessions/${complete.data.code}/results`, {
      method: "POST", body: JSON.stringify({ ...completePayload, runId: "second-completed-run" }),
    });
    assert.equal(secondRun.response.status, 400);
    for (const item of fullResult.data.cases) assert.deepEqual(item.score, scoreCase(getCase(item.caseId), allCases.find((value) => value.caseId === item.caseId)));
    const fullStats = await request(`/api/class-sessions/${complete.data.code}/stats`, { headers: { "X-Session-Token": complete.data.teacherToken } });
    assert.equal(fullStats.data.averageScore, 800);
    assert.equal(fullStats.data.opinions.length, 8);
    const fullBoard = await request(`/api/class-sessions/${complete.data.code}/leaderboard`, { headers: { "X-Session-Token": completePlayer.data.participantToken } });
    assert.equal(fullBoard.data[0].totalScore, 800);
    const rankingPlayer = await request(`/api/class-sessions/${complete.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "Ranking Tester" }) });
    const lowScoreCases = allCases.map((item) => ({ ...item, finalVerdict: "TRUE", confidence: 100, responsibleAction: "SHARE", usedInvestigations: [] }));
    const rankingResult = await request(`/api/class-sessions/${complete.data.code}/results`, { method: "POST", body: JSON.stringify({ participantToken: rankingPlayer.data.participantToken, runId: "ranking-run", durationSeconds: 1300, cases: lowScoreCases }) });
    assert.equal(rankingResult.response.status, 200);
    const rankedBoard = await request(`/api/class-sessions/${complete.data.code}/leaderboard`, { headers: { "X-Session-Token": complete.data.teacherToken } });
    assert.deepEqual(rankedBoard.data.map((entry) => [entry.rank, entry.playerName]), [[1, "Eight-case player"], [2, "Ranking Tester"]]);

    const contentClass = await request("/api/class-sessions", { method: "POST", body: JSON.stringify({ packId: "foundation" }) });
    assert.equal(contentClass.response.status, 201);
    for (const responsibleAction of ["ADD_CONTEXT", "SHARE"]) {
      const contentPlayer = await request(`/api/class-sessions/${contentClass.data.code}/join`, {
        method: "POST", body: JSON.stringify({ playerName: `Content ${responsibleAction}` }),
      });
      assert.equal(contentPlayer.response.status, 200);
      const contentCases = perfectCases.map((item) => item.caseId === "case_03"
        ? { ...item, responsibleAction, usedInvestigations: ["check_date", "check_metadata", "check_comments"] }
        : item);
      const contentResult = await request(`/api/class-sessions/${contentClass.data.code}/results`, {
        method: "POST", body: JSON.stringify({ participantToken: contentPlayer.data.participantToken, runId: `content-${responsibleAction}`, durationSeconds: 600, cases: contentCases }),
      });
      assert.equal(contentResult.response.status, 200);
      for (const item of contentResult.data.cases) {
        assert.deepEqual(item.score, scoreCase(getCase(item.caseId), contentCases.find((value) => value.caseId === item.caseId)));
      }
      const aiCase = contentResult.data.cases.find((item) => item.caseId === "case_03");
      assert.equal(aiCase.score.investigation, 12);
      assert.equal(aiCase.score.responsibility, responsibleAction === "ADD_CONTEXT" ? 20 : 10);
    }

    // Exercise all leaderboard tie-breakers with a full 35-player classroom.
    const largeClass = await request("/api/class-sessions", { method: "POST" });
    assert.equal(largeClass.response.status, 201);
    const largePlayers = await Promise.all(Array.from({ length: 35 }, async (_, index) => {
      const playerName = `Player ${String(index + 1).padStart(2, "0")}`;
      const joinedPlayer = await request(`/api/class-sessions/${largeClass.data.code}/join`, {
        method: "POST",
        body: JSON.stringify({ playerName }),
      });
      assert.equal(joinedPlayer.response.status, 200);
      return { ...joinedPlayer.data, playerName, index };
    }));
    assert.equal(new Set(largePlayers.map((player) => player.participantToken)).size, 35);

    const duplicateLargePlayer = await request(`/api/class-sessions/${largeClass.data.code}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName: "player 01" }),
    });
    assert.equal(duplicateLargePlayer.response.status, 400);

    const largeResults = await Promise.all(largePlayers.map(async (player) => {
      const profile = player.index % 5;
      let cases = allCases.map((item) => ({ ...item, usedInvestigations: [...item.usedInvestigations] }));
      if (profile === 1) cases = cases.map((item) => ({ ...item, responsibleAction: "SHARE" }));
      if (profile === 2) cases = cases.map((item) => ({ ...item, usedInvestigations: [] }));
      if (profile === 3) cases = cases.map((item) => ({ ...item, confidence: 50 }));
      if (profile === 4) cases = cases.map((item) => ({ ...item, finalVerdict: "TRUE", confidence: 100, responsibleAction: "SHARE", usedInvestigations: [] }));
      const durationSeconds = 600 + player.index;
      const submittedLargePlayer = await request(`/api/class-sessions/${largeClass.data.code}/results`, {
        method: "POST",
        body: JSON.stringify({ participantToken: player.participantToken, runId: `large-run-${player.index + 1}`, durationSeconds, cases }),
      });
      assert.equal(submittedLargePlayer.response.status, 200);
      return { ...submittedLargePlayer.data, durationSeconds };
    }));

    const largeStats = await request(`/api/class-sessions/${largeClass.data.code}/stats`, {
      headers: { "X-Session-Token": largeClass.data.teacherToken },
    });
    assert.equal(largeStats.response.status, 200);
    assert.equal(largeStats.data.playersJoined, 35);
    assert.equal(largeStats.data.playersCompleted, 35);
    assert.equal(largeStats.data.opinions.length, 8);
    for (const opinion of largeStats.data.opinions) {
      assert.equal(opinion.initial.reduce((sum, item) => sum + item.count, 0), 35);
      assert.equal(opinion.final.reduce((sum, item) => sum + item.count, 0), 35);
    }
    const expectedAverage = Math.round((largeResults.reduce((sum, result) => sum + result.score.total, 0) / 35) * 10) / 10;
    assert.equal(largeStats.data.averageScore, expectedAverage);

    const largeBoard = await request(`/api/class-sessions/${largeClass.data.code}/leaderboard`, {
      headers: { "X-Session-Token": largeClass.data.teacherToken },
    });
    assert.equal(largeBoard.response.status, 200);
    assert.equal(largeBoard.data.length, 35);
    assert.deepEqual(largeBoard.data.map((entry) => entry.rank), Array.from({ length: 35 }, (_, index) => index + 1));
    const expectedLargeOrder = [...largeResults].sort((left, right) =>
      right.score.accuracy - left.score.accuracy
      || right.score.investigation - left.score.investigation
      || right.score.responsibility - left.score.responsibility
      || right.score.confidence - left.score.confidence
      || left.durationSeconds - right.durationSeconds
    ).map((result) => result.playerName);
    assert.deepEqual(largeBoard.data.map((entry) => entry.playerName), expectedLargeOrder);

    // Only completed players affect statistics, even when the class reaches capacity.
    const extraPlayers = await Promise.all(Array.from({ length: 65 }, (_, index) => request(`/api/class-sessions/${largeClass.data.code}/join`, {
      method: "POST", body: JSON.stringify({ playerName: `Unfinished ${index + 1}` }),
    })));
    for (const extraPlayer of extraPlayers) assert.equal(extraPlayer.response.status, 200);
    const overflow = await request(`/api/class-sessions/${largeClass.data.code}/join`, {
      method: "POST", body: JSON.stringify({ playerName: "Overflow 101" }),
    });
    assert.equal(overflow.response.status, 400);
    const capacityStats = await request(`/api/class-sessions/${largeClass.data.code}/stats`, { headers: { "X-Session-Token": largeClass.data.teacherToken } });
    assert.equal(capacityStats.data.playersJoined, 100);
    assert.equal(capacityStats.data.playersCompleted, 35);
    assert.equal(capacityStats.data.averageScore, expectedAverage);
    const capacityBoard = await request(`/api/class-sessions/${largeClass.data.code}/leaderboard`, { headers: { "X-Session-Token": largeClass.data.teacherToken } });
    assert.deepEqual(capacityBoard.data, largeBoard.data);

    // Entirely equal scores and duration still produce one row per participant.
    const tieClass = await request("/api/class-sessions", { method: "POST" });
    assert.equal(tieClass.response.status, 201);
    const tiePlayers = await Promise.all(["Tie A", "Tie B", "Tie C"].map(async (playerName) => {
      const tiePlayer = await request(`/api/class-sessions/${tieClass.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName }) });
      assert.equal(tiePlayer.response.status, 200);
      const tieResult = await request(`/api/class-sessions/${tieClass.data.code}/results`, {
        method: "POST", body: JSON.stringify({ participantToken: tiePlayer.data.participantToken, runId: playerName, durationSeconds: 600, cases: allCases }),
      });
      assert.equal(tieResult.response.status, 200);
      return tiePlayer.data;
    }));
    const tieBoard = await request(`/api/class-sessions/${tieClass.data.code}/leaderboard`, { headers: { "X-Session-Token": tieClass.data.teacherToken } });
    assert.deepEqual(tieBoard.data.map((entry) => entry.rank), [1, 2, 3]);
    assert.deepEqual(tieBoard.data.map((entry) => entry.playerName).sort(), ["Tie A", "Tie B", "Tie C"]);
    for (let attempt = 0; attempt < 5; attempt++) {
      const repeatedTieBoard = await request(`/api/class-sessions/${tieClass.data.code}/leaderboard`, { headers: { "X-Session-Token": tiePlayers[0].participantToken } });
      assert.deepEqual(repeatedTieBoard.data, tieBoard.data);
    }
    const racedPlayer = await request(`/api/class-sessions/${tieClass.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "Racing Player" }) });
    assert.equal(racedPlayer.response.status, 200);
    const competingRuns = await Promise.all(["race-one", "race-two"].map((runId) => request(`/api/class-sessions/${tieClass.data.code}/results`, {
      method: "POST", body: JSON.stringify({ participantToken: racedPlayer.data.participantToken, runId, durationSeconds: 700, cases: allCases }),
    })));
    assert.deepEqual(competingRuns.map((item) => item.response.status).sort(), [200, 400]);
    const raceStats = await request(`/api/class-sessions/${tieClass.data.code}/stats`, { headers: { "X-Session-Token": tieClass.data.teacherToken } });
    assert.equal(raceStats.data.playersCompleted, 4);

    const unicodePlayer = await request(`/api/class-sessions/${tieClass.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "  Nguyễn  " }) });
    assert.equal(unicodePlayer.response.status, 200);
    assert.equal(unicodePlayer.data.playerName, "Nguyễn");
    const unicodeDuplicate = await request(`/api/class-sessions/${tieClass.data.code}/join`, { method: "POST", body: JSON.stringify({ playerName: "Nguyễn".normalize("NFD") }) });
    assert.equal(unicodeDuplicate.response.status, 400);

    // Check every verdict/confidence/action combination on every case against C#.
    const matrixClass = await request("/api/class-sessions", { method: "POST" });
    assert.equal(matrixClass.response.status, 201);
    const decisionMatrix = VERDICTS.flatMap((verdict) => [50, 60, 70, 80, 90, 100].flatMap((confidence) =>
      ACTIONS.map((action) => ({ finalVerdict: verdict.id, confidence, responsibleAction: action.id }))));
    await Promise.all(decisionMatrix.map(async (decision, index) => {
      const player = await request(`/api/class-sessions/${matrixClass.data.code}/join`, {
        method: "POST", body: JSON.stringify({ playerName: `Matrix ${index}` }),
      });
      assert.equal(player.response.status, 200);
      const cases = allCases.map((item) => ({ ...item, ...decision,
        initialVerdict: index % 2 ? getCase(item.caseId).correctVerdict : "MISLEADING",
        usedInvestigations: index % 3 === 0 ? [] : item.usedInvestigations,
      }));
      const scored = await request(`/api/class-sessions/${matrixClass.data.code}/results`, {
        method: "POST", body: JSON.stringify({ participantToken: player.data.participantToken, runId: `matrix-${index}`, durationSeconds: 600, cases }),
      });
      assert.equal(scored.response.status, 200);
      for (const item of scored.data.cases) {
        assert.deepEqual(item.score, scoreCase(getCase(item.caseId), cases.find((value) => value.caseId === item.caseId)));
        assert.ok(item.score.total >= 0 && item.score.total <= 100);
      }
    }));
    const matrixStats = await request(`/api/class-sessions/${matrixClass.data.code}/stats`, { headers: { "X-Session-Token": matrixClass.data.teacherToken } });
    assert.equal(matrixStats.data.playersCompleted, 96);
  } finally {
    server.kill();
  }
});
