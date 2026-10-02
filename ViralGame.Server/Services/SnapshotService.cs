namespace ViralGame.Server;

// Explicit projection is the privacy boundary. Never serialize domain entities to a client.
public sealed class SnapshotService(GameSettings settings)
{
    public object Create(GameRoom room, string? playerId)
    {
        var player = room.Players.FirstOrDefault(p => p.Id == playerId);
        var started = room.Phase != GamePhase.Lobby;
        var evidenceVisible = room.Phase >= GamePhase.Investigation && !room.Aborted;
        var revealed = room.Phase >= GamePhase.Reveal && !room.Aborted;
        object? privateEvidence = null;
        if (evidenceVisible && player?.EvidenceId is not null)
        {
            var shared = room.PublicEvidence.GetValueOrDefault(player.EvidenceId);
            privateEvidence = Card(room, player.EvidenceId, player.VerifiedEvidence.Contains(player.EvidenceId) || shared?.IsVerified == true, shared);
        }
        return new {
            room = new {
                code = room.Code, revision = room.Revision, phase = room.Phase.ToString(),
                room.PhaseEndsAt, serverNow = DateTimeOffset.UtcNow,
                maximumPlayers = settings.MaximumPlayers, minimumPlayers = settings.MinimumPlayersToStart,
                hostConnected = room.HostConnectionId is not null,
                players = room.Players.Select(p => new { p.Id, p.Name, isConnected = p.ConnectionId is not null }).ToArray(),
                scenario = room.Phase >= GamePhase.BreakingNews && !room.Aborted ? new {
                    room.Scenario.Title, room.Scenario.PostContent, room.Scenario.Author,
                    room.Scenario.LikeCount, room.Scenario.CommentCount, room.Scenario.ShareCount,
                    isFictional = true
                } : null,
                publicEvidence = evidenceVisible ? room.PublicEvidence.Values.OrderByDescending(e => e.IsBoosted).Select(e => Card(room, e.EvidenceId, e.IsVerified, e)).ToArray() : [],
                messages = room.Messages.ToArray(),
                initialVoteResult = room.Phase >= GamePhase.Investigation && !room.Aborted ? VoteService.Summarize(room, false) : null,
                voteProgress = room.Phase == GamePhase.InitialVote ? room.Players.Count(p => p.InitialVote.HasValue) : room.Phase == GamePhase.FinalVote ? room.Players.Count(p => p.FinalVote.HasValue) : 0,
                result = revealed ? room.Result : null,
                room.Aborted
            },
            player = player is null ? null : new {
                player.Id, player.Name,
                role = started ? player.Role.ToString() : null,
                verifyTokens = started ? player.VerifyTokens : 0,
                boostTokens = started ? player.BoostTokens : 0,
                manipulatorTarget = started && player.Role == PlayerRole.Manipulator ? room.Scenario.ManipulatorTarget.ToString() : null,
                privateEvidence,
                initialVote = player.InitialVote?.ToString(), finalVote = player.FinalVote?.ToString()
            },
            isHost = playerId is null
        };
    }

    private static object Card(GameRoom room, string id, bool verified, SharedEvidence? shared)
    {
        var evidence = room.Scenario.Evidence.First(e => e.Id == id);
        return new {
            evidence.Id, evidence.Title, evidence.Content, evidence.Type, evidence.Source, evidence.CanVerify,
            isVerified = verified, verificationResult = verified ? evidence.VerificationResult : null,
            isBoosted = shared?.IsBoosted ?? false,
            sharedBy = shared?.SharedBy.Select(pid => room.Players.First(p => p.Id == pid).Name).ToArray() ?? [],
            isShared = shared is not null
        };
    }
}
