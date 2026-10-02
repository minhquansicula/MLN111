namespace ViralGame.Server;

public static class VoteService
{
    public static VoteSummary Summarize(GameRoom room, bool final)
    {
        var counts = Enum.GetValues<Verdict>().ToDictionary(v => v.ToString(), _ => 0);
        foreach (var player in room.Players)
        {
            var vote = final ? player.FinalVote : player.InitialVote;
            if (vote.HasValue) counts[vote.Value.ToString()]++;
        }
        var total = room.Players.Count;
        var cast = counts.Values.Sum();
        return new(counts, counts.ToDictionary(k => k.Key, v => total == 0 ? 0 : Math.Round(v.Value * 100d / total, 1)), total - cast, total, cast);
    }

    public static GameResult Calculate(GameRoom room)
    {
        var initial = Summarize(room, false);
        var final = Summarize(room, true);
        var max = final.Counts.Values.Max();
        var leaders = final.Counts.Where(v => v.Value == max).Select(v => v.Key).ToArray();
        var verdict = max > 0 && leaders.Length == 1 ? leaders[0] : null;
        var correct = room.Scenario.CorrectVerdict.ToString();
        var target = room.Scenario.ManipulatorTarget.ToString();
        var winner = verdict == correct ? "Truth" : verdict == target ? "Manipulator" : "Draw";
        return new(correct, room.Scenario.Explanation, winner, verdict, initial, final,
            initial.Percentages[correct], final.Percentages[correct],
            room.Players.Count(p => p.InitialVote.HasValue && p.FinalVote.HasValue && p.InitialVote != p.FinalVote),
            room.PublicEvidence.Count, room.PublicEvidence.Values.Count(e => e.IsVerified), room.PublicEvidence.Values.Count(e => e.IsBoosted),
            room.Players.Select(p => new RoleReveal(p.Id, p.Name, p.Role.ToString())).ToList(),
            room.PublicEvidence.Values.Where(e => e.IsBoosted).Select(e => e.EvidenceId).ToArray());
    }
}
