namespace ViralGame.Server;

public sealed class GameStateMachine(RoomBroadcaster broadcaster, GameSettings settings, ILogger<GameStateMachine> logger)
{
    public void Start(GameRoom room) => _ = Run(room);

    private async Task Run(GameRoom room)
    {
        try
        {
            while (true)
            {
                var delay = room.PhaseEndsAt!.Value - DateTimeOffset.UtcNow;
                if (delay > TimeSpan.Zero) await Task.Delay(delay, room.Lifetime.Token);
                await room.Gate.WaitAsync(room.Lifetime.Token);
                try
                {
                    if (room.Phase == GamePhase.Finished) return;
                    var next = (GamePhase)((int)room.Phase + 1);
                    if (next == GamePhase.Reveal) room.Result = VoteService.Calculate(room);
                    SetPhase(room, next);
                    await broadcaster.Publish(room);
                    if (next == GamePhase.Finished) return;
                }
                finally { room.Gate.Release(); }
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            logger.LogError(ex, "Match loop failed for {RoomCode}", room.Code);
            await room.Gate.WaitAsync();
            try {
                room.Aborted = true;
                SetPhase(room, GamePhase.Finished);
                await broadcaster.Publish(room);
            }
            finally { room.Gate.Release(); }
        }
    }

    public void SetPhase(GameRoom room, GamePhase phase)
    {
        room.Phase = phase;
        room.PhaseEndsAt = phase == GamePhase.Finished ? null : DateTimeOffset.UtcNow.AddSeconds(settings.Duration(phase) * settings.DurationScale);
        if (phase == GamePhase.Finished) room.FinishedAt = DateTimeOffset.UtcNow;
    }
}
