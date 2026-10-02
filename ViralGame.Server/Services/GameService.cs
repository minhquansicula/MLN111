using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.SignalR;

namespace ViralGame.Server;

public sealed class GameService(RoomStore store, GameSettings settings, RoomBroadcaster broadcaster, SnapshotService snapshots, GameStateMachine machine)
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static string Token() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    private static HubException Error(string message) => new(message);
    private static string NormalizeCode(string code) => (code ?? "").Trim().ToUpperInvariant();
    private void EnsureUnbound(string connection) {
        if (store.Connections.ContainsKey(connection)) throw Error("Bạn đã tham gia một phòng. Hãy rời phòng trước.");
    }
    private GameRoom Find(string code) => store.Rooms.TryGetValue(NormalizeCode(code), out var room) ? room : throw Error("Phòng không tồn tại hoặc đã hết hạn.");

    public async Task<object> Create(string connection)
    {
        EnsureUnbound(connection);
        GameRoom room;
        lock (store.CreationGate)
        {
            if (store.Rooms.Count >= settings.MaximumRooms) throw Error("Máy chủ đang đầy. Vui lòng thử lại sau.");
            string code;
            do { code = new string(Enumerable.Range(0, 4).Select(_ => Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]).ToArray()); }
            while (store.Rooms.ContainsKey(code));
            room = new GameRoom { Code = code, HostToken = Token(), HostConnectionId = connection };
            store.Rooms[code] = room;
            store.Connections[connection] = new(code, null);
        }
        await room.Gate.WaitAsync();
        try { await broadcaster.Publish(room); return new { roomCode = room.Code, sessionToken = room.HostToken, isHost = true, snapshot = snapshots.Create(room, null) }; }
        finally { room.Gate.Release(); }
    }

    public async Task<object> Join(string connection, string code, string displayName)
    {
        EnsureUnbound(connection);
        var name = (displayName ?? "").Trim().Normalize(NormalizationForm.FormC);
        if (name.Length is < 1 or > 24 || name.Any(char.IsControl)) throw Error("Tên cần từ 1 đến 24 ký tự và không chứa ký tự điều khiển.");
        var room = Find(code);
        await room.Gate.WaitAsync();
        try
        {
            if (room.Phase != GamePhase.Lobby) throw Error("Trận đã bắt đầu. Chỉ người chơi cũ có thể kết nối lại.");
            if (room.Players.Count >= settings.MaximumPlayers) throw Error("Phòng đã đủ 35 người chơi.");
            if (room.Players.Any(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase))) throw Error("Tên này đã được sử dụng trong phòng.");
            var player = new Player { Name = name, SessionToken = Token(), ConnectionId = connection };
            room.Players.Add(player);
            store.Connections[connection] = new(room.Code, player.Id);
            await broadcaster.Publish(room);
            return new { roomCode = room.Code, sessionToken = player.SessionToken, isHost = false, snapshot = snapshots.Create(room, player.Id) };
        }
        finally { room.Gate.Release(); }
    }

    public async Task<object> Reconnect(string connection, string code, string token)
    {
        EnsureUnbound(connection);
        var room = Find(code);
        await room.Gate.WaitAsync();
        try
        {
            if (string.IsNullOrEmpty(token)) throw Error("Phiên không hợp lệ. Hãy tham gia lại.");
            var isHost = token == room.HostToken;
            var player = room.Players.FirstOrDefault(p => p.SessionToken == token);
            if (!isHost && player is null) throw Error("Phiên không hợp lệ hoặc đã hết hạn.");
            var old = isHost ? room.HostConnectionId : player!.ConnectionId;
            if (old is not null && old != connection) {
                store.Connections.TryRemove(old, out _);
                await broadcaster.Replaced(old);
            }
            if (isHost) room.HostConnectionId = connection; else player!.ConnectionId = connection;
            store.Connections[connection] = new(room.Code, isHost ? null : player!.Id);
            await broadcaster.Publish(room);
            return snapshots.Create(room, isHost ? null : player!.Id);
        }
        finally { room.Gate.Release(); }
    }

    private async Task<object?> InRoom(string connection, Func<GameRoom, SessionBinding, Task<object?>> action)
    {
        if (!store.Connections.TryGetValue(connection, out var binding)) throw Error("Bạn chưa tham gia phòng hoặc phiên đã được mở ở tab khác.");
        var room = Find(binding.RoomCode);
        await room.Gate.WaitAsync();
        try {
            if (!store.Connections.TryGetValue(connection, out var current) || current != binding) throw Error("Phiên đã được thay thế.");
            return await action(room, binding);
        }
        finally { room.Gate.Release(); }
    }
    private static Player Participant(GameRoom room, SessionBinding binding) => room.Players.FirstOrDefault(p => p.Id == binding.PlayerId) ?? throw Error("Host không thể thực hiện hành động của người chơi.");
    private static void RequirePhase(GameRoom room, params GamePhase[] phases) {
        if (!phases.Contains(room.Phase) || room.PhaseEndsAt <= DateTimeOffset.UtcNow) throw Error("Không thể thực hiện hành động trong giai đoạn này.");
    }
    private static void RequireHost(SessionBinding binding) { if (binding.PlayerId is not null) throw Error("Chỉ host có quyền thực hiện hành động này."); }

    public Task<object?> GetSnapshot(string connection) => InRoom(connection, (room, binding) => Task.FromResult<object?>(snapshots.Create(room, binding.PlayerId)));

    public Task<object?> Start(string connection) => InRoom(connection, async (room, binding) => {
        RequireHost(binding);
        if (room.Phase != GamePhase.Lobby) throw Error("Trận đã bắt đầu.");
        if (room.Players.Count < settings.MinimumPlayersToStart || room.Players.Any(p => p.ConnectionId is null)) throw Error($"Cần ít nhất {settings.MinimumPlayersToStart} người chơi và tất cả phải đang kết nối.");
        var shuffled = room.Players.ToArray();
        RandomNumberGenerator.Shuffle(shuffled.AsSpan());
        var special = Math.Max(1, room.Players.Count / 7);
        for (var i = 0; i < shuffled.Length; i++) {
            var p = shuffled[i];
            p.Role = i < special ? PlayerRole.FactChecker : i < special * 2 ? PlayerRole.Manipulator : PlayerRole.User;
            p.VerifyTokens = p.Role == PlayerRole.FactChecker ? 2 : 0;
            p.BoostTokens = p.Role == PlayerRole.Manipulator ? 2 : 0;
        }
        var evidence = Enumerable.Range(0, shuffled.Length).Select(i => room.Scenario.Evidence[i % room.Scenario.Evidence.Length].Id).ToArray();
        RandomNumberGenerator.Shuffle(evidence.AsSpan());
        for (var i = 0; i < shuffled.Length; i++) shuffled[i].EvidenceId = evidence[i];
        machine.SetPhase(room, GamePhase.RoleReveal);
        await broadcaster.Publish(room);
        machine.Start(room);
        return null;
    });

    public Task<object?> Vote(string connection, string verdict, bool final) => InRoom(connection, async (room, binding) => {
        RequirePhase(room, final ? GamePhase.FinalVote : GamePhase.InitialVote);
        var p = Participant(room, binding);
        if (!Enum.TryParse<Verdict>(verdict, false, out var choice) || !Enum.IsDefined(choice) || choice.ToString() != verdict) throw Error("Lựa chọn không hợp lệ.");
        if (final ? p.FinalVote.HasValue : p.InitialVote.HasValue) throw Error("Phiếu đã được khóa.");
        if (final) p.FinalVote = choice; else p.InitialVote = choice;
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> Share(string connection, string id) => InRoom(connection, async (room, binding) => {
        RequirePhase(room, GamePhase.Investigation, GamePhase.Discussion);
        var p = Participant(room, binding);
        if (p.EvidenceId != id) throw Error("Bạn chỉ có thể chia sẻ bằng chứng của mình.");
        if (!room.PublicEvidence.TryGetValue(id, out var evidence)) room.PublicEvidence[id] = evidence = new SharedEvidence { EvidenceId = id };
        if (evidence.SharedBy.Contains(p.Id)) return null;
        evidence.SharedBy.Add(p.Id);
        evidence.IsVerified |= p.VerifiedEvidence.Contains(id);
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> Verify(string connection, string id) => InRoom(connection, async (room, binding) => {
        RequirePhase(room, GamePhase.Investigation, GamePhase.Discussion);
        var p = Participant(room, binding);
        if (p.Role != PlayerRole.FactChecker) throw Error("Chỉ Fact Checker có thể kiểm chứng.");
        var evidence = room.Scenario.Evidence.FirstOrDefault(e => e.Id == id);
        var shared = room.PublicEvidence.GetValueOrDefault(id);
        if (evidence is null || !evidence.CanVerify || (p.EvidenceId != id && shared is null)) throw Error("Bạn không có quyền kiểm chứng bằng chứng này.");
        if (p.VerifiedEvidence.Contains(id) || shared?.IsVerified == true) throw Error("Bằng chứng đã được kiểm chứng. Bạn không mất token.");
        if (p.VerifyTokens <= 0) throw Error("Bạn đã dùng hết lượt kiểm chứng.");
        p.VerifyTokens--;
        p.VerifiedEvidence.Add(id);
        if (shared is not null) shared.IsVerified = true;
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> Boost(string connection, string id) => InRoom(connection, async (room, binding) => {
        RequirePhase(room, GamePhase.Discussion);
        var p = Participant(room, binding);
        if (p.Role != PlayerRole.Manipulator) throw Error("Chỉ Manipulator có thể đẩy xu hướng.");
        if (p.BoostTokens <= 0) throw Error("Bạn đã dùng hết lượt đẩy xu hướng.");
        if (!room.PublicEvidence.TryGetValue(id, out var evidence)) throw Error("Chỉ có thể đẩy bằng chứng đã công khai.");
        if (evidence.IsBoosted) throw Error("Bằng chứng này đã được đẩy xu hướng.");
        p.BoostTokens--;
        evidence.IsBoosted = true;
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> Message(string connection, string content) => InRoom(connection, async (room, binding) => {
        RequirePhase(room, GamePhase.Discussion);
        var p = Participant(room, binding);
        var text = (content ?? "").Trim();
        if (text.Length is < 1 or > 200 || text.Any(c => char.IsControl(c) && c != '\n')) throw Error("Tin nhắn cần từ 1 đến 200 ký tự.");
        var now = DateTimeOffset.UtcNow;
        if (p.LastMessageAt.HasValue && (now - p.LastMessageAt.Value).TotalSeconds < 3) throw Error("Vui lòng chờ 3 giây giữa các tin nhắn.");
        p.LastMessageAt = now;
        room.Messages.Add(new(Guid.NewGuid().ToString("N"), p.Id, p.Name, text, now));
        if (room.Messages.Count > 200) room.Messages.RemoveAt(0);
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> End(string connection) => InRoom(connection, async (room, binding) => {
        RequireHost(binding);
        if (room.Phase == GamePhase.Finished) return null;
        room.Lifetime.Cancel(); room.Aborted = true;
        machine.SetPhase(room, GamePhase.Finished);
        await broadcaster.Publish(room); return null;
    });

    public Task<object?> Leave(string connection) => InRoom(connection, async (room, binding) => {
        if (room.Phase != GamePhase.Lobby && room.Phase != GamePhase.Finished) throw Error("Trận đang diễn ra. Bạn có thể đóng tab và kết nối lại.");
        if (binding.PlayerId is null) {
            room.Lifetime.Cancel(); room.Aborted = true;
            machine.SetPhase(room, GamePhase.Finished);
            room.HostConnectionId = null;
        } else room.Players.RemoveAll(p => p.Id == binding.PlayerId);
        store.Connections.TryRemove(connection, out _);
        await broadcaster.Publish(room); return null;
    });

    public async Task Disconnect(string connection)
    {
        if (!store.Connections.TryRemove(connection, out var binding) || !store.Rooms.TryGetValue(binding.RoomCode, out var room)) return;
        await room.Gate.WaitAsync();
        try {
            if (binding.PlayerId is null && room.HostConnectionId == connection) room.HostConnectionId = null;
            var p = room.Players.FirstOrDefault(p => p.Id == binding.PlayerId);
            if (p?.ConnectionId == connection) p.ConnectionId = null;
            await broadcaster.Publish(room);
        }
        finally { room.Gate.Release(); }
    }
}
