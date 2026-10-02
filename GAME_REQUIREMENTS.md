# VIRAL: Truth Under Pressure

> Multiplayer Web Game about Misinformation & Critical Thinking

---

# 1. Project Overview

## 1.1 Project Name

**VIRAL: Truth Under Pressure**

## 1.2 Game Type

- Multiplayer Web Game
- Social Deduction
- Investigation
- Critical Thinking
- Misinformation Simulation
- Classroom Game

## 1.3 Target

- 35 players
- 1 Host
- 1 shared game room
- Approximately 15 minutes per match
- Players use phones or laptops
- No installation required
- No account registration required

---

# 2. Main Objective

Players are shown one viral social media claim.

Each player receives incomplete information.

Players must:

- inspect evidence;
- evaluate information sources;
- communicate with other players;
- compare conflicting information;
- decide whether the claim is:
  - `TRUE`
  - `FALSE`
  - `MISLEADING`
  - `NOT_ENOUGH_EVIDENCE`
- decide how they would respond to the information.

Some players secretly receive special roles.

The game should reward:

> Evidence > Popularity

> Verification > Confidence

> Context > Headlines

> Reasoning > Social Pressure

---

# 3. Technology Stack

## 3.1 Frontend

```text
React
Vite
JavaScript
@Microsoft/signalr
CSS / Tailwind CSS optional
```

## 3.2 Backend

```text
ASP.NET Core Web API
SignalR
C#
```

## 3.3 Database

For MVP:

```text
NO DATABASE
```

All active game data is stored in server memory.

Example:

```csharp
Dictionary<string, GameRoom> Rooms = new();
```

A database may be added later for:

- scenario management;
- match history;
- analytics;
- accounts;
- saved results.

---

# 4. High-Level Architecture

```text
Player Phone / Laptop
        │
        ▼
   React + Vite
        │
        │ SignalR
        ▼
 ASP.NET Core Server
        │
        ├── RoomService
        ├── GameService
        ├── RoleService
        ├── VoteService
        ├── EvidenceService
        └── GameStateMachine
        │
        ▼
   In-Memory Storage
```

The backend must be an:

```text
AUTHORITATIVE SERVER
```

The server controls:

- room state;
- connected players;
- secret roles;
- scenario;
- private evidence;
- timer;
- game phases;
- votes;
- special abilities;
- results.

The frontend only:

- displays current game state;
- sends player actions;
- renders server responses.

---

# 5. MVP Scope

The MVP must implement:

- Create Room
- Join Room
- Lobby
- Up to 35 players
- Random secret roles
- Breaking News
- Initial Vote
- Initial Vote statistics
- Private Evidence
- Evidence Sharing
- Public Chat
- Fact Checker ability
- Manipulator ability
- Final Vote
- Automatic timer
- Automatic phase transition
- Correct answer reveal
- Secret role reveal
- Initial vs Final vote statistics
- Basic reconnect
- Result screen

---

# 6. Features NOT Required for MVP

Do **NOT** implement these before the MVP is stable:

- SQL Server
- PostgreSQL
- User accounts
- Login/password
- Match history
- Persistent leaderboard
- Private messaging
- Voice chat
- Challenge Player
- Virality system
- Complex Social Proof
- AI-generated scenarios
- Multiple simultaneous scenarios per match
- Friend system
- Matchmaking
- Cosmetics
- Inventory
- Admin CMS
- Ranking system

---

# 7. Player Roles

There are 3 roles.

## 7.1 User

Default player.

Goal:

> Reach the most accurate conclusion based on available evidence.

User can:

- view private evidence;
- share evidence;
- read public evidence;
- use public chat;
- submit Initial Vote;
- submit Final Vote.

---

## 7.2 Fact Checker

Fact Checker has all normal User abilities.

Additional resource:

```text
Verify Tokens = 2
```

Special ability:

```text
VERIFY
```

Example:

Before verification:

```text
Source:
Student Daily News

Reliability:
Unknown
```

After verification:

```text
SOURCE CHECK

Reliability:
LOW

Author Verified:
NO
```

---

## 7.3 Manipulator

Manipulator attempts to influence the class toward an incorrect conclusion.

Additional resource:

```text
Boost Tokens = 2
```

Special ability:

```text
BOOST
```

BOOST may only be used on public evidence.

Effect:

```text
🔥 TRENDING EVIDENCE
```

BOOST must **NOT**:

- change evidence content;
- create fake evidence;
- delete evidence;
- edit evidence wording.

BOOST only changes:

- visual priority;
- display order;
- presentation prominence.

---

# 8. Role Distribution

Default classroom configuration:

| Role | Count |
|---|---:|
| User | 25 |
| Fact Checker | 5 |
| Manipulator | 5 |
| Total | 35 |

Role assignment is random and handled by the backend.

---

# 9. Secret Role Rules

A player may only know:

```text
their own role
```

Before Reveal Phase, the frontend must never receive roles of other players.

Bad:

```json
[
  {
    "name": "Minh",
    "role": "MANIPULATOR"
  }
]
```

Good:

```json
[
  {
    "name": "Minh"
  }
]
```

Hidden role data stays on the server until Reveal Phase.

---

# 10. Main Game Flow

```text
CREATE ROOM
      ↓
PLAYERS JOIN
      ↓
HOST STARTS GAME
      ↓
ROLE REVEAL
      ↓
BREAKING NEWS
      ↓
INITIAL VOTE
      ↓
PRIVATE EVIDENCE
      ↓
INVESTIGATION
      ↓
PUBLIC DISCUSSION
      ↓
FACT CHECKER VERIFY
      ↓
MANIPULATOR BOOST
      ↓
FINAL VOTE
      ↓
CORRECT ANSWER
      ↓
ROLE REVEAL
      ↓
RESULT
```

---

# 11. Game State Machine

```csharp
public enum GamePhase
{
    Lobby,
    RoleReveal,
    BreakingNews,
    InitialVote,
    Investigation,
    Discussion,
    FinalVote,
    Reveal,
    Result,
    Finished
}
```

Only the backend may change `GamePhase`.

---

# 12. Game Duration

Target duration:

```text
15 minutes
```

Recommended timeline:

| Phase | Duration |
|---|---:|
| Role Reveal | 30 sec |
| Breaking News | 45 sec |
| Initial Vote | 30 sec |
| Investigation | 3 min |
| Discussion | 6 min |
| Final Vote | 30 sec |
| Reveal + Result | Remaining time |

Suggested configuration:

```csharp
public static class GameSettings
{
    public const int RoleRevealSeconds = 30;
    public const int BreakingNewsSeconds = 45;
    public const int InitialVoteSeconds = 30;
    public const int InvestigationSeconds = 180;
    public const int DiscussionSeconds = 360;
    public const int FinalVoteSeconds = 30;
}
```

---

# 13. Automatic Game Requirement

After Host presses:

```text
START GAME
```

the game must automatically progress.

The Host must **NOT** need to manually press:

```text
Next Phase
Open Vote
Close Vote
Give Evidence
Reveal Answer
Show Result
```

All phase transitions are automatic.

---

# 14. Host Requirements

The Host can:

- create room;
- see Room Code;
- see connected players;
- start the game;
- observe the current phase;
- emergency end the match.

After the game starts, the Host does not control normal gameplay.

---

# 15. Create Room

Host clicks:

```text
CREATE ROOM
```

Server creates a `GameRoom` and generates a unique Room Code.

Example:

```text
A7X9
```

Recommended Room Code:

- 4 uppercase characters;
- easy to type;
- unique among active rooms;
- avoid confusing characters if possible.

Example character set:

```text
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```

---

# 16. Join Room

Player enters:

```text
Display Name
Room Code
```

Example:

```text
Name:
Quan

Room:
A7X9
```

Then clicks:

```text
JOIN GAME
```

---

# 17. Join Validation

Server validates:

- room exists;
- room has not started;
- room is not full;
- Display Name is not empty;
- Display Name is unique inside the room.

Maximum production players:

```text
35
```

---

# 18. Lobby

Lobby displays:

```text
ROOM CODE

A7X9
```

and:

```text
PLAYERS

31 / 35
```

Player list:

```text
Quan
Minh
Lan
Duc
Phuc
...
```

Host sees:

```text
START GAME
```

Normal players see:

```text
WAITING FOR HOST
```

---

# 19. Development Mode

During development, do **NOT** require 35 real players.

Use:

```csharp
MinimumPlayersToStart = 3;
```

Development:

```text
3+ players
```

Production classroom mode:

```text
35 players
```

Example:

```csharp
if (app.Environment.IsDevelopment())
{
    gameSettings.MinimumPlayersToStart = 3;
}
else
{
    gameSettings.MinimumPlayersToStart = 35;
}
```

---

# 20. Start Game

When Host presses Start, server must:

1. validate the room;
2. lock the room;
3. prevent new players from joining;
4. select the scenario;
5. shuffle players;
6. assign roles;
7. assign private evidence;
8. start `GameStateMachine`;
9. send each player their own secret role.

---

# 21. Role Reveal Screen

Each player sees only their own role.

User:

```text
YOUR ROLE

👤 USER

Find the truth.

Evaluate evidence carefully.
```

Fact Checker:

```text
YOUR ROLE

🔎 FACT CHECKER

Verify suspicious evidence.

Verify Tokens:
2
```

Manipulator:

```text
YOUR ROLE

🎭 MANIPULATOR

Influence players toward:

TRUE

Boost Tokens:
2
```

---

# 22. Scenario System

Each match contains exactly:

```text
1 Scenario
```

For MVP, the scenario is hardcoded in backend source code.

Recommended file:

```text
Data/ScenarioData.cs
```

No database is required.

---

# 23. Scenario Model

```csharp
public class Scenario
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string PostContent { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public int LikeCount { get; set; }

    public int CommentCount { get; set; }

    public int ShareCount { get; set; }

    public Verdict CorrectVerdict { get; set; }

    public Verdict ManipulatorTarget { get; set; }

    public string Explanation { get; set; } = string.Empty;

    public List<Evidence> EvidenceList { get; set; } = new();
}
```

---

# 24. Verdict Types

```csharp
public enum Verdict
{
    True,
    False,
    Misleading,
    NotEnoughEvidence
}
```

Frontend labels:

```text
TRUE
FALSE
MISLEADING
NOT ENOUGH EVIDENCE
```

---

# 25. Breaking News Phase

All players see the same post.

Example:

```text
🚨 BREAKING

New research proves that students
who use AI tools for studying lose
40% of their memory ability.

Daily Student News

❤️ 16.4K
💬 4.2K
🔁 8.3K
```

The game must not reveal whether the post is correct.

---

# 26. Initial Vote

After Breaking News:

```text
WHAT DO YOU THINK?
```

Options:

```text
TRUE
FALSE
MISLEADING
NOT ENOUGH EVIDENCE
```

Each player may submit only once.

---

# 27. Initial Vote Rules

After submission:

```text
VOTE LOCKED
```

The player cannot modify the Initial Vote.

If timer reaches zero and the player has not voted:

```text
NO_VOTE
```

The game continues.

---

# 28. Initial Vote Result

After Initial Vote ends, show class percentages.

Example:

```text
CLASS OPINION

TRUE                   68%
FALSE                   11%
MISLEADING              15%
NOT ENOUGH EVIDENCE      6%
```

Do not show the correct answer.

This intentionally creates social pressure before investigation.

---

# 29. Evidence System

Each player receives:

```text
1 private Evidence Card
```

Not all evidence is equally reliable.

Possible evidence quality:

- reliable;
- incomplete;
- misleading;
- weak;
- contextual;
- supporting;
- conflicting.

---

# 30. Evidence Model

```csharp
public class Evidence
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public EvidenceType Type { get; set; }

    public string Source { get; set; } = string.Empty;

    public string VerificationResult { get; set; } = string.Empty;

    public bool CanVerify { get; set; }

    public bool IsMisleading { get; set; }

    public bool IsReliable { get; set; }
}
```

---

# 31. Evidence Types

```csharp
public enum EvidenceType
{
    OfficialSource,
    NewsArticle,
    SocialPost,
    Statistic,
    Image,
    Screenshot,
    Witness,
    Research,
    Quote
}
```

---

# 32. Evidence Distribution Rules

Server distributes evidence at game start.

Requirements:

- each player receives one private evidence card;
- players do not all receive the same evidence;
- evidence quality is intentionally mixed;
- no single player should receive the full truth;
- players should need discussion to understand the complete situation.

Example:

```text
Player A → reliable research data
Player B → misleading headline
Player C → incomplete quote
Player D → weak social media comment
Player E → official clarification
```

---

# 33. Evidence Ownership

Suggested model:

```csharp
public class PlayerEvidence
{
    public string PlayerId { get; set; } = string.Empty;

    public string EvidenceId { get; set; } = string.Empty;

    public bool IsShared { get; set; }

    public bool IsVerified { get; set; }

    public bool IsBoosted { get; set; }
}
```

---

# 34. Investigation Phase

During Investigation:

Players can:

- read private evidence;
- inspect source;
- decide whether to share evidence;
- Fact Checkers may verify evidence.

Public chat may be:

```text
disabled
```

or optionally read-only.

For MVP, recommended:

```text
Public Chat disabled during Investigation
```

This makes the later Discussion phase more distinct.

---

# 35. Share Evidence

A player can press:

```text
SHARE TO PUBLIC
```

After sharing, that evidence appears in:

```text
PUBLIC EVIDENCE BOARD
```

All players can view it.

A player cannot edit the evidence before sharing.

---

# 36. Public Evidence Board

Example:

```text
PUBLIC EVIDENCE

🔥 Evidence #04
"AI users performed 40% worse..."

Evidence #12
"The study included 42 students."

Evidence #21
"The researchers warned against
generalizing the result."
```

For each public card show:

- title;
- content;
- source;
- shared by;
- verified status;
- boosted status.

---

# 37. Fact Checker Ability

Fact Checker has:

```text
Verify Tokens = 2
```

Ability:

```text
VERIFY
```

Valid target:

- evidence owned by the Fact Checker;
- public evidence.

Server must validate the request.

---

# 38. Verify Rules

Server checks:

```text
CurrentPhase allows verification
Player.Role == FactChecker
Player.VerifyTokens > 0
Evidence exists
Evidence.CanVerify == true
```

If valid:

```text
VerifyTokens -= 1
```

Then return `VerificationResult`.

---

# 39. Verify Example

Before:

```text
Evidence #12

Source:
Daily Student News

Reliability:
UNKNOWN
```

After:

```text
🔎 VERIFIED

Source Credibility:
LOW

Original Author:
UNKNOWN

Result:
The article is not the original research source.
```

---

# 40. Manipulator Ability

Manipulator has:

```text
Boost Tokens = 2
```

Ability:

```text
BOOST
```

Valid target:

```text
PUBLIC EVIDENCE
```

---

# 41. BOOST Rules

Server checks:

```text
CurrentPhase allows boost
Player.Role == Manipulator
Player.BoostTokens > 0
Evidence is public
Evidence is not already boosted
```

If valid:

```text
BoostTokens -= 1
Evidence.IsBoosted = true
```

All clients receive:

```text
EvidenceBoosted
```

---

# 42. BOOST UI

Normal evidence:

```text
Evidence #14
```

Boosted evidence:

```text
🔥 TRENDING

Evidence #14
```

Boosted evidence may appear:

- at top of Public Evidence Board;
- with a stronger border;
- with a Trending badge.

Do not reveal who boosted it.

---

# 43. Discussion Phase

Public chat is enabled.

Players may:

- send messages;
- discuss evidence;
- share private evidence;
- inspect public evidence;
- use remaining role abilities.

---

# 44. Public Chat Rules

Maximum message length:

```text
200 characters
```

Message cooldown:

```text
3 seconds
```

Players cannot send empty messages.

---

# 45. Chat Message Model

```csharp
public class ChatMessage
{
    public string Id { get; set; } = string.Empty;

    public string PlayerId { get; set; } = string.Empty;

    public string PlayerName { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}
```

---

# 46. Chat Example

```text
Minh:
Tôi nghĩ headline đang phóng đại.

Lan:
Nhưng nghiên cứu thật sự có con số 40%.

Quan:
Con số 40% chỉ áp dụng cho một bài recall test.
```

Chat should support all 35 players in the same room.

---

# 47. Final Vote Phase

At the end of Discussion:

```text
FINAL VOTE
```

Each player selects:

```text
TRUE
FALSE
MISLEADING
NOT ENOUGH EVIDENCE
```

Optional confidence:

```text
50%
60%
70%
80%
90%
100%
```

For MVP, confidence may be omitted if implementation time is limited.

---

# 48. Final Vote Rules

Each player may submit only once.

After submission:

```text
FINAL VOTE LOCKED
```

If player does not vote before timeout:

```text
NO_VOTE
```

The game continues automatically.

---

# 49. Result Calculation

Truth side includes:

```text
USER
FACT_CHECKER
```

Truth side wins if:

```text
MajorityFinalVerdict == Scenario.CorrectVerdict
```

Manipulator side wins if:

```text
MajorityFinalVerdict == Scenario.ManipulatorTarget
```

---

# 50. Tie Rule

If two verdicts have equal votes:

For MVP:

```text
NO MAJORITY
```

No complex tie-breaking is required.

If `NO MAJORITY`:

- Truth Side does not win;
- Manipulator Side does not automatically win unless product design explicitly decides so.

Recommended MVP behavior:

```text
Match Result = DRAW
```

---

# 51. Reveal Phase

Reveal order:

```text
1. Initial Vote Result
2. Final Vote Result
3. Correct Verdict
4. Scenario Explanation
5. Winning Side
6. Manipulator Reveal
7. Fact Checker Reveal
8. Boosted Evidence Reveal
9. Class Statistics
```

---

# 52. Correct Answer Reveal

Example:

```text
CORRECT VERDICT

MISLEADING
```

Then:

```text
WHY?

The original study reported a 40%
difference in one specific recall task.

The viral headline changed that limited
result into the much broader statement
that AI causes students to lose 40%
of their memory ability.
```

---

# 53. Role Reveal

Reveal by role group.

Example:

```text
🎭 MANIPULATORS

Minh
Huy
Lan
Nam
Phuc
```

Then:

```text
🔎 FACT CHECKERS

Quan
Duc
An
Linh
Khoa
```

No need to reveal 35 players individually.

---

# 54. Manipulation Reveal

Show which evidence was boosted.

Example:

```text
MANIPULATION DETECTED

Evidence #04 was artificially boosted
during the Discussion Phase.
```

This is important for post-game learning.

---

# 55. Result Screen

Required statistics:

```text
Initial Correct %
Final Correct %
Players Who Changed Opinion
Total Evidence Shared
Verified Evidence Shared
Boosted Evidence
No Vote Count
Winning Side
```

---

# 56. Example Result

```text
CLASS REPORT

Initial correct belief:
17%

Final correct belief:
63%

Players who changed opinion:
18

Evidence shared:
21

Verified evidence:
6

Boosted evidence:
2

No vote:
1
```

---

# 57. Core Data Models

Minimum backend models:

```text
GameRoom
Player
Scenario
Evidence
PlayerEvidence
Vote
ChatMessage
```

---

# 58. GameRoom Model

```csharp
public class GameRoom
{
    public string RoomCode { get; set; } = string.Empty;

    public string HostConnectionId { get; set; } = string.Empty;

    public bool IsLocked { get; set; }

    public GamePhase CurrentPhase { get; set; }

    public DateTime? PhaseEndsAt { get; set; }

    public Scenario? Scenario { get; set; }

    public List<Player> Players { get; set; } = new();

    public List<Vote> Votes { get; set; } = new();

    public List<ChatMessage> Messages { get; set; } = new();
}
```

---

# 59. Player Model

```csharp
public class Player
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string DisplayName { get; set; } = string.Empty;

    public string ConnectionId { get; set; } = string.Empty;

    public string SessionToken { get; set; } = string.Empty;

    public PlayerRole Role { get; set; }

    public int VerifyTokens { get; set; }

    public int BoostTokens { get; set; }

    public bool IsConnected { get; set; }

    public string? EvidenceId { get; set; }
}
```

---

# 60. PlayerRole Enum

```csharp
public enum PlayerRole
{
    User,
    FactChecker,
    Manipulator
}
```

---

# 61. Vote Model

```csharp
public class Vote
{
    public string PlayerId { get; set; } = string.Empty;

    public VoteType Type { get; set; }

    public Verdict Verdict { get; set; }

    public DateTime SubmittedAt { get; set; }
}
```

---

# 62. VoteType Enum

```csharp
public enum VoteType
{
    Initial,
    Final
}
```

---

# 63. In-Memory Storage

Recommended simple service:

```csharp
public class RoomStore
{
    public ConcurrentDictionary<string, GameRoom> Rooms { get; }
        = new();
}
```

Use `ConcurrentDictionary` instead of a normal `Dictionary`
because multiple SignalR requests may access rooms concurrently.

---

# 64. Backend Project Structure

```text
ViralGame.Server/
│
├── Hubs/
│   └── GameHub.cs
│
├── Models/
│   ├── GameRoom.cs
│   ├── Player.cs
│   ├── Scenario.cs
│   ├── Evidence.cs
│   ├── PlayerEvidence.cs
│   ├── Vote.cs
│   └── ChatMessage.cs
│
├── Enums/
│   ├── GamePhase.cs
│   ├── PlayerRole.cs
│   ├── Verdict.cs
│   ├── VoteType.cs
│   └── EvidenceType.cs
│
├── Services/
│   ├── RoomService.cs
│   ├── GameService.cs
│   ├── RoleService.cs
│   ├── EvidenceService.cs
│   ├── VoteService.cs
│   └── GameStateMachine.cs
│
├── Stores/
│   └── RoomStore.cs
│
├── Data/
│   └── ScenarioData.cs
│
└── Program.cs
```

---

# 65. Frontend Project Structure

```text
viral-game-client/
│
├── src/
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LobbyPage.jsx
│   │   ├── GamePage.jsx
│   │   └── HostPage.jsx
│   │
│   ├── components/
│   │   ├── RoleCard.jsx
│   │   ├── BreakingNewsCard.jsx
│   │   ├── EvidenceCard.jsx
│   │   ├── PublicEvidenceBoard.jsx
│   │   ├── ChatBox.jsx
│   │   ├── VotePanel.jsx
│   │   ├── GameTimer.jsx
│   │   └── ResultPanel.jsx
│   │
│   ├── context/
│   │   └── GameContext.jsx
│   │
│   ├── services/
│   │   └── signalRService.js
│   │
│   ├── hooks/
│   │   └── useGameRoom.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

# 66. Frontend Routes

Recommended routes:

```text
/
```

Join/Create page.

```text
/lobby/:roomCode
```

Player lobby.

```text
/game/:roomCode
```

Player gameplay screen.

```text
/host/:roomCode
```

Host/projector screen.

---

# 67. SignalR Hub

Use:

```text
GameHub
```

The Hub should handle real-time communication.

Do not put all business logic directly in `GameHub`.

`GameHub` should call services.

---

# 68. Client → Server Methods

Minimum methods:

```text
CreateRoom
JoinRoom
Reconnect
StartGame
SubmitInitialVote
ShareEvidence
VerifyEvidence
BoostEvidence
SendMessage
SubmitFinalVote
```

---

# 69. Server → Client Events

Minimum events:

```text
RoomCreated
PlayerJoined
PlayerLeft
GameStarted
RoleAssigned
PhaseChanged
ScenarioReceived
EvidenceAssigned
InitialVoteResult
EvidenceShared
EvidenceVerified
EvidenceBoosted
MessageReceived
FinalVoteStarted
RevealStarted
GameResult
```

---

# 70. Example SignalR Client Setup

Frontend:

```javascript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:5001/gameHub")
  .withAutomaticReconnect()
  .build();

await connection.start();
```

---

# 71. Game Timer

The backend owns the real timer.

Server stores:

```text
PhaseEndsAt
```

Example:

```csharp
room.PhaseEndsAt = DateTime.UtcNow.AddSeconds(30);
```

Server sends:

```json
{
  "phase": "InitialVote",
  "phaseEndsAt": "2026-10-02T14:30:00Z"
}
```

Frontend calculates:

```text
remainingTime = phaseEndsAt - currentTime
```

Frontend countdown is visual only.

Frontend must not decide when a phase ends.

---

# 72. GameStateMachine Responsibility

`GameStateMachine` must:

- start a game;
- change phases automatically;
- store `PhaseEndsAt`;
- broadcast `PhaseChanged`;
- execute phase-end logic;
- start Initial Vote;
- start Investigation;
- start Discussion;
- start Final Vote;
- calculate results;
- trigger Reveal;
- finish the match.

---

# 73. Simplified State Machine Pseudocode

```csharp
public async Task RunGame(GameRoom room)
{
    await SetPhase(room, GamePhase.RoleReveal, 30);

    await SetPhase(room, GamePhase.BreakingNews, 45);

    await SetPhase(room, GamePhase.InitialVote, 30);

    CalculateInitialVote(room);

    await SetPhase(room, GamePhase.Investigation, 180);

    await SetPhase(room, GamePhase.Discussion, 360);

    await SetPhase(room, GamePhase.FinalVote, 30);

    CalculateFinalResult(room);

    await SetPhase(room, GamePhase.Reveal, 120);

    await SetPhase(room, GamePhase.Result, 30);

    room.CurrentPhase = GamePhase.Finished;
}
```

Implementation may use `Task.Delay` for MVP.

For production-scale reliability, a more robust scheduler may be added later.

---

# 74. Reconnect Requirement

If player disconnects:

```text
GAME CONTINUES
```

Do not pause the match.

On initial join, server generates:

```text
SessionToken
```

Frontend stores it locally.

Recommended:

```text
localStorage
```

On reconnect:

```text
RoomCode
SessionToken
```

Server restores:

- PlayerId;
- role;
- private evidence;
- remaining tokens;
- current phase;
- current vote status.

---

# 75. Security Rules

Never trust client state for important data.

Client must never be allowed to send:

```text
"I am FactChecker"
```

or:

```text
"My VerifyTokens = 10"
```

Server already knows those values.

Every special action must be validated server-side.

---

# 76. Server Validation Example

Client requests:

```text
VerifyEvidence("E12")
```

Server checks:

```text
Player exists
Player is in this room
Current phase allows verify
Player.Role == FactChecker
Player.VerifyTokens > 0
Evidence exists
Evidence.CanVerify == true
```

Only then perform verification.

---

# 77. Public vs Private Data

Private:

```text
Player Role
Private Evidence
Remaining Verify Tokens
Remaining Boost Tokens
```

Public:

```text
Display Names
Public Evidence
Chat Messages
Current Phase
Timer
Vote Statistics
Final Result
```

Do not accidentally broadcast private DTOs to the room.

---

# 78. Recommended DTO Separation

Use different response DTOs.

Example:

```text
PlayerPublicDto
PlayerPrivateDto
RoomPublicDto
RoleDto
EvidencePublicDto
EvidencePrivateDto
```

This reduces hidden-information bugs.

---

# 79. Example Scenario for MVP

## Main Claim

```text
AI makes student memory 40% worse
```

## Main Post

```text
A new research study proves that
students who use AI tools for studying
lose 40% of their memory ability.
```

Source:

```text
Daily Student News
```

Metrics:

```text
Likes: 16,400
Comments: 4,200
Shares: 8,300
```

Correct Verdict:

```text
MISLEADING
```

Manipulator Target:

```text
TRUE
```

---

# 80. Example Evidence Set

## Evidence E01

```text
Title:
Study Sample

Content:
The study involved only 42 students.

Type:
Research

Source:
Original Study
```

Reliable:

```text
YES
```

---

## Evidence E02

```text
Title:
Viral Headline

Content:
"AI users lose 40% of their memory."

Type:
News Article

Source:
Daily Student News
```

Misleading:

```text
YES
```

---

## Evidence E03

```text
Title:
Original Finding

Content:
Participants using AI performed
40% worse on one specific recall task.

Type:
Research

Source:
Original Study
```

Reliable:

```text
YES
```

---

## Evidence E04

```text
Title:
Student Comment

Content:
"Everyone knows AI makes your brain lazy."

Type:
Social Post

Source:
Anonymous Student
```

Reliable:

```text
NO
```

---

## Evidence E05

```text
Title:
Research Context

Content:
The researchers warned that the
results should not be generalized
beyond this experiment.

Type:
Research

Source:
Original Study
```

Reliable:

```text
YES
```

---

## Evidence E06

```text
Title:
Article Popularity

Content:
The article has more than 8,000 shares.

Type:
Statistic

Source:
Social Platform
```

Important:

```text
Popularity does not prove accuracy.
```

---

## Evidence E07

```text
Title:
Author Information

Content:
The news article does not link
to the original paper.

Type:
News Article

Source:
Daily Student News
```

Verification Result:

```text
Original research source not linked.
```

---

# 81. Example Final Explanation

Correct Verdict:

```text
MISLEADING
```

Explanation:

```text
The study may contain a real result showing
a 40% difference on one specific recall task.

However, the viral headline converts that
limited experimental result into the much
broader claim that AI causes students to lose
40% of their overall memory ability.

The headline removes important context and
overgeneralizes the original research result.
```

---

# 82. Main UI Pages

## Home Page

```text
VIRAL

[ JOIN GAME ]

Name
[____________]

Room Code
[____]

[ JOIN ]


HOST

[ CREATE ROOM ]
```

---

## Lobby Page

```text
ROOM

A7X9

Players

31 / 35

Quan
Minh
Lan
Duc
...

Waiting for Host...
```

---

## Host Page

```text
VIRAL

ROOM CODE

A7X9

Players
35 / 35

[ START GAME ]
```

During match:

```text
Current Phase:
DISCUSSION

Time:
04:32

Connected:
34 / 35
```

---

## Game Page

Recommended layout:

```text
┌────────────────────────────┐
│ VIRAL          08:42       │
│ Discussion                 │
├────────────────────────────┤
│ YOUR ROLE                  │
│ 🔎 FACT CHECKER            │
├────────────────────────────┤
│ YOUR EVIDENCE              │
│                            │
│ Study Sample               │
│ The study included         │
│ 42 students.               │
│                            │
│ [VERIFY] [SHARE]           │
├────────────────────────────┤
│ PUBLIC EVIDENCE            │
│ ...                        │
├────────────────────────────┤
│ CHAT                       │
│ ...                        │
├────────────────────────────┤
│ EVIDENCE | CHAT | VOTE     │
└────────────────────────────┘
```

Must be mobile-friendly.

---

# 83. Responsive Requirements

The game must work on:

```text
Mobile phones
Tablets
Laptops
Desktop browser
```

Primary target:

```text
Mobile portrait mode
```

Minimum recommended viewport:

```text
320px width
```

Buttons must be easy to tap.

---

# 84. Error Handling

Frontend should display clear messages.

Examples:

```text
Room does not exist.
```

```text
Room is already full.
```

```text
Game has already started.
```

```text
That name is already being used.
```

```text
Unable to connect to server.
Trying to reconnect...
```

```text
You cannot use this ability right now.
```

---

# 85. Non-Functional Requirements

## Concurrent Players

At least:

```text
35 players / room
```

## Realtime Response Target

Normal action response:

```text
< 500 ms
```

## Chat Delivery

Target:

```text
< 1 second
```

## Timer Difference

Visible timer difference between clients:

```text
< 1 second
```

## Fault Tolerance

One disconnected player must not stop the game.

---

# 86. Suggested Backend API/Hub Responsibilities

## RoomService

Responsible for:

- create room;
- find room;
- join room;
- leave room;
- room validation;
- reconnect player.

## RoleService

Responsible for:

- shuffle players;
- assign roles;
- initialize role tokens.

## EvidenceService

Responsible for:

- assign evidence;
- share evidence;
- verify evidence;
- boost evidence.

## VoteService

Responsible for:

- submit Initial Vote;
- submit Final Vote;
- calculate percentages;
- determine majority.

## GameService

Responsible for:

- start match;
- select scenario;
- calculate final result;
- create result summary.

## GameStateMachine

Responsible for:

- timer;
- phase transitions;
- automatic progression.

---

# 87. Suggested Frontend State

`GameContext` may contain:

```javascript
{
  roomCode,
  player,
  players,
  currentPhase,
  phaseEndsAt,
  scenario,
  role,
  privateEvidence,
  publicEvidence,
  chatMessages,
  initialVoteResult,
  finalResult,
  connectionStatus
}
```

---

# 88. MVP Development Order

Implement in this order.

## Phase 1 — Project Setup

Backend:

```text
ASP.NET Core
SignalR
CORS
```

Frontend:

```text
React + Vite
SignalR client
React Router
```

Definition of Done:

```text
React connects successfully to GameHub.
```

---

## Phase 2 — Room System

Implement:

```text
Create Room
Join Room
Player List
Room Code
```

Definition of Done:

```text
3 browser tabs can join the same room.
```

---

## Phase 3 — Start Game

Implement:

```text
Host Start
Room Lock
Random Role Assignment
```

Definition of Done:

```text
Each browser receives only its own role.
```

---

## Phase 4 — GameStateMachine

Implement:

```text
RoleReveal
BreakingNews
InitialVote
Investigation
Discussion
FinalVote
Reveal
Result
```

Definition of Done:

```text
Game automatically moves through all phases.
```

---

## Phase 5 — Initial Vote

Implement:

```text
Submit vote
Vote lock
Vote statistics
```

Definition of Done:

```text
All players see correct percentages.
```

---

## Phase 6 — Evidence

Implement:

```text
Private evidence
Share evidence
Public evidence board
```

Definition of Done:

```text
Different players receive different evidence.
```

---

## Phase 7 — Public Chat

Implement:

```text
Send message
Receive message
Cooldown
```

Definition of Done:

```text
All players receive room chat in real time.
```

---

## Phase 8 — Fact Checker

Implement:

```text
VerifyTokens = 2
VERIFY
```

Definition of Done:

```text
Only Fact Checker can successfully verify.
```

---

## Phase 9 — Manipulator

Implement:

```text
BoostTokens = 2
BOOST
```

Definition of Done:

```text
Only Manipulator can boost public evidence.
```

---

## Phase 10 — Final Vote

Implement:

```text
Final voting
Vote lock
Majority calculation
```

---

## Phase 11 — Reveal & Result

Implement:

```text
Correct answer
Explanation
Winning side
Manipulator reveal
Fact Checker reveal
Initial vs Final statistics
```

---

## Phase 12 — Reconnect

Implement:

```text
SessionToken
Automatic SignalR reconnect
Restore player state
```

---

## Phase 13 — UI Polish

Only after the game works.

Implement:

- responsive layout;
- loading state;
- animation;
- countdown warning;
- Breaking News visual effect;
- role reveal animation;
- sound effects;
- mobile optimization.

---

# 89. MVP Definition of Done

The MVP is complete when this flow works:

```text
Host Creates Room
        ↓
35 Players Join
        ↓
Host Starts Game
        ↓
Room Locks
        ↓
Secret Roles Assigned
        ↓
Breaking News Appears
        ↓
Initial Vote
        ↓
Vote Statistics Shown
        ↓
Private Evidence Assigned
        ↓
Players Investigate
        ↓
Players Share Evidence
        ↓
Public Discussion
        ↓
Fact Checkers Verify
        ↓
Manipulators Boost
        ↓
Final Vote
        ↓
Correct Answer Revealed
        ↓
Roles Revealed
        ↓
Initial vs Final Result
        ↓
Match Ends
```

After the Host presses `START GAME`:

```text
NO MANUAL HOST INTERACTION IS REQUIRED.
```

---

# 90. Core Product Rule

The game should not teach players:

> Find the liar.

The game should teach players:

> Evaluate the claim.

A Manipulator may say something true.

A normal User may accidentally spread something false.

A Fact Checker may misunderstand evidence.

Popularity does not prove accuracy.

Confidence does not prove accuracy.

The final gameplay message is:

> Determine what information deserves to be believed based on evidence, context, verification, and reasoning.
