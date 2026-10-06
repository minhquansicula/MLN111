namespace ViralGame.Server.TruthRush;

public static class TruthRushEndpoints
{
    public static IEndpointRouteBuilder MapTruthRush(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/class-sessions");
        group.MapPost("/", (CreateClassRequest? request, TruthRushClassService service) => Execute(() => Results.Created("/api/class-sessions", service.CreateSession(request?.PackId ?? "complete"))));
        group.MapGet("/{code}", (string code, TruthRushClassService service) => Execute(() => Results.Ok(service.SessionInfo(code))));
        group.MapPost("/{code}/join", (string code, JoinClassRequest request, TruthRushClassService service) => Execute(() => Results.Ok(service.Join(code, request))));
        group.MapPost("/{code}/results", (string code, SubmitRunRequest request, TruthRushClassService service) => Execute(() => Results.Ok(service.Submit(code, request))));
        group.MapPut("/{code}/progress", (string code, SubmitRunRequest request, TruthRushClassService service) => Execute(() => Results.Ok(service.UpdateProgress(code, request))));
        group.MapGet("/{code}/stats", (string code, HttpRequest request, TruthRushClassService service) => Execute(() => Results.Ok(service.Stats(code, request.Headers["X-Session-Token"].FirstOrDefault()))));
        group.MapGet("/{code}/leaderboard", (string code, HttpRequest request, TruthRushClassService service) => Execute(() => Results.Ok(service.Leaderboard(code, request.Headers["X-Session-Token"].FirstOrDefault()))));
        return endpoints;
    }

    private static IResult Execute(Func<IResult> action)
    {
        try { return action(); }
        catch (TruthRushValidationException error) { return Results.BadRequest(new { error = error.Message }); }
        catch (KeyNotFoundException error) { return Results.NotFound(new { error = error.Message }); }
        catch (UnauthorizedAccessException error) { return Results.Json(new { error = error.Message }, statusCode: StatusCodes.Status401Unauthorized); }
    }
}
