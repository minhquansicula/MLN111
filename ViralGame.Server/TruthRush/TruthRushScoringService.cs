namespace ViralGame.Server.TruthRush;

public sealed class TruthRushScoringService
{
    private static readonly IReadOnlyDictionary<int, int> CorrectConfidence = new Dictionary<int, int> { [50] = 0, [60] = 2, [70] = 4, [80] = 6, [90] = 8, [100] = 10 };
    private static readonly IReadOnlyDictionary<int, int> WrongConfidence = new Dictionary<int, int> { [50] = -3, [60] = -5, [70] = -7, [80] = -10, [90] = -15, [100] = -20 };

    public ScoredRun Score(string participantId, string playerName, SubmitRunRequest request, bool allowPartial = false)
    {
        if (string.IsNullOrWhiteSpace(request.RunId) || request.RunId.Length > 80) throw new TruthRushValidationException("Run ID không hợp lệ.");
        if (request.DurationSeconds is < 1 or > 7200) throw new TruthRushValidationException("Thời gian chơi không hợp lệ.");
        if (request.Cases is null || request.Cases.Count == 0 || request.Cases.Any(item => item is null)
            || request.Cases.Select(item => item.CaseId).Distinct(StringComparer.Ordinal).Count() != request.Cases.Count)
            throw new TruthRushValidationException("Kết quả phải có đủ các hồ sơ khác nhau trong bộ.");
        if (!allowPartial && !TruthRushRubrics.Packs.Values.Any(ids => ids.ToHashSet(StringComparer.Ordinal).SetEquals(request.Cases.Select(item => item.CaseId))))
            throw new TruthRushValidationException("Kết quả phải có đủ các hồ sơ thuộc cùng một bộ.");
        var scoredCases = request.Cases.Select(ScoreCase).OrderBy(item => item.CaseId).ToArray();
        var total = new ScoreBreakdown(scoredCases.Sum(item => item.Score.Accuracy), scoredCases.Sum(item => item.Score.Investigation), scoredCases.Sum(item => item.Score.Responsibility), scoredCases.Sum(item => item.Score.Confidence), scoredCases.Sum(item => item.Score.Adaptability), scoredCases.Sum(item => item.Score.Total));
        return new(request.RunId.Trim(), participantId, playerName, request.DurationSeconds, DateTimeOffset.UtcNow, scoredCases, total);
    }

    private static ScoredCase ScoreCase(SubmittedCase submitted)
    {
        if (string.IsNullOrWhiteSpace(submitted.CaseId) || !TruthRushRubrics.Cases.TryGetValue(submitted.CaseId, out var rubric)) throw new TruthRushValidationException("Case không tồn tại.");
        if (!TruthRushRubrics.Verdicts.Contains(submitted.InitialVerdict) || !TruthRushRubrics.Verdicts.Contains(submitted.FinalVerdict)) throw new TruthRushValidationException("Verdict không hợp lệ.");
        if (!TruthRushRubrics.Actions.Contains(submitted.ResponsibleAction)) throw new TruthRushValidationException("Hành động không hợp lệ.");
        if (!TruthRushRubrics.ConfidenceLevels.Contains(submitted.Confidence)) throw new TruthRushValidationException("Độ tự tin không hợp lệ.");
        if (submitted.UsedInvestigations is null || submitted.UsedInvestigations.Any(string.IsNullOrWhiteSpace))
            throw new TruthRushValidationException("Danh sách điều tra không hợp lệ.");
        var used = submitted.UsedInvestigations.Distinct(StringComparer.Ordinal).ToArray();
        if (used.Length != submitted.UsedInvestigations.Count || used.Any(id => !rubric.InvestigationValues.ContainsKey(id))) throw new TruthRushValidationException("Danh sách điều tra không hợp lệ.");
        if (used.Sum(id => rubric.InvestigationCosts[id]) > rubric.InvestigationBudget) throw new TruthRushValidationException("Số điểm điều tra đã vượt giới hạn của case.");
        var correct = submitted.FinalVerdict == rubric.CorrectVerdict;
        var accuracy = correct ? 40 : 0;
        var investigation = Math.Min(25, used.Sum(id => rubric.InvestigationValues[id]));
        var responsibility = submitted.ResponsibleAction == rubric.BestAction ? 20 : rubric.ReasonableActions.Contains(submitted.ResponsibleAction) ? 10 : 0;
        var confidence = correct ? CorrectConfidence[submitted.Confidence] : WrongConfidence[submitted.Confidence];
        var adaptability = submitted.InitialVerdict != rubric.CorrectVerdict && correct ? 5 : 0;
        var total = Math.Clamp(accuracy + investigation + responsibility + confidence + adaptability, 0, 100);
        return new(submitted.CaseId, submitted.InitialVerdict, submitted.FinalVerdict, submitted.Confidence, submitted.ResponsibleAction, used, new(accuracy, investigation, responsibility, confidence, adaptability, total));
    }
}

public sealed class TruthRushValidationException(string message) : Exception(message);
