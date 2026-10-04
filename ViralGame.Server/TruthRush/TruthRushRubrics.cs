namespace ViralGame.Server.TruthRush;

public sealed record CaseRubric(string CaseId, string CorrectVerdict, string BestAction, IReadOnlySet<string> ReasonableActions, int InvestigationBudget, IReadOnlyDictionary<string, int> InvestigationValues, IReadOnlyDictionary<string, int> InvestigationCosts, IReadOnlySet<string> StrongInvestigations);

public static class TruthRushRubrics
{
    public static readonly string[] Verdicts = ["TRUE", "FALSE", "MISLEADING", "NOT_ENOUGH_EVIDENCE"];
    public static readonly string[] Actions = ["SHARE", "REPORT", "ADD_CONTEXT", "WAIT_FOR_MORE_EVIDENCE"];
    public static readonly int[] ConfidenceLevels = [50, 60, 70, 80, 90, 100];
    public static readonly IReadOnlyDictionary<string, string[]> Packs = new Dictionary<string, string[]>
    {
        ["complete"] = ["case_01", "case_02", "case_03", "case_04", "case_05", "case_06", "case_07", "case_08"],
        ["foundation"] = ["case_01", "case_02", "case_03", "case_04"],
        ["advanced"] = ["case_05", "case_06", "case_07", "case_08"],
    };

    public static IReadOnlyDictionary<string, CaseRubric> Cases { get; } = new Dictionary<string, CaseRubric>(StringComparer.Ordinal)
    {
        ["case_01"] = new("case_01", "FALSE", "REPORT", new HashSet<string>(["WAIT_FOR_MORE_EVIDENCE"]), 3,
            new Dictionary<string, int> { ["check_source"] = 10, ["check_official"] = 15, ["check_author"] = 5, ["check_comments"] = 2, ["read_original"] = 20 },
            new Dictionary<string, int> { ["check_source"] = 1, ["check_official"] = 1, ["check_author"] = 1, ["check_comments"] = 1, ["read_original"] = 2 },
            new HashSet<string>(["check_official", "read_original"])),
        ["case_02"] = new("case_02", "MISLEADING", "ADD_CONTEXT", new HashSet<string>(["WAIT_FOR_MORE_EVIDENCE"]), 3,
            new Dictionary<string, int> { ["check_statistics"] = 20, ["check_sample"] = 10, ["check_source"] = 5, ["check_comments"] = 2, ["search_other_news"] = 8, ["read_original"] = 15 },
            new Dictionary<string, int> { ["check_statistics"] = 1, ["check_sample"] = 1, ["check_source"] = 1, ["check_comments"] = 1, ["search_other_news"] = 1, ["read_original"] = 2 },
            new HashSet<string>(["check_statistics", "read_original"])),
        ["case_03"] = new("case_03", "TRUE", "SHARE", new HashSet<string>(["ADD_CONTEXT"]), 3,
            new Dictionary<string, int> { ["check_date"] = 15, ["view_full_context"] = 20, ["check_official"] = 15, ["check_comments"] = 2, ["check_metadata"] = 10 },
            new Dictionary<string, int> { ["check_date"] = 1, ["view_full_context"] = 2, ["check_official"] = 1, ["check_comments"] = 1, ["check_metadata"] = 1 },
            new HashSet<string>(["view_full_context", "check_official"])),
        ["case_04"] = new("case_04", "NOT_ENOUGH_EVIDENCE", "WAIT_FOR_MORE_EVIDENCE", new HashSet<string>(["ADD_CONTEXT"]), 4,
            new Dictionary<string, int> { ["check_source"] = 10, ["check_image"] = 15, ["check_date"] = 15, ["search_other_news"] = 20, ["check_official"] = 10, ["check_comments"] = 2 },
            new Dictionary<string, int> { ["check_source"] = 1, ["check_image"] = 1, ["check_date"] = 1, ["search_other_news"] = 1, ["check_official"] = 1, ["check_comments"] = 1 },
            new HashSet<string>(["search_other_news", "check_image"])),
        ["case_05"] = new("case_05", "MISLEADING", "ADD_CONTEXT", new HashSet<string>(["WAIT_FOR_MORE_EVIDENCE"]), 4,
            new Dictionary<string, int> { ["check_statistics"] = 10, ["read_method"] = 20, ["check_sample"] = 8, ["check_source"] = 4, ["compare_replication"] = 10, ["check_comments"] = 2 },
            new Dictionary<string, int> { ["check_statistics"] = 1, ["read_method"] = 2, ["check_sample"] = 1, ["check_source"] = 1, ["compare_replication"] = 1, ["check_comments"] = 1 },
            new HashSet<string>(["read_method", "compare_replication"])),
        ["case_06"] = new("case_06", "FALSE", "ADD_CONTEXT", new HashSet<string>(["REPORT"]), 3,
            new Dictionary<string, int> { ["reverse_image"] = 20, ["compare_location"] = 15, ["check_official"] = 10, ["check_weather"] = 4, ["check_metadata"] = 5, ["check_comments"] = 2 },
            new Dictionary<string, int> { ["reverse_image"] = 2, ["compare_location"] = 1, ["check_official"] = 1, ["check_weather"] = 1, ["check_metadata"] = 1, ["check_comments"] = 1 },
            new HashSet<string>(["reverse_image", "compare_location"])),
        ["case_07"] = new("case_07", "TRUE", "SHARE", new HashSet<string>(["ADD_CONTEXT"]), 3,
            new Dictionary<string, int> { ["read_policy"] = 20, ["check_ticket"] = 15, ["check_receipt"] = 10, ["check_source"] = 5, ["check_old_policy"] = 3, ["check_comments"] = 2 },
            new Dictionary<string, int> { ["read_policy"] = 2, ["check_ticket"] = 1, ["check_receipt"] = 1, ["check_source"] = 1, ["check_old_policy"] = 1, ["check_comments"] = 1 },
            new HashSet<string>(["read_policy", "check_ticket"])),
        ["case_08"] = new("case_08", "NOT_ENOUGH_EVIDENCE", "WAIT_FOR_MORE_EVIDENCE", new HashSet<string>(["ADD_CONTEXT"]), 4,
            new Dictionary<string, int> { ["trace_recording"] = 20, ["check_detector"] = 15, ["find_minutes"] = 15, ["check_official"] = 10, ["check_budget"] = 5, ["check_comments"] = 2 },
            new Dictionary<string, int> { ["trace_recording"] = 2, ["check_detector"] = 1, ["find_minutes"] = 2, ["check_official"] = 1, ["check_budget"] = 1, ["check_comments"] = 1 },
            new HashSet<string>(["trace_recording", "check_detector", "find_minutes"])),
    };
}
