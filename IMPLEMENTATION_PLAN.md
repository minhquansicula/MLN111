# VIRAL implementation plan

## Scope
React + Vite + JavaScript frontend; ASP.NET Core 9 + SignalR backend; in-memory rooms; 35 players plus host; no registration.

## Delivery milestones
- [x] Backend: authenticated room sessions, lobby, role/evidence assignment, per-room concurrency control.
- [x] Automatic state machine, server deadlines, initial/final votes, cancellation and cleanup.
- [x] Private/public evidence, verify, boost, chat, reconnect, reveal and statistics.
- [x] Responsive Vietnamese frontend and projector-friendly host view.
- [x] Integration tests with 35 SignalR clients, race conditions, reconnect and hidden-data checks.
- [x] Production build and local launch documentation.

## Product decisions
- Production requires 35 players; Development requires 3. Host is separate.
- Roles: 25/5/5 at 35; one of each at 3. Intermediate rooms use floor(n/7), minimum one special role each.
- 7 fictional teaching evidence cards are evenly shuffled; duplicate evidence appears once on the public board, with all sharers credited.
- Evidence is assigned internally at Start but exposed only at Investigation.
- Share/Verify allowed in Investigation and Discussion. Boost only in Discussion. Chat only in Discussion.
- Own-card verification stays private until shared. Public-card verification is public. Repeated verification has no cost.
- Highest unique vote count determines the class verdict (plurality). Ties, zero votes, and a leading verdict matching neither side produce DRAW.
- Vote percentages use all assigned players; NO_VOTE is separate. Changed opinion counts only players who submitted both votes and changed verdict.
- 30/45/30/180/360/30/150/75 second timed phases = 15 minutes, then Finished.
- Scenario is explicitly fictional; it is not a claim about real research.
- One server instance, RAM-only state. Restart loses active rooms. Finished rooms expire after 1 hour; inactive lobby after 2 hours.
- Reconnect restores host/player session; newest connection replaces previous one. A disconnected player retains their place and game continues.

## Verification
Build both projects. Run automated gameplay integration against real SignalR, including 35 clients, authorization, data privacy, votes, evidence, tokens, chat cooldown, reconnection, result calculation, emergency end and automatic finish. Inspect the actual mobile and desktop UI.
