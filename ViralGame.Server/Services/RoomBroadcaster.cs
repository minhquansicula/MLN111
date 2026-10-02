using Microsoft.AspNetCore.SignalR;
namespace ViralGame.Server;

public sealed class RoomBroadcaster(IHubContext<GameHub> hub, SnapshotService snapshots)
{
    // Called under the room gate so revisions and deliveries remain ordered.
    public async Task Publish(GameRoom room)
    {
        room.Revision++;
        room.UpdatedAt = DateTimeOffset.UtcNow;
        var sends = room.Players.Where(p => p.ConnectionId is not null)
            .Select(p => hub.Clients.Client(p.ConnectionId!).SendAsync("Snapshot", snapshots.Create(room, p.Id))).ToList();
        if (room.HostConnectionId is not null)
            sends.Add(hub.Clients.Client(room.HostConnectionId).SendAsync("Snapshot", snapshots.Create(room, null)));
        await Task.WhenAll(sends);
    }
    public Task Replaced(string connectionId) => hub.Clients.Client(connectionId).SendAsync("SessionReplaced");
}
