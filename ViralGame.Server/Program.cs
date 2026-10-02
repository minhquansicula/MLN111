using ViralGame.Server;

var builder = WebApplication.CreateBuilder(args);
var settings = new GameSettings();
builder.Configuration.GetSection("Game").Bind(settings);
if (settings.MaximumPlayers != 35 || settings.MinimumPlayersToStart < 3 || settings.MinimumPlayersToStart > 35
    || settings.DurationScale <= 0 || settings.DurationScale > 10 || settings.MaximumRooms < 1
    || Enum.GetValues<GamePhase>().Where(p => p != GamePhase.Lobby && p != GamePhase.Finished).Any(p => settings.Duration(p) <= 0))
    throw new InvalidOperationException("Invalid Game configuration.");
if (builder.Environment.IsProduction() && settings.DurationScale != 1)
    throw new InvalidOperationException("Production requires normal timing.");
builder.Services.AddSingleton(settings);
builder.Services.AddSingleton<RoomStore>();
builder.Services.AddSingleton<SnapshotService>();
builder.Services.AddSingleton<RoomBroadcaster>();
builder.Services.AddSingleton<GameStateMachine>();
builder.Services.AddSingleton<GameService>();
builder.Services.AddHostedService<RoomCleanupService>();
builder.Services.AddSignalR(options => {
    options.MaximumReceiveMessageSize = 16 * 1024;
    options.MaximumParallelInvocationsPerClient = 1;
    options.EnableDetailedErrors = false;
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173", "http://127.0.0.1:5173"])
        .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
var app = builder.Build();
app.Use(async (context, next) => {
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "same-origin";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    await next();
});
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/health", () => Results.Ok(new { status = "ok", app = "VIRAL" }));
app.MapHub<GameHub>("/gameHub");
app.MapFallbackToFile("index.html");
app.Run();
