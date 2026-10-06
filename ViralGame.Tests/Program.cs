using ViralGame.Server;
using ViralGame.Server.TruthRush;
using System.Text.Json;

var checks = 0;
void Check(bool condition, string label) { if (!condition) throw new Exception("FAIL: " + label); checks++; Console.WriteLine("PASS " + label); }
GameRoom Room(params Verdict?[] votes) {
    var room = new GameRoom { Code = "TEST", HostToken = "host-secret", Phase = GamePhase.Reveal };
    for (var i = 0; i < votes.Length; i++) room.Players.Add(new Player { Name = "Player " + i, SessionToken = "secret-" + i, FinalVote = votes[i], EvidenceId = "E01" });
    return room;
}
var empty = VoteService.Calculate(Room(null, null, null));
Check(empty.Winner == "Draw" && empty.ClassVerdict == null && empty.Final.NoVote == 3, "No votes produces draw, not an arbitrary verdict");
var tie = VoteService.Calculate(Room(Verdict.True, Verdict.Misleading, null));
Check(tie.Winner == "Draw" && tie.ClassVerdict == null, "Equal leading counts produce draw");
var unrelated = VoteService.Calculate(Room(Verdict.False, Verdict.False, Verdict.Misleading));
Check(unrelated.Winner == "Draw" && unrelated.ClassVerdict == "False", "Neither side wins on an unrelated leading verdict");
var manipulation = VoteService.Calculate(Room(Verdict.True, Verdict.True, Verdict.False));
Check(manipulation.Winner == "Manipulator", "Manipulator target wins");
var truth = VoteService.Calculate(Room(Verdict.Misleading, Verdict.Misleading, null));
Check(truth.Winner == "Truth" && truth.FinalCorrectPercent == 66.7, "Truth result uses all-player denominator");
var plurality = VoteService.Calculate(Room(Verdict.Misleading, Verdict.Misleading, Verdict.True, Verdict.False, Verdict.NotEnoughEvidence));
Check(plurality.Winner == "Truth", "Unique plurality is intentional even below 50 percent");
Check(VoteService.Calculate(Room()).FinalCorrectPercent == 0, "Empty summaries avoid division by zero");
var changed = Room(Verdict.True, Verdict.Misleading, null);
changed.Players[0].InitialVote = Verdict.False;
changed.Players[2].InitialVote = Verdict.False;
Check(VoteService.Calculate(changed).ChangedOpinion == 1, "Changed opinion excludes missing initial or final votes");
var settings = new GameSettings();
Check(Enum.GetValues<GamePhase>().Sum(settings.Duration) == 900, "Default phase durations total exactly 15 minutes");
var projector = new SnapshotService(settings);
var privateRoom = Room(Verdict.Misleading, Verdict.True, null);
privateRoom.Players[0].Role = PlayerRole.FactChecker;
privateRoom.Players[0].VerifyTokens = 2;
privateRoom.Phase = GamePhase.RoleReveal;
var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
JsonElement Snapshot(string? playerId) => JsonSerializer.SerializeToElement(projector.Create(privateRoom, playerId), jsonOptions);
var host = Snapshot(null);
Check(host.GetProperty("player").ValueKind == JsonValueKind.Null, "Host receives no private player DTO");
Check(!host.ToString().Contains("host-secret") && !host.ToString().Contains("secret-0"), "Session tokens never appear in snapshots");
var own = Snapshot(privateRoom.Players[0].Id);
Check(own.GetProperty("player").GetProperty("role").GetString() == "FactChecker", "Player receives own role");
Check(own.GetProperty("player").GetProperty("privateEvidence").ValueKind == JsonValueKind.Null, "Evidence hidden before Investigation");
Check(own.GetProperty("room").GetProperty("scenario").ValueKind == JsonValueKind.Null, "Scenario hidden during RoleReveal");
Check(!own.GetProperty("room").GetProperty("players")[0].TryGetProperty("role", out _), "Public player projection omits role");
privateRoom.Phase = GamePhase.Investigation;
var card = Snapshot(privateRoom.Players[0].Id).GetProperty("player").GetProperty("privateEvidence");
Check(card.GetProperty("verificationResult").ValueKind == JsonValueKind.Null, "Verification explanation hidden before verify");
privateRoom.Players[0].VerifiedEvidence.Add("E01");
Check(Snapshot(privateRoom.Players[0].Id).GetProperty("player").GetProperty("privateEvidence").GetProperty("isVerified").GetBoolean(), "Private verification available to owner");
Check(!Snapshot(privateRoom.Players[1].Id).GetProperty("player").GetProperty("privateEvidence").GetProperty("isVerified").GetBoolean(), "Duplicate private card does not leak another player's verification");
Check(Snapshot(null).GetProperty("room").GetProperty("result").ValueKind == JsonValueKind.Null, "Result hidden during investigation");

SubmittedCase TruthCase(string id, string initial, string final, int confidence, string action, params string[] investigations)
    => new(id, initial, final, confidence, action, investigations);
var truthScoring = new TruthRushScoringService();
var perfectRun = truthScoring.Score("participant", "Lan", new SubmitRunRequest(
    "token",
    "run-1",
    600,
    [
        TruthCase("case_01", "TRUE", "FALSE", 100, "REPORT", "check_official", "check_source", "check_author"),
        TruthCase("case_02", "TRUE", "MISLEADING", 100, "ADD_CONTEXT", "check_statistics", "check_sample", "check_source"),
        TruthCase("case_03", "FALSE", "TRUE", 100, "ADD_CONTEXT", "view_full_context", "check_official"),
        TruthCase("case_04", "TRUE", "NOT_ENOUGH_EVIDENCE", 100, "WAIT_FOR_MORE_EVIDENCE", "check_source", "check_image", "check_date", "search_other_news"),
    ]));
Check(perfectRun.Score.Total == 400 && perfectRun.Score.Accuracy == 160, "Truth Rush scoring uses the 400 point scale");
var supportingOnlyCases = perfectRun.Cases.Select(item => item.CaseId == "case_03"
    ? TruthCase("case_03", "FALSE", "TRUE", 100, "ADD_CONTEXT", "check_date", "check_metadata", "check_comments")
    : new SubmittedCase(item.CaseId, item.InitialVerdict, item.FinalVerdict, item.Confidence, item.ResponsibleAction, item.UsedInvestigations)).ToArray();
var supportingOnlyResult = truthScoring.Score("participant", "Lan", new SubmitRunRequest("token", "supporting-only", 600, supportingOnlyCases));
var supportingOnlyCase = supportingOnlyResult.Cases.Single(item => item.CaseId == "case_03");
Check(supportingOnlyCase.Score.Investigation == 12 && supportingOnlyCase.Score.Responsibility == 20,
    "AI permission rewards conditions without overvaluing dates and metadata");
var plainShareCases = supportingOnlyCases.Select(item => item.CaseId == "case_03" ? item with { ResponsibleAction = "SHARE" } : item).ToArray();
var plainShareResult = truthScoring.Score("participant", "Lan", new SubmitRunRequest("token", "plain-share", 600, plainShareCases));
Check(plainShareResult.Cases.Single(item => item.CaseId == "case_03").Score.Responsibility == 10,
    "Sharing AI permission without its conditions earns less responsibility credit");
var budgetRejected = false;
try
{
    truthScoring.Score("participant", "Lan", new SubmitRunRequest(
        "token",
        "run-2",
        600,
        [
            TruthCase("case_01", "TRUE", "FALSE", 100, "REPORT", "read_original", "check_official", "check_source"),
            TruthCase("case_02", "TRUE", "MISLEADING", 50, "ADD_CONTEXT"),
            TruthCase("case_03", "FALSE", "TRUE", 50, "SHARE"),
            TruthCase("case_04", "TRUE", "NOT_ENOUGH_EVIDENCE", 50, "WAIT_FOR_MORE_EVIDENCE"),
        ]));
}
catch (TruthRushValidationException)
{
    budgetRejected = true;
}
Check(budgetRejected, "Truth Rush server rejects investigation points over budget");
var incompleteRejected = false;
try { truthScoring.Score("participant", "Lan", new SubmitRunRequest("token", "partial-run", 600, [])); }
catch (TruthRushValidationException) { incompleteRejected = true; }
Check(incompleteRejected, "Truth Rush server rejects an empty or incomplete classroom run");
var classService = new TruthRushClassService(
    new TruthRushStore(),
    new TruthRushSettings { MaximumSessions = 2, MaximumPlayersPerSession = 3, SessionLifetimeHours = 1 },
    truthScoring);
var classSession = classService.CreateSession("foundation");
var learner = classService.Join(classSession.Code, new JoinClassRequest("Minh"));
var observer = classService.Join(classSession.Code, new JoinClassRequest("Lan"));
var result = classService.Submit(classSession.Code, new SubmitRunRequest(
    learner.ParticipantToken,
    "class-run",
    600,
    perfectRun.Cases.Select(item => new SubmittedCase(item.CaseId, item.InitialVerdict, item.FinalVerdict, item.Confidence, item.ResponsibleAction, item.UsedInvestigations)).ToArray()));
Check(result.Score.Total == 400, "Classroom submission is rescored by the server");
Check(classService.Submit(classSession.Code, new SubmitRunRequest(
    learner.ParticipantToken,
    "class-run",
    600,
    perfectRun.Cases.Select(item => new SubmittedCase(item.CaseId, item.InitialVerdict, item.FinalVerdict, item.Confidence, item.ResponsibleAction, item.UsedInvestigations)).ToArray())).Score.Total == 400,
    "Repeated submission of the same run is idempotent");
var stats = classService.Stats(classSession.Code, learner.ParticipantToken);
Check(stats.PlayersJoined == 2 && stats.PlayersCompleted == 1 && stats.AverageScore == 400, "Completed players can read aggregate class statistics");
Check(classService.Leaderboard(classSession.Code, classSession.TeacherToken).Single().PlayerName == "Minh", "Teacher leaderboard ranks server-scored results");
var unfinishedBlocked = false;
try { classService.Stats(classSession.Code, observer.ParticipantToken); }
catch (UnauthorizedAccessException) { unfinishedBlocked = true; }
Check(unfinishedBlocked, "Unfinished players cannot inspect classroom answers");
var completeCases = perfectRun.Cases.Select(item => new SubmittedCase(item.CaseId, item.InitialVerdict, item.FinalVerdict, item.Confidence, item.ResponsibleAction, item.UsedInvestigations)).Concat([
    TruthCase("case_05", "TRUE", "MISLEADING", 100, "ADD_CONTEXT", "read_method", "check_statistics"),
    TruthCase("case_06", "TRUE", "FALSE", 100, "ADD_CONTEXT", "reverse_image", "compare_location"),
    TruthCase("case_07", "FALSE", "TRUE", 100, "SHARE", "read_policy", "check_ticket"),
    TruthCase("case_08", "TRUE", "NOT_ENOUGH_EVIDENCE", 100, "WAIT_FOR_MORE_EVIDENCE", "trace_recording", "check_detector"),
]).ToArray();
var completeSession = classService.CreateSession();
var completeLearner = classService.Join(completeSession.Code, new JoinClassRequest("Full run"));
var completeResult = classService.Submit(completeSession.Code, new SubmitRunRequest(completeLearner.ParticipantToken, "complete-run", 1200, completeCases));
Check(completeSession.PackId == "complete" && completeResult.Cases.Count == 8 && completeResult.Score.Total == 800, "Default classroom combines all eight cases on the 800 point scale");
Check(classService.Stats(completeSession.Code, completeSession.TeacherToken).Opinions.Count == 8, "Combined classroom statistics cover all eight cases");
Console.WriteLine($"All {checks} rule/privacy checks passed.");
