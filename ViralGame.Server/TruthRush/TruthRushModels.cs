using System.Collections.Concurrent;

namespace ViralGame.Server.TruthRush;

public sealed class TruthRushSettings
{
    public int MaximumSessions { get; set; } = 100;
    public int MaximumPlayersPerSession { get; set; } = 100;
    public int SessionLifetimeHours { get; set; } = 8;
}

public sealed class ClassSession
{
    public required string Code { get; init; }
    public required string TeacherToken { get; init; }
    public string PackId { get; init; } = "complete";
    public DateTimeOffset CreatedAt { get; } = DateTimeOffset.UtcNow;
    public ConcurrentDictionary<string, ClassParticipant> Participants { get; } = new();
    public ConcurrentDictionary<string, ScoredRun> Results { get; } = new();
    public ConcurrentDictionary<string, ScoredRun> Progress { get; } = new();
    public object Gate { get; } = new();
}

public sealed record ClassParticipant(string Id, string Name, string Token, DateTimeOffset JoinedAt);
public sealed record CreateClassRequest(string PackId = "complete");
public sealed record CreateClassResponse(string Code, string TeacherToken, string PackId);
public sealed record JoinClassRequest(string PlayerName);
public sealed record JoinClassResponse(string Code, string ParticipantToken, string PlayerName, string PackId);
public sealed record SubmitRunRequest(string ParticipantToken, string RunId, int DurationSeconds, IReadOnlyList<SubmittedCase> Cases);
public sealed record SubmittedCase(string CaseId, string InitialVerdict, string FinalVerdict, int Confidence, string ResponsibleAction, IReadOnlyList<string> UsedInvestigations);
public sealed record ScoreBreakdown(int Accuracy, int Investigation, int Responsibility, int Confidence, int Adaptability, int Total);
public sealed record ScoredCase(string CaseId, string InitialVerdict, string FinalVerdict, int Confidence, string ResponsibleAction, IReadOnlyList<string> UsedInvestigations, ScoreBreakdown Score);
public sealed record ScoredRun(string RunId, string ParticipantId, string PlayerName, int DurationSeconds, DateTimeOffset SubmittedAt, IReadOnlyList<ScoredCase> Cases, ScoreBreakdown Score);
public sealed record LeaderboardEntry(int Rank, string PlayerName, int TotalScore, int Accuracy, int Investigation, int Responsibility, int Confidence, int DurationSeconds, int CasesCompleted, int TotalCases, bool IsCompleted);
public sealed record VerdictDistribution(string Verdict, int Count, double Percent);
public sealed record CaseOpinionStats(string CaseId, IReadOnlyList<VerdictDistribution> Initial, IReadOnlyList<VerdictDistribution> Final);
public sealed record NamedCount(string Name, int Count);
public sealed record ClassStatsResponse(string Code, int PlayersJoined, int PlayersCompleted, double AverageScore, double AverageAccuracy, double AverageInvestigation, double AverageResponsibility, IReadOnlyList<CaseOpinionStats> Opinions, IReadOnlyList<NamedCount> MostUsedInvestigations, IReadOnlyList<NamedCount> MostMissedStrongEvidence, IReadOnlyList<NamedCount> ResponsibleActions);

public sealed class TruthRushStore
{
    public ConcurrentDictionary<string, ClassSession> Sessions { get; } = new();
    public object CreationGate { get; } = new();
}
