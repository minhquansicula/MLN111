import test from "node:test";
import assert from "node:assert/strict";
import { CASES, CASE_BANK, CASE_PACKS, getCase } from "../src/truth-rush/cases.js";
import { createRun, purchaseInvestigation, validateRun, scoreCase, scoreTotals, totalScore, submissionPayload } from "../src/truth-rush/gameEngine.js";

test("live payload includes only confirmed cases, including zero scores, after resume", () => {
  const run = createRun({ name: "Live", classCode: "ABCDEF", participantToken: "A".repeat(64) });
  run.status = "PLAYING";
  run.caseIndex = 1;
  const item = run.cases[0];
  Object.assign(item, { step: "REVEAL", initialVerdict: "TRUE", finalVerdict: getCase(item.caseId).correctVerdict === "TRUE" ? "FALSE" : "TRUE", confidence: 100, responsibleAction: "SHARE" });
  // Valid timed deadlines are retained if the shuffled case requires one.
  item.investigationDeadline = Date.now() + 90_000;
  const restored = validateRun(JSON.parse(JSON.stringify(run)));
  assert.ok(restored);
  assert.equal(restored.cases[0].score.total, 0);
  const payload = submissionPayload(restored, true);
  assert.equal(payload.runId, run.runId);
  assert.equal(payload.cases.length, 1);
  assert.equal(payload.cases[0].caseId, item.caseId);
  assert.ok(!("score" in payload.cases[0]), "Server must compute points itself");
  assert.equal(submissionPayload(restored).cases.length, 8);
  assert.equal(submissionPayload(createRun({ name: "Solo" }), true).cases.length, 0);
});

function progress(caseData, overrides = {}) {
  return {
    initialVerdict: "TRUE",
    finalVerdict: caseData.correctVerdict,
    confidence: 100,
    responsibleAction: caseData.bestAction,
    usedInvestigations: [],
    ...overrides,
  };
}

test("a strong, corrected decision can earn 100 points", () => {
  const item = CASES[0];
  const score = scoreCase(item, progress(item, {
    usedInvestigations: ["check_official", "check_source", "check_author"],
  }));
  assert.deepEqual(score, {
    accuracy: 40,
    investigation: 25,
    responsibility: 20,
    confidence: 10,
    adaptability: 5,
    total: 100,
  });
});

test("high confidence in a wrong verdict is penalized and score never goes below zero", () => {
  const item = CASES[3];
  const score = scoreCase(item, progress(item, {
    initialVerdict: "TRUE",
    finalVerdict: "FALSE",
    confidence: 100,
    responsibleAction: "SHARE",
  }));
  assert.equal(score.confidence, -20);
  assert.equal(score.total, 0);
});

test("AI permission rewards sharing conditions and requires direct evidence for full investigation credit", () => {
  const item = getCase("case_03");
  const withConditions = scoreCase(item, progress(item, {
    initialVerdict: "FALSE",
    responsibleAction: "ADD_CONTEXT",
    usedInvestigations: ["view_full_context", "check_official"],
  }));
  assert.equal(withConditions.total, 100);
  assert.equal(withConditions.responsibility, 20);
  const plainShare = scoreCase(item, progress(item, { responsibleAction: "SHARE" }));
  assert.equal(plainShare.responsibility, 10);
  const supportingChecks = item.checks.filter((check) => !check.strong);
  for (let mask = 0; mask < 2 ** supportingChecks.length; mask++) {
    const selected = supportingChecks.filter((_, index) => mask & (1 << index));
    if (selected.reduce((sum, check) => sum + check.cost, 0) > item.points) continue;
    const supportingScore = scoreCase(item, progress(item, { usedInvestigations: selected.map((check) => check.id) }));
    assert.ok(supportingScore.investigation < 25, "Dates, metadata and comments cannot replace direct confirmation");
  }
});

test("legacy four-case runs retain the 400 point scale", () => {
  const investigations = [
    ["check_official", "check_source", "check_author"],
    ["check_statistics", "check_sample", "check_source"],
    ["view_full_context", "check_official"],
    ["check_source", "check_image", "check_date", "search_other_news"],
  ];
  const run = {
    cases: CASES.map((item, index) => ({
      ...progress(item, {
        initialVerdict: item.correctVerdict === "TRUE" ? "FALSE" : "TRUE",
        usedInvestigations: investigations[index],
      }),
      score: scoreCase(item, progress(item, {
        initialVerdict: item.correctVerdict === "TRUE" ? "FALSE" : "TRUE",
        usedInvestigations: investigations[index],
      })),
    })),
  };
  assert.equal(totalScore(run), 400);
  assert.equal(scoreTotals(run).accuracy, 160);
  assert.equal(scoreTotals(run).total, 400);
});

test("one combined pack has eight distinct cases and a strong investigation path within budget", () => {
  assert.equal(CASE_BANK.length, 8);
  assert.equal(CASE_PACKS.length, 1);
  for (const pack of CASE_PACKS) {
    assert.equal(pack.caseIds.length, 8);
    assert.equal(new Set(pack.caseIds).size, 8);
    for (const id of pack.caseIds) {
      const item = getCase(id);
      assert.ok(item.post.media && item.post.mediaAlt && item.post.caption);
      assert.ok(item.checks.length >= 5);
      let canEarnFullInvestigation = false;
      for (let mask = 0; mask < 2 ** item.checks.length; mask++) {
        const selected = item.checks.filter((_, index) => mask & (1 << index));
        if (selected.reduce((sum, check) => sum + check.cost, 0) <= item.points
          && selected.reduce((sum, check) => sum + check.score, 0) >= 25) canEarnFullInvestigation = true;
      }
      assert.ok(canEarnFullInvestigation, id);
    }
  }
});

test("default run combines both stages and persists its order with crises at four and eight", () => {
  const run = createRun({ name: "Test" });
  assert.equal(run.packId, "complete");
  assert.equal(run.cases.length, 8);
  assert.equal(run.cases[3].caseId, "case_04");
  assert.equal(run.cases[7].caseId, "case_08");
  const restored = validateRun(JSON.parse(JSON.stringify(run)));
  assert.deepEqual(restored.cases.map((item) => item.caseId), run.cases.map((item) => item.caseId));
});

test("buying checks is atomic, does not overspend, and rejects expired timers", () => {
  const item = getCase("case_06");
  const current = { step: "INVESTIGATION", remainingPoints: 3, usedInvestigations: [], investigationDeadline: null };
  assert.equal(purchaseInvestigation(item, current, "reverse_image"), true);
  assert.equal(purchaseInvestigation(item, current, "reverse_image"), false);
  assert.equal(current.remainingPoints, 1);
  assert.equal(purchaseInvestigation(item, current, "compare_location"), true);
  assert.equal(purchaseInvestigation(item, current, "check_weather"), false);
  assert.equal(current.remainingPoints, 0);
  current.remainingPoints = 1;
  current.investigationDeadline = 1000;
  assert.equal(purchaseInvestigation(item, current, "check_weather", 1000), false);
});

test("corrupt saves fail safely and original version-one progress remains resumable", () => {
  const run = createRun({ name: "Test" }, "foundation");
  const old = { ...run, schemaVersion: 1 };
  delete old.packId;
  delete old.contentVersion;
  assert.equal(validateRun(old).packId, "foundation");
  for (const change of [
    (value) => { value.caseIndex = 20; },
    (value) => { value.cases[0] = null; },
    (value) => { value.cases[0].remainingPoints = -1; },
    (value) => { value.cases[0].usedInvestigations = ["made_up"]; },
    (value) => { value.status = "RESULT"; },
    (value) => { value.player = null; },
  ]) {
    const invalid = structuredClone(run);
    change(invalid);
    assert.equal(validateRun(invalid), null);
  }
});

test("resume preserves expired crisis deadlines and recomputes completed scores", () => {
  const run = createRun({ name: "Test" });
  run.status = "PLAYING";
  run.caseIndex = 7;
  run.cases.forEach((item, index) => {
    const data = getCase(item.caseId);
    if (index < 7) Object.assign(item, { step: "REVEAL", initialVerdict: "FALSE", finalVerdict: data.correctVerdict, confidence: 80, responsibleAction: data.bestAction, investigationDeadline: data.timerSeconds ? 1000 : null, score: { total: 9999 } });
    else Object.assign(item, { step: "INVESTIGATION", initialVerdict: "TRUE", investigationDeadline: 1000 });
  });
  const restored = validateRun(run);
  assert.equal(restored.cases[7].investigationDeadline, 1000);
  assert.ok(restored.cases[0].score.total <= 100);
});

test("combined run continues after four cases and completes at eight on an 800 point scale", () => {
  const run = createRun({ name: "Test" });
  run.status = "PLAYING";
  run.caseIndex = 4;
  function complete(item) {
    const data = getCase(item.caseId);
    const checks = Array.from({ length: 2 ** data.checks.length }, (_, mask) => data.checks.filter((_, index) => mask & (1 << index)))
      .find((selected) => selected.reduce((sum, check) => sum + check.cost, 0) <= data.points && selected.reduce((sum, check) => sum + check.score, 0) >= 25);
    Object.assign(item, progress(data, { initialVerdict: data.correctVerdict === "TRUE" ? "FALSE" : "TRUE", usedInvestigations: checks.map((check) => check.id) }), {
      step: "REVEAL", remainingPoints: data.points - checks.reduce((sum, check) => sum + check.cost, 0), investigationDeadline: data.timerSeconds ? 1000 : null,
    });
    item.score = scoreCase(data, item);
  }
  run.cases.slice(0, 4).forEach(complete);
  assert.ok(validateRun(run));
  assert.equal(validateRun({ ...run, status: "RESULT" }), null);
  run.cases.slice(4).forEach(complete);
  run.status = "RESULT";
  run.caseIndex = 7;
  const restored = validateRun(run);
  assert.equal(totalScore(restored), 800);
  assert.equal(scoreTotals(restored).accuracy, 320);
  assert.equal(scoreTotals(restored).investigation, 200);
  assert.equal(validateRun({ ...run, cases: run.cases.slice(0, 4), caseIndex: 3 }), null);
});
