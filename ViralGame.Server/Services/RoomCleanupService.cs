namespace ViralGame.Server;

public sealed class RoomCleanupService(RoomStore store, ILogger<RoomCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        try {
            while (await timer.WaitForNextTickAsync(stoppingToken)) {
                foreach (var room in store.Rooms.Values) {
                    await room.Gate.WaitAsync(stoppingToken);
                    try {
                        var now = DateTimeOffset.UtcNow;
                        var expired = room.FinishedAt is not null && now - room.FinishedAt > TimeSpan.FromHours(1)
                            || room.Phase == GamePhase.Lobby && now - room.UpdatedAt > TimeSpan.FromHours(2);
                        if (!expired) continue;
                        room.Lifetime.Cancel(); room.Phase = GamePhase.Finished;
                        store.Rooms.TryRemove(room.Code, out _);
                        foreach (var entry in store.Connections.Where(x => x.Value.RoomCode == room.Code)) store.Connections.TryRemove(entry.Key, out _);
                        logger.LogInformation("Expired room {RoomCode}", room.Code);
                    }
                    finally { room.Gate.Release(); }
                }
            }
        } catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }
}
