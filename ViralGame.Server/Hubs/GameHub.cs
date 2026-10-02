using Microsoft.AspNetCore.SignalR;
namespace ViralGame.Server;

public sealed class GameHub(GameService game) : Hub
{
    public Task<object> CreateRoom() => game.Create(Context.ConnectionId);
    public Task<object> JoinRoom(string roomCode, string displayName) => game.Join(Context.ConnectionId, roomCode, displayName);
    public Task<object> Reconnect(string roomCode, string sessionToken) => game.Reconnect(Context.ConnectionId, roomCode, sessionToken);
    public Task<object?> GetSnapshot() => game.GetSnapshot(Context.ConnectionId);
    public Task<object?> StartGame() => game.Start(Context.ConnectionId);
    public Task<object?> SubmitInitialVote(string verdict) => game.Vote(Context.ConnectionId, verdict, false);
    public Task<object?> SubmitFinalVote(string verdict) => game.Vote(Context.ConnectionId, verdict, true);
    public Task<object?> ShareEvidence(string evidenceId) => game.Share(Context.ConnectionId, evidenceId);
    public Task<object?> VerifyEvidence(string evidenceId) => game.Verify(Context.ConnectionId, evidenceId);
    public Task<object?> BoostEvidence(string evidenceId) => game.Boost(Context.ConnectionId, evidenceId);
    public Task<object?> SendMessage(string content) => game.Message(Context.ConnectionId, content);
    public Task<object?> EndGame() => game.End(Context.ConnectionId);
    public Task<object?> LeaveRoom() => game.Leave(Context.ConnectionId);
    public override async Task OnDisconnectedAsync(Exception? exception) {
        await game.Disconnect(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
