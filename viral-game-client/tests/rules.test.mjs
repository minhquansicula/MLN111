import test from "node:test";
import assert from "node:assert/strict";
import {
  secondsRemaining,
  formatTime,
  verdictLabel,
  phaseAllowsEvidence,
} from "../src/game.js";
test("countdown uses server deadline and clamps expired phases", () => {
  const t = Date.parse("2026-10-02T00:00:00Z");
  assert.equal(secondsRemaining("2026-10-02T00:00:30Z", t), 30);
  assert.equal(secondsRemaining("2026-10-02T00:00:30Z", t + 30500), 0);
  assert.equal(secondsRemaining(null, t), 0);
});
test("timer formatting and Vietnamese verdict labels", () => {
  assert.equal(formatTime(65), "01:05");
  assert.equal(verdictLabel("Misleading"), "Gây hiểu lầm");
  assert.equal(verdictLabel(null), "Không bỏ phiếu");
});
test("evidence actions are disabled after discussion", () => {
  assert.equal(phaseAllowsEvidence("Investigation"), true);
  assert.equal(phaseAllowsEvidence("Discussion"), true);
  assert.equal(phaseAllowsEvidence("FinalVote"), false);
});
