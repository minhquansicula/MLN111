import { VERDICTS, ACTIONS, DEFAULT_PACK_ID, getCase, getPack } from "./cases.js";

export const STORAGE_KEY = "truth-rush-run-v1";
export const SCHEMA_VERSION = 2;
export const CONTENT_VERSION = "2026-10-04";

const correctConfidence = { 50: 0, 60: 2, 70: 4, 80: 6, 90: 8, 100: 10 };
const wrongConfidence = { 50: -3, 60: -5, 70: -7, 80: -10, 90: -15, 100: -20 };

function runId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  // Non-secret identifier; also works on an HTTP LAN URL without randomUUID.
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createRun(player, packId = DEFAULT_PACK_ID) {
  const pack = getPack(packId);
  if (!pack) throw new Error("Bộ hồ sơ không hợp lệ.");
  const caseIds = [...pack.caseIds];
  // Shuffle each stage before its timed crisis, retaining the easier stage first.
  let stageStart = 0;
  for (let end = 0; end < caseIds.length; end++) {
    if (!getCase(caseIds[end]).timerSeconds && end !== caseIds.length - 1) continue;
    const last = getCase(caseIds[end]).timerSeconds ? end - 1 : end;
    for (let index = last; index > stageStart; index--) {
      const other = stageStart + Math.floor(Math.random() * (index - stageStart + 1));
      [caseIds[index], caseIds[other]] = [caseIds[other], caseIds[index]];
    }
    stageStart = end + 1;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    packId,
    runId: runId(),
    player,
    status: "TUTORIAL",
    caseIndex: 0,
    startedAt: new Date().toISOString(),
    submitted: false,
    submitError: null,
    cases: caseIds.map((id) => {
      const item = getCase(id);
      return ({
      caseId: item.id,
      step: "INITIAL",
      initialVerdict: null,
      remainingPoints: item.points,
      usedInvestigations: [],
      finalVerdict: null,
      confidence: null,
      responsibleAction: null,
      investigationDeadline: null,
      score: null,
      });
    }),
  };
}

export function purchaseInvestigation(caseData, progress, checkId, now = Date.now()) {
  const check = caseData.checks.find((item) => item.id === checkId);
  if (!check || progress.step !== "INVESTIGATION" || progress.usedInvestigations.includes(checkId)
    || progress.remainingPoints < check.cost
    || (progress.investigationDeadline !== null && now >= progress.investigationDeadline)) return false;
  progress.usedInvestigations.push(checkId);
  progress.remainingPoints -= check.cost;
  return true;
}

export function scoreCase(caseData, progress) {
  const correct = progress.finalVerdict === caseData.correctVerdict;
  const accuracy = correct ? 40 : 0;
  const investigation = Math.min(25, progress.usedInvestigations.reduce((sum, id) => sum + (caseData.checks.find((item) => item.id === id)?.score ?? 0), 0));
  const responsibility = progress.responsibleAction === caseData.bestAction ? 20 : caseData.reasonableActions.includes(progress.responsibleAction) ? 10 : 0;
  const confidence = correct ? correctConfidence[progress.confidence] : wrongConfidence[progress.confidence];
  const adaptability = progress.initialVerdict !== caseData.correctVerdict && correct ? 5 : 0;
  return { accuracy, investigation, responsibility, confidence, adaptability, total: Math.max(0, Math.min(100, accuracy + investigation + responsibility + confidence + adaptability)) };
}

export function totalScore(run) {
  return run.cases.reduce((sum, item) => sum + (item.score?.total ?? 0), 0);
}

export function scoreTotals(run) {
  return run.cases.reduce((totals, item) => {
    for (const key of ["accuracy", "investigation", "responsibility", "confidence", "adaptability", "total"]) totals[key] += item.score?.[key] ?? 0;
    return totals;
  }, { accuracy: 0, investigation: 0, responsibility: 0, confidence: 0, adaptability: 0, total: 0 });
}

export function validateRun(value) {
  if (!value || ![1, SCHEMA_VERSION].includes(value.schemaVersion)) return null;
  const legacy = value.schemaVersion === 1;
  const pack = getPack(legacy ? "foundation" : value.packId);
  if (!pack || (!legacy && value.contentVersion !== CONTENT_VERSION)
    || typeof value.runId !== "string" || !value.runId.trim() || value.runId.length > 80
    || !["TUTORIAL", "PLAYING", "RESULT"].includes(value.status)
    || !Number.isInteger(value.caseIndex) || value.caseIndex < 0 || value.caseIndex >= pack.caseIds.length
    || !Array.isArray(value.cases) || value.cases.length !== pack.caseIds.length
    || new Set(value.cases.map((item) => item?.caseId)).size !== pack.caseIds.length
    || value.cases.some((item) => !pack.caseIds.includes(item?.caseId))
    || !value.player || typeof value.player.name !== "string" || !value.player.name.trim()
    || value.player.name.length > 24 || !Number.isFinite(Date.parse(value.startedAt))) return null;
  if (value.player.classCode && (typeof value.player.classCode !== "string"
    || !/^[A-Z2-9]{6}$/.test(value.player.classCode)
    || typeof value.player.participantToken !== "string" || !/^[A-Fa-f0-9]{64}$/.test(value.player.participantToken))) return null;
  const steps = ["INITIAL", "INVESTIGATION", "FINAL", "CONFIDENCE", "ACTION", "REVEAL"];
  for (const [index, item] of value.cases.entries()) {
    const caseData = getCase(item.caseId);
    const step = steps.indexOf(item.step);
    if (step < 0 || !Array.isArray(item.usedInvestigations)
      || new Set(item.usedInvestigations).size !== item.usedInvestigations.length
      || item.usedInvestigations.some((id) => !caseData.checks.some((check) => check.id === id))) return null;
    const spent = item.usedInvestigations.reduce((sum, id) => sum + caseData.checks.find((check) => check.id === id).cost, 0);
    if (spent > caseData.points || item.remainingPoints !== caseData.points - spent
      || (step >= 1 && !VERDICTS.some((v) => v.id === item.initialVerdict))
      || (step >= 3 && !VERDICTS.some((v) => v.id === item.finalVerdict))
      || (step >= 4 && ![50, 60, 70, 80, 90, 100].includes(item.confidence))
      || (step >= 5 && !ACTIONS.some((action) => action.id === item.responsibleAction))
      || (step === 0 && (spent !== 0 || item.initialVerdict !== null))
      || (index < value.caseIndex && item.step !== "REVEAL")
      || (index > value.caseIndex && item.step !== "INITIAL")
      || (value.status === "RESULT" && item.step !== "REVEAL")
      || (value.status === "TUTORIAL" && (value.caseIndex !== 0 || item.step !== "INITIAL"))) return null;
    if (caseData.timerSeconds && step >= 1 && !Number.isFinite(item.investigationDeadline)) return null;
  }
  if (value.status === "RESULT" && value.caseIndex !== pack.caseIds.length - 1) return null;
  const restored = structuredClone(value);
  restored.schemaVersion = SCHEMA_VERSION;
  restored.contentVersion = CONTENT_VERSION;
  restored.packId = pack.id;
  restored.cases.forEach((item) => { item.score = item.step === "REVEAL" ? scoreCase(getCase(item.caseId), item) : null; });
  return restored;
}

export function loadRun() {
  try { return validateRun(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return null; }
}

export function saveRun(run) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(run)); return true; }
  catch { return false; }
}

export function clearRun() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* game can still run in memory */ }
}

export function submissionPayload(run, completedOnly = false) {
  return {
    participantToken: run.player.participantToken,
    runId: run.runId,
    durationSeconds: Math.max(1, Math.min(7200, Math.round((Date.now() - Date.parse(run.startedAt)) / 1000))),
    cases: run.cases.filter((item) => !completedOnly || item.step === "REVEAL").map((item) => ({ caseId: item.caseId, initialVerdict: item.initialVerdict, finalVerdict: item.finalVerdict, confidence: item.confidence, responsibleAction: item.responsibleAction, usedInvestigations: item.usedInvestigations })),
  };
}
