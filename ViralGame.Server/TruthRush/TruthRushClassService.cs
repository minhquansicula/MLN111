using System.Security.Cryptography;
using System.Text;

namespace ViralGame.Server.TruthRush;

public sealed class TruthRushClassService(TruthRushStore store, TruthRushSettings settings, TruthRushScoringService scoring)
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public CreateClassResponse CreateSession(string packId = "complete")
    {
        if (string.IsNullOrWhiteSpace(packId) || !TruthRushRubrics.Packs.ContainsKey(packId)) throw new TruthRushValidationException("Bộ hồ sơ không hợp lệ.");
        lock (store.CreationGate)
        {
            RemoveExpired();
            if (store.Sessions.Count >= settings.MaximumSessions) throw new TruthRushValidationException("Máy chủ đang có quá nhiều lớp học đang hoạt động.");
            string code;
            do { code = new string(Enumerable.Range(0, 6).Select(_ => Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]).ToArray()); }
            while (store.Sessions.ContainsKey(code));
            var session = new ClassSession { Code = code, TeacherToken = Token(), PackId = packId };
            store.Sessions[code] = session;
            return new(code, session.TeacherToken, session.PackId);
        }
    }

    public JoinClassResponse Join(string rawCode, JoinClassRequest request)
    {
        var session = Find(rawCode);
        var name = CleanName(request.PlayerName);
        lock (session.Gate)
        {
            if (session.Participants.Count >= settings.MaximumPlayersPerSession) throw new TruthRushValidationException("Lớp học đã đủ người tham gia.");
            if (session.Participants.Values.Any(item => string.Equals(item.Name, name, StringComparison.OrdinalIgnoreCase))) throw new TruthRushValidationException("Tên này đã được sử dụng trong lớp.");
            var participant = new ClassParticipant(Guid.NewGuid().ToString("N"), name, Token(), DateTimeOffset.UtcNow);
            session.Participants[participant.Id] = participant;
            return new(session.Code, participant.Token, participant.Name, session.PackId);
        }
    }

    public ScoredRun Submit(string rawCode, SubmitRunRequest request)
    {
        var session = Find(rawCode);
        var participant = session.Participants.Values.FirstOrDefault(item => FixedEquals(item.Token, request.ParticipantToken))
            ?? throw new UnauthorizedAccessException("Phiên người chơi không hợp lệ.");
        var result = scoring.Score(participant.Id, participant.Name, request);
        if (!result.Cases.Select(item => item.CaseId).ToHashSet(StringComparer.Ordinal).SetEquals(TruthRushRubrics.Packs[session.PackId]))
            throw new TruthRushValidationException("Kết quả không thuộc bộ hồ sơ của lớp.");
        var key = $"{participant.Id}:{result.RunId}";
        lock (session.Gate)
        {
            if (session.Results.TryGetValue(key, out var existing)) return existing;
            if (session.Results.Values.Any(item => item.ParticipantId == participant.Id)) throw new TruthRushValidationException("Bạn đã nộp kết quả cho lớp này.");
            session.Results[key] = result;
            return result;
        }
    }

    public ClassStatsResponse Stats(string rawCode, string? token)
    {
        var session = Find(rawCode);
        AuthorizeStats(session, token);
        var runs = session.Results.Values.ToArray();
        var opinions = TruthRushRubrics.Packs[session.PackId].Select(caseId => new CaseOpinionStats(
            caseId,
            Distribution(runs.SelectMany(run => run.Cases).Where(item => item.CaseId == caseId).Select(item => item.InitialVerdict), runs.Length),
            Distribution(runs.SelectMany(run => run.Cases).Where(item => item.CaseId == caseId).Select(item => item.FinalVerdict), runs.Length))).ToArray();
        var used = runs.SelectMany(run => run.Cases).SelectMany(item => item.UsedInvestigations.Select(id => $"{item.CaseId}:{id}")).GroupBy(id => id).OrderByDescending(group => group.Count()).ThenBy(group => group.Key).Take(8).Select(group => new NamedCount(group.Key, group.Count())).ToArray();
        var missed = runs.SelectMany(run => run.Cases).SelectMany(item => TruthRushRubrics.Cases[item.CaseId].StrongInvestigations.Except(item.UsedInvestigations).Select(id => $"{item.CaseId}:{id}")).GroupBy(id => id).OrderByDescending(group => group.Count()).ThenBy(group => group.Key).Take(8).Select(group => new NamedCount(group.Key, group.Count())).ToArray();
        var actions = runs.SelectMany(run => run.Cases).GroupBy(item => item.ResponsibleAction).OrderByDescending(group => group.Count()).Select(group => new NamedCount(group.Key, group.Count())).ToArray();
        return new(session.Code, session.Participants.Count, runs.Length, Average(runs, run => run.Score.Total), Average(runs, run => run.Score.Accuracy), Average(runs, run => run.Score.Investigation), Average(runs, run => run.Score.Responsibility), opinions, used, missed, actions);
    }

    public IReadOnlyList<LeaderboardEntry> Leaderboard(string rawCode, string? token)
    {
        var session = Find(rawCode);
        AuthorizeStats(session, token);
        return session.Results.Values
            .OrderByDescending(run => run.Score.Accuracy)
            .ThenByDescending(run => run.Score.Investigation)
            .ThenByDescending(run => run.Score.Responsibility)
            .ThenByDescending(run => run.Score.Confidence)
            .ThenBy(run => run.DurationSeconds)
            .Select((run, index) => new LeaderboardEntry(index + 1, run.PlayerName, run.Score.Total, run.Score.Accuracy, run.Score.Investigation, run.Score.Responsibility, run.Score.Confidence, run.DurationSeconds))
            .ToArray();
    }

    public object SessionInfo(string rawCode)
    {
        var session = Find(rawCode);
        return new { session.Code, session.PackId, playersJoined = session.Participants.Count, playersCompleted = session.Results.Count };
    }

    private ClassSession Find(string rawCode)
    {
        var code = (rawCode ?? "").Trim().ToUpperInvariant();
        if (!store.Sessions.TryGetValue(code, out var session) || DateTimeOffset.UtcNow - session.CreatedAt > TimeSpan.FromHours(settings.SessionLifetimeHours))
            throw new KeyNotFoundException("Mã lớp không tồn tại hoặc đã hết hạn.");
        return session;
    }

    private static string CleanName(string? value)
    {
        var name = (value ?? "").Trim().Normalize(NormalizationForm.FormC);
        if (name.Length is < 1 or > 24 || name.Any(char.IsControl)) throw new TruthRushValidationException("Tên cần từ 1 đến 24 ký tự.");
        return name;
    }

    private static IReadOnlyList<VerdictDistribution> Distribution(IEnumerable<string> source, int total)
    {
        var counts = source.GroupBy(value => value).ToDictionary(group => group.Key, group => group.Count());
        return TruthRushRubrics.Verdicts.Select(verdict => new VerdictDistribution(verdict, counts.GetValueOrDefault(verdict), total == 0 ? 0 : Math.Round(counts.GetValueOrDefault(verdict) * 100d / total, 1))).ToArray();
    }

    private static double Average(IEnumerable<ScoredRun> runs, Func<ScoredRun, int> selector)
    {
        var values = runs.Select(selector).ToArray();
        return values.Length == 0 ? 0 : Math.Round(values.Average(), 1);
    }

    private static void AuthorizeStats(ClassSession session, string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) throw new UnauthorizedAccessException("Thiếu quyền xem kết quả lớp.");
        if (FixedEquals(session.TeacherToken, token)) return;
        var participant = session.Participants.Values.FirstOrDefault(item => FixedEquals(item.Token, token));
        if (participant is null || !session.Results.Values.Any(result => result.ParticipantId == participant.Id)) throw new UnauthorizedAccessException("Hãy hoàn thành game trước khi xem kết quả lớp.");
    }

    private void RemoveExpired()
    {
        foreach (var session in store.Sessions.Values.Where(item => DateTimeOffset.UtcNow - item.CreatedAt > TimeSpan.FromHours(settings.SessionLifetimeHours))) store.Sessions.TryRemove(session.Code, out _);
    }

    private static string Token() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    private static bool FixedEquals(string expected, string? actual)
    {
        if (actual is null) return false;
        var left = Encoding.UTF8.GetBytes(expected);
        var right = Encoding.UTF8.GetBytes(actual);
        return left.Length == right.Length && CryptographicOperations.FixedTimeEquals(left, right);
    }
}
