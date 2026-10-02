using System.Collections.Concurrent;

namespace ViralGame.Server;

public enum GamePhase { Lobby, RoleReveal, BreakingNews, InitialVote, Investigation, Discussion, FinalVote, Reveal, Result, Finished }
public enum PlayerRole { User, FactChecker, Manipulator }
public enum Verdict { True, False, Misleading, NotEnoughEvidence }
public enum VoteType { Initial, Final }

public sealed class GameSettings
{
    public int MaximumPlayers { get; set; } = 35;
    public int MinimumPlayersToStart { get; set; } = 35;
    public double DurationScale { get; set; } = 1;
    public int MaximumRooms { get; set; } = 100;
    public int RoleRevealSeconds { get; set; } = 30;
    public int BreakingNewsSeconds { get; set; } = 45;
    public int InitialVoteSeconds { get; set; } = 30;
    public int InvestigationSeconds { get; set; } = 180;
    public int DiscussionSeconds { get; set; } = 360;
    public int FinalVoteSeconds { get; set; } = 30;
    public int RevealSeconds { get; set; } = 150;
    public int ResultSeconds { get; set; } = 75;
    public int Duration(GamePhase phase) => phase switch {
        GamePhase.RoleReveal => RoleRevealSeconds, GamePhase.BreakingNews => BreakingNewsSeconds,
        GamePhase.InitialVote => InitialVoteSeconds, GamePhase.Investigation => InvestigationSeconds,
        GamePhase.Discussion => DiscussionSeconds, GamePhase.FinalVote => FinalVoteSeconds,
        GamePhase.Reveal => RevealSeconds, GamePhase.Result => ResultSeconds, _ => 0
    };
}

public sealed class GameRoom
{
    public required string Code { get; init; }
    public required string HostToken { get; init; }
    public string? HostConnectionId { get; set; }
    public SemaphoreSlim Gate { get; } = new(1, 1);
    public GamePhase Phase { get; set; } = GamePhase.Lobby;
    public DateTimeOffset? PhaseEndsAt { get; set; }
    public DateTimeOffset CreatedAt { get; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? FinishedAt { get; set; }
    public List<Player> Players { get; } = [];
    public List<ChatMessage> Messages { get; } = [];
    public Dictionary<string, SharedEvidence> PublicEvidence { get; } = [];
    public long Revision { get; set; }
    public CancellationTokenSource Lifetime { get; } = new();
    public bool Aborted { get; set; }
    public GameResult? Result { get; set; }
    public Scenario Scenario { get; } = ScenarioData.Create();
}

public sealed class Player
{
    public string Id { get; } = Guid.NewGuid().ToString("N");
    public required string Name { get; init; }
    public required string SessionToken { get; init; }
    public string? ConnectionId { get; set; }
    public PlayerRole Role { get; set; }
    public int VerifyTokens { get; set; }
    public int BoostTokens { get; set; }
    public string? EvidenceId { get; set; }
    public HashSet<string> VerifiedEvidence { get; } = [];
    public Verdict? InitialVote { get; set; }
    public Verdict? FinalVote { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}

public sealed record Evidence(string Id, string Title, string Content, string Type, string Source, string VerificationResult, bool CanVerify = true);
public sealed record Scenario(string Id, string Title, string PostContent, string Author, int LikeCount, int CommentCount, int ShareCount, Verdict CorrectVerdict, Verdict ManipulatorTarget, string Explanation, Evidence[] Evidence);
public sealed class SharedEvidence
{
    public required string EvidenceId { get; init; }
    public List<string> SharedBy { get; } = [];
    public bool IsVerified { get; set; }
    public bool IsBoosted { get; set; }
}
public sealed record ChatMessage(string Id, string PlayerId, string PlayerName, string Content, DateTimeOffset SentAt);
public sealed record VoteSummary(Dictionary<string, int> Counts, Dictionary<string, double> Percentages, int NoVote, int Total, int Cast);
public sealed record RoleReveal(string PlayerId, string Name, string Role);
public sealed record GameResult(string CorrectVerdict, string Explanation, string Winner, string? ClassVerdict, VoteSummary Initial, VoteSummary Final, double InitialCorrectPercent, double FinalCorrectPercent, int ChangedOpinion, int TotalEvidenceShared, int VerifiedEvidenceShared, int BoostedEvidence, List<RoleReveal> Roles, string[] BoostedEvidenceIds);
public sealed record SessionBinding(string RoomCode, string? PlayerId);
public sealed class RoomStore
{
    public ConcurrentDictionary<string, GameRoom> Rooms { get; } = new();
    public ConcurrentDictionary<string, SessionBinding> Connections { get; } = new();
    public object CreationGate { get; } = new();
}
