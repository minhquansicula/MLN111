# TRUTH RUSH — Game Requirements + UI/UX Specification

> **Individual-first web game about misinformation, critical thinking, and responsible sharing**

---

# 1. Product Vision

**TRUTH RUSH** is a short web game where each player independently investigates viral information, decides what evidence is worth checking, forms a final judgment, and chooses a responsible action.

The game is designed so that:

- 1 player can play alone.
- 5, 10, 20, or 35 students can all participate without changing gameplay.
- Players do not need to wait for each other.
- Players do not depend on chat, teams, or other players' actions.
- Classroom mode only adds statistics and leaderboard.
- A full run lasts about **12–15 minutes**.

Core principle:

> **Individual gameplay first. Classroom competition second.**

---

# 2. Learning Goals

The game should train four main abilities:

## 2.1 Recognition

Players learn to recognize:

- emotional headlines;
- suspicious sources;
- missing context;
- misleading wording;
- social proof pressure;
- overly confident claims.

## 2.2 Verification

Players learn to:

- check the source;
- check the author;
- read the original source;
- inspect statistics;
- compare multiple sources;
- inspect images or dates.

## 2.3 Reasoning

Players learn to:

- distinguish fact from interpretation;
- distinguish correlation from causation;
- recognize overgeneralization;
- change their opinion when stronger evidence appears;
- express appropriate uncertainty.

## 2.4 Responsibility

Players learn to choose between:

- `SHARE`
- `REPORT`
- `ADD_CONTEXT`
- `WAIT_FOR_MORE_EVIDENCE`

The game should not teach:

> "Viral information is always false."

It should teach:

> "The strength of your conclusion should match the quality of the evidence."

---

# 3. Platform and Technology

## 3.1 Primary Platform

Web browser.

Supported devices:

- Mobile
- Tablet
- Laptop
- Desktop

Primary UX target:

```text
Mobile Portrait
```

Recommended minimum viewport:

```text
320px width
```

---

## 3.2 MVP Technology

Frontend:

```text
React
Vite
JavaScript
CSS / Tailwind CSS optional
```

Game data:

```text
Static JSON / JS objects
```

Local persistence:

```text
localStorage
```

Backend:

```text
NOT REQUIRED for first playable MVP
```

---

## 3.3 Optional Classroom Backend

Add only after the solo game is complete.

Recommended:

```text
ASP.NET Core Web API
C#
```

Backend responsibilities:

- create class session;
- generate class code;
- receive player results;
- return classroom statistics;
- return leaderboard.

Realtime communication is **not required**.

No SignalR is needed for the individual-first version.

---

# 4. Core Gameplay Loop

```text
VIRAL POST
    ↓
INITIAL OPINION
    ↓
INVESTIGATION POINTS
    ↓
CHOOSE WHAT TO CHECK
    ↓
RECEIVE EVIDENCE
    ↓
FINAL VERDICT
    ↓
CONFIDENCE
    ↓
RESPONSIBLE ACTION
    ↓
TRUTH REVEAL
    ↓
SCORE + FEEDBACK
    ↓
NEXT CASE
```

---

# 5. Match Structure

Recommended:

```text
4 Cases
12–15 Minutes
```

Suggested pacing:

| Section | Duration |
|---|---:|
| Intro / Tutorial | 20–30 sec |
| Case 1 | 2–2.5 min |
| Case 2 | 2.5–3 min |
| Case 3 | 2.5–3 min |
| Case 4 | 3.5–4 min |
| Final Result | 1–2 min |

---

# 6. Case Progression

## Case 1 — Clickbait / Weak Source

Goal:

```text
Popularity does not equal credibility.
```

Difficulty:

```text
Easy
```

Investigation Points:

```text
3
```

---

## Case 2 — Misleading Statistics

Goal:

```text
Statistics need context.
```

Example:

```text
"Cases increased by 300%"

Actual:
1 → 4
```

Investigation Points:

```text
3
```

---

## Case 3 — Missing Context

Goal:

```text
Context can completely change meaning.
```

Possible mechanics:

- cropped screenshot;
- partial quote;
- missing date;
- incomplete statement.

Investigation Points:

```text
3
```

---

## Case 4 — Final Crisis

Goal:

```text
Combine multiple critical-thinking skills.
```

Possible manipulation:

- emotional headline;
- social proof;
- misleading number;
- cropped context;
- authority claim;
- partial truth;
- anonymous quote.

Investigation Points:

```text
4
```

Optional timer:

```text
90 seconds
```

---

# 7. Verdict Types

Use four verdicts:

```text
TRUE
FALSE
MISLEADING
NOT_ENOUGH_EVIDENCE
```

Example:

```javascript
export const Verdict = {
  TRUE: "TRUE",
  FALSE: "FALSE",
  MISLEADING: "MISLEADING",
  NOT_ENOUGH_EVIDENCE: "NOT_ENOUGH_EVIDENCE",
};
```

---

# 8. Viral Post

Each case begins with a social-media-style post.

Data:

```text
Headline
Body
Author
Source
Time
Like Count
Comment Count
Share Count
Optional Image
```

Example:

```text
🚨 BREAKING

New research proves that students
using AI lose 40% of their memory ability.

Daily Student News

❤️ 28.3K
💬 4.8K
🔁 14.2K
```

The social metrics may intentionally create pressure.

---

# 9. Initial Opinion

Prompt:

```text
WHAT'S YOUR FIRST IMPRESSION?
```

Choices:

```text
TRUE
FALSE
MISLEADING
NOT ENOUGH EVIDENCE
```

Rules:

- player chooses once;
- answer is saved;
- answer is not shown as correct/incorrect yet;
- it is compared with Final Verdict later.

Purpose:

```text
Measure first reaction before investigation.
```

---

# 10. Investigation Points

Each case gives limited:

```text
🔍 Investigation Points
```

Example:

```text
3 points
```

The player cannot inspect everything.

This forces prioritization.

---

# 11. Investigation Options

Possible checks:

```text
CHECK SOURCE
READ ORIGINAL
CHECK AUTHOR
CHECK COMMENTS
CHECK STATISTICS
SEARCH OTHER NEWS
CHECK IMAGE
CHECK DATE
```

Not every case needs every option.

---

# 12. Investigation Cost

Suggested cost:

| Action | Cost |
|---|---:|
| Check Source | 1 |
| Check Author | 1 |
| Check Comments | 1 |
| Check Statistics | 1 |
| Search Other News | 1 |
| Check Image | 1 |
| Check Date | 1 |
| Read Original | 2 |

Reason:

```text
READ ORIGINAL usually gives stronger evidence,
so it costs more.
```

---

# 13. Investigation Rules

A check is allowed when:

```text
RemainingPoints >= Cost
```

After check:

```text
RemainingPoints -= Cost
```

The same check cannot be repeated.

Checked items become:

```text
✓ Checked
```

---

# 14. Example Investigation Result

Player selects:

```text
CHECK SOURCE
```

Result:

```text
SOURCE CHECK

Website:
Daily Student News

Created:
2 months ago

Author:
Unknown

Original research linked:
NO

KEY OBSERVATION:
This is not the original research source.
```

Cost:

```text
-1 Investigation Point
```

---

# 15. Evidence Quality

Evidence can be:

```text
Strong
Moderate
Weak
Misleading
Incomplete
Contextual
```

Examples:

Strong:

```text
Original research paper
Official announcement
Primary source
```

Weak:

```text
Anonymous comment
Personal experience
Unverified screenshot
```

Misleading:

```text
True number presented without context
Quote missing important sentence
Old image reused for a new event
```

---

# 16. Comments Mechanic

Comments should feel persuasive but unreliable.

Example:

```text
🔥 Minh

"I use AI every day.
My memory definitely feels worse."

👍 2,381
```

```text
Lan

"This is scientific research.
Why are people still arguing?"

👍 1,902
```

```text
An

"Has anyone read the original study?"

👍 12
```

Learning idea:

```text
Likes do not prove truth.
Personal experience is not strong evidence.
```

---

# 17. Evidence Notebook

The player should have a simple:

```text
MY EVIDENCE
```

section.

Example:

```text
✓ Source does not link original paper
✓ Study sample = 42 students
✓ 40% refers to one specific recall test
```

Purpose:

- reduce memory burden;
- help player reason;
- avoid forcing manual note-taking.

---

# 18. Final Verdict

After investigation:

```text
YOU'VE SEEN THE EVIDENCE.

WHAT'S YOUR FINAL VERDICT?
```

Choices:

```text
TRUE
FALSE
MISLEADING
NOT ENOUGH EVIDENCE
```

Also display:

```text
Your first impression:
TRUE
```

Changing opinion must not be framed negatively.

---

# 19. Confidence

After Final Verdict:

```text
HOW SURE ARE YOU?
```

Recommended options:

```text
50%
60%
70%
80%
90%
100%
```

Use buttons instead of a small slider.

Helper text:

```text
Higher confidence gives a bigger bonus if correct
and a bigger penalty if wrong.
```

---

# 20. Responsible Action

Prompt:

```text
WHAT WOULD YOU DO NEXT?
```

Choices:

```text
📤 SHARE
🚩 REPORT
💬 ADD CONTEXT
⏳ WAIT FOR MORE EVIDENCE
```

The best action depends on the case.

Examples:

### Reliable information

```text
SHARE
```

### Clearly false harmful information

```text
REPORT
```

### True but misleading

```text
ADD CONTEXT
```

### Insufficient evidence

```text
WAIT FOR MORE EVIDENCE
```

---

# 21. Reveal

Reveal order:

```text
1. Lock answer
2. Brief suspense
3. Show correct verdict
4. Show score gained
5. Explain why
6. Show recommended action
7. Show important missed evidence
8. Show key lesson
```

Example:

```text
YOUR ANSWER:
MISLEADING

✓ CORRECT

+84 POINTS
```

---

# 22. Missed Evidence

After answer is locked:

```text
YOU DID NOT CHECK:
📄 ORIGINAL RESEARCH
```

Then show what it would have revealed.

Example:

```text
The study involved 42 students.

The 40% difference appeared only
in one specific recall task.
```

Goal:

> The player should feel that investigation choices mattered.

---

# 23. Short Feedback

Avoid long academic paragraphs.

Recommended:

```text
Correct Verdict:
MISLEADING

Why:
The headline takes one specific test result
and generalizes it to overall memory ability.

Best Check:
READ ORIGINAL

Recommended Action:
ADD CONTEXT
```

---

# 24. Scoring

Maximum:

```text
100 points per case
400 points per run
```

Recommended breakdown:

| Category | Max |
|---|---:|
| Accuracy | 40 |
| Investigation | 25 |
| Responsibility | 20 |
| Confidence | 10 |
| Adaptability | 5 |
| Total | 100 |

---

# 25. Accuracy Score

Example:

```text
Correct Final Verdict:
+40
```

Optional:

```text
Correct Initial Opinion:
small bonus only
```

The game should reward final reasoning more than first instinct.

---

# 26. Investigation Score

Reward high-value checks.

Example:

```text
Read original source:
+20

Check official source:
+15

Check relevant statistics:
+10

Check comments:
+2
```

The player should not be heavily punished for exploring weak evidence.

The lesson is:

```text
Some evidence is stronger than other evidence.
```

---

# 27. Adaptability Score

Reward:

```text
Initial wrong
→ Final correct
```

Example:

```text
+5 Adaptability
```

Condition:

```text
InitialVerdict != CorrectVerdict
AND
FinalVerdict == CorrectVerdict
```

This rewards evidence-based opinion change.

---

# 28. Confidence Score

Example:

Correct:

```text
50% → +0
60% → +2
70% → +4
80% → +6
90% → +8
100% → +10
```

Wrong:

```text
50% → -3
60% → -5
70% → -7
80% → -10
90% → -15
100% → -20
```

Goal:

```text
Reward calibrated confidence.
```

---

# 29. Responsibility Score

Example:

```text
Best Action:
+20

Reasonable Action:
+10

Poor Action:
0
```

---

# 30. Combo / Streak

Optional engagement mechanic.

Example:

```text
Strong Investigation
    ↓
Correct Verdict
    ↓
Correct Action
    ↓
🔥 CRITICAL THINKER COMBO x3
```

Do not let combo become more important than reasoning quality.

---

# 31. Final Result

Example:

```text
TRUTH RUSH COMPLETE

342 / 400
```

Skill breakdown:

```text
Accuracy        88
Investigation   76
Responsibility  92
Confidence      71
```

Also show:

```text
Initial Correct: 1 / 4
Final Correct:   4 / 4
Opinions Improved: 3
```

---

# 32. Optional Player Title

Examples:

```text
SOURCE HUNTER
CONTEXT DETECTIVE
CAREFUL SKEPTIC
EVIDENCE ANALYST
RESPONSIBLE SHARER
```

Avoid negative identity labels.

Do not use:

```text
GULLIBLE
BAD THINKER
LOW INTELLIGENCE
```

---

# 33. Solo Mode

Player enters:

```text
Name
```

then:

```text
START SOLO
```

No account required.

No class code required.

---

# 34. Classroom Mode

Optional.

Teacher creates:

```text
Class Session Code
```

Example:

```text
PHI101
```

Students enter:

```text
Name
Class Code
```

Then immediately start.

No waiting room.

No minimum player count.

---

# 35. Variable Class Size

The system should work with:

```text
1 player
5 players
7 players
18 players
23 players
35 players
```

No gameplay rule may depend on exact class size.

---

# 36. Classroom Results

After completing the game, submit:

```text
Player Name
Session Code
Total Score
Case Results
Initial Verdicts
Final Verdicts
```

Teacher dashboard can show:

```text
23 PLAYERS COMPLETED
```

No need for everyone to finish at the same time.

---

# 37. Classroom Analytics

Recommended:

```text
Players Completed
Average Score
Average Accuracy
Average Investigation Score
Average Responsibility Score
Initial vs Final Opinion
Most Used Investigation
Most Missed Strong Evidence
Responsible Action Distribution
```

---

# 38. Initial vs Final Class Opinion

Example:

```text
CASE 3
```

Before:

```text
TRUE          61%
FALSE         13%
MISLEADING    17%
UNKNOWN        9%
```

After:

```text
TRUE          13%
FALSE         17%
MISLEADING    65%
UNKNOWN        5%
```

This should be one of the main classroom visuals.

---

# 39. Leaderboard

Optional and secondary.

Example:

```text
1. Quan      352
2. Lan       341
3. Minh      330
```

Ranking priority:

```text
1. Accuracy
2. Investigation quality
3. Responsible action
4. Confidence calibration
5. Speed
```

Speed should have low weight.

---

# 40. Data Models

Suggested frontend models:

```text
GameSession
Case
ViralPost
InvestigationOption
Evidence
CaseProgress
GameResult
```

---

# 41. Case Model

```javascript
{
  id: "case_01",
  title: "AI and Memory",
  difficulty: "EASY",

  viralPost: {
    headline: "AI makes students lose 40% of memory ability",
    body: "A new study proves...",
    source: "Daily Student News",
    likes: 28300,
    comments: 4800,
    shares: 14200
  },

  investigationPoints: 3,

  investigationOptions: [],

  correctVerdict: "MISLEADING",

  recommendedAction: "ADD_CONTEXT",

  explanation: "...",

  lesson: "Read the original context before generalizing."
}
```

---

# 42. Investigation Option Model

```javascript
{
  id: "read_original",
  label: "Read Original",
  cost: 2,
  evidenceId: "ev_original_01"
}
```

---

# 43. Case Progress Model

```javascript
{
  caseId: "case_01",

  initialVerdict: null,

  remainingPoints: 3,

  usedInvestigations: [],

  discoveredEvidence: [],

  finalVerdict: null,

  confidence: null,

  responsibleAction: null,

  score: 0
}
```

---

# 44. Local Save

Use:

```text
localStorage
```

Store:

```text
Player Name
Class Code
Current Case
Current Case Progress
Completed Cases
Current Score
```

Purpose:

```text
Accidental refresh should not reset the game.
```

---

# 45. Suggested Routes

MVP:

```text
/
```

Home / Start.

```text
/play
```

Gameplay.

```text
/result
```

Final result.

Optional:

```text
/teacher
/teacher/session/:code
```

---

# 46. Suggested Frontend Structure

```text
src/
│
├── pages/
│   ├── HomePage.jsx
│   ├── GamePage.jsx
│   ├── ResultPage.jsx
│   └── TeacherPage.jsx
│
├── components/
│   ├── GameHeader.jsx
│   ├── ProgressBar.jsx
│   ├── ViralPostCard.jsx
│   ├── VerdictSelector.jsx
│   ├── InvestigationPanel.jsx
│   ├── InvestigationOption.jsx
│   ├── EvidenceSheet.jsx
│   ├── EvidenceNotebook.jsx
│   ├── ConfidenceSelector.jsx
│   ├── ResponsibleActionSelector.jsx
│   ├── RevealPanel.jsx
│   ├── ScoreBreakdown.jsx
│   └── ClassStats.jsx
│
├── data/
│   └── cases.js
│
├── context/
│   └── GameContext.jsx
│
├── hooks/
│   └── useGame.js
│
├── services/
│   ├── storageService.js
│   └── apiService.js
│
├── utils/
│   ├── scoring.js
│   └── gameRules.js
│
├── App.jsx
└── main.jsx
```

---

# 47. UI/UX Vision

The interface should feel like:

```text
Social Media Feed
+
Investigation Tool
+
Light Game-Show Pressure
```

It should **not** feel like:

```text
Online multiple-choice exam
```

Player fantasy:

> "I am investigating a viral post."

Not:

> "I am doing a quiz."

---

# 48. Visual Style

Recommended:

```text
Dark / neutral digital-news style
Clean card UI
Strong typography
One clear accent color
Readable mobile layout
```

Mood:

- modern;
- slightly tense;
- intelligent;
- clean;
- fast;
- social-media inspired.

Avoid:

- childish cartoon style;
- too many gradients;
- excessive neon;
- dense dashboards;
- tiny text;
- too many simultaneous panels.

---

# 49. Suggested Design Tokens

Example:

```css
:root {
  --bg: #0F1115;
  --surface: #171A21;
  --surface-2: #20242D;
  --text: #F5F7FA;
  --muted: #9AA4B2;

  --primary: #4F8CFF;
  --warning: #F4B740;
  --danger: #F05A67;
  --success: #38B77A;
  --info: #63B3ED;
}
```

Do not rely only on color.

Always combine color with:

- text;
- icons;
- labels.

---

# 50. Typography

Recommended:

```text
Inter
Manrope
Plus Jakarta Sans
```

Suggested sizes:

```text
Headline      24–28px
Section title 18–20px
Body          16–17px
Metadata      12–14px
```

Mobile body text:

```text
minimum ~16px
```

---

# 51. Home Screen UX

Goal:

```text
Start game within 10 seconds.
```

Wireframe:

```text
┌──────────────────────────────┐
│                              │
│         TRUTH RUSH           │
│   Think before you share.    │
│                              │
│  Your name                   │
│  [ Quan________________ ]    │
│                              │
│  Class code (optional)       │
│  [ PHI101______________ ]    │
│                              │
│  [      START GAME      ]    │
│                              │
│  ~15 min • 4 cases           │
│                              │
└──────────────────────────────┘
```

Behavior:

No class code:

```text
Solo Mode
```

With class code:

```text
Classroom Mode
```

---

# 52. Tutorial UX

Do not use a long tutorial.

Use 3 short cards:

```text
1. Read the viral post
2. Spend Investigation Points
3. Make your final decision
```

Then:

```text
START CASE 1
```

Target tutorial:

```text
20–30 seconds
```

---

# 53. Game Header UX

Sticky header:

```text
CASE 2 / 4            02:18
```

Below:

```text
🔍 Investigation Points: 2
```

Optional progress:

```text
██████░░░░
```

The player should always know:

- current case;
- remaining time;
- remaining points.

---

# 54. Viral Post UI

Social-media-like card:

```text
┌──────────────────────────────┐
│ Daily Student News      •••  │
│ 12 min ago                   │
│                              │
│ 🚨 BREAKING                  │
│                              │
│ AI makes students lose       │
│ 40% of memory ability.       │
│                              │
│ [        image         ]     │
│                              │
│ ❤️ 28.3K  💬 4.8K  🔁14.2K  │
└──────────────────────────────┘
```

Do not mix all investigation buttons directly inside the post.

Keep:

```text
Content
```

separate from:

```text
Actions
```

---

# 55. Initial Verdict UX

Use four large touch-friendly buttons.

```text
WHAT'S YOUR FIRST IMPRESSION?

[ TRUE ]

[ FALSE ]

[ MISLEADING ]

[ NOT ENOUGH EVIDENCE ]
```

Recommended:

```text
tap → immediately save → move to investigation
```

No extra confirmation modal.

---

# 56. Investigation Screen UX

Recommended mobile layout:

```text
CASE 2 / 4             🔍 3

┌───────────────────────────┐
│ Viral Post Summary        │
│                           │
│ "AI causes..."            │
│                           │
│ [ View full post ]        │
└───────────────────────────┘

WHAT DO YOU CHECK?

[ 🌐 Check Source        1 ]

[ 📄 Read Original       2 ]

[ 👤 Check Author        1 ]

[ 💬 Check Comments      1 ]

[ 📊 Check Statistics    1 ]

[ 📰 Search Other News   1 ]

[       FINISH CHECKING     ]
```

Every action clearly shows its cost.

---

# 57. Investigation Result UX

Use a bottom sheet or modal.

Example:

```text
┌──────────────────────────────┐
│ SOURCE CHECK                 │
│                              │
│ Daily Student News           │
│                              │
│ Created: 2 months ago        │
│ Author: Unknown              │
│ Original source: Not linked  │
│                              │
│ KEY OBSERVATION              │
│ This is not the original     │
│ research source.             │
│                              │
│ [ CLOSE ]                    │
└──────────────────────────────┘
```

After close:

```text
✓ Check Source
```

---

# 58. Evidence Notebook UX

Use a compact drawer or section:

```text
MY EVIDENCE
```

Example:

```text
✓ No original paper linked
✓ Study sample = 42
✓ 40% = one recall test
```

Avoid forcing manual note-taking.

---

# 59. Investigation Point Feedback

When player spends a point:

```text
🔍 3 → 2
```

Small floating feedback:

```text
-1 Point
```

Do not use a full-screen popup.

---

# 60. Timer UX

Cases 1–3:

```text
Soft pressure
```

Case 4:

```text
Strong pressure
```

Timer states:

```text
>30 sec    Normal
≤30 sec    Warning
≤10 sec    Urgent
```

Sound:

```text
one warning sound at 10 seconds
```

Avoid repeated loud countdown sounds.

---

# 61. Final Verdict UX

Example:

```text
YOU'VE SEEN THE EVIDENCE.

WHAT'S YOUR FINAL VERDICT?

Your first impression:
TRUE

[ TRUE ]
[ FALSE ]
[ MISLEADING ]
[ NOT ENOUGH EVIDENCE ]
```

Changing opinion should feel normal.

---

# 62. Confidence UX

Use large percentage buttons:

```text
HOW SURE ARE YOU?

[50] [60] [70] [80] [90] [100]
```

Selected:

```text
80%
```

Helper:

```text
Higher confidence means a larger
reward if correct and larger penalty if wrong.
```

---

# 63. Responsible Action UX

Use four cards:

```text
WHAT WOULD YOU DO NEXT?

┌──────────────┐
│ 📤 SHARE     │
│ Send it on   │
└──────────────┘

┌──────────────┐
│ 🚩 REPORT    │
│ Flag content │
└──────────────┘

┌──────────────┐
│ 💬 ADD       │
│ CONTEXT      │
└──────────────┘

┌──────────────┐
│ ⏳ WAIT      │
│ Need more    │
│ evidence     │
└──────────────┘
```

---

# 64. Reveal UX

Recommended sequence:

```text
Answer locked
    ↓
0.5–1 sec suspense
    ↓
Correct verdict
    ↓
Points gained
    ↓
Short explanation
    ↓
Missed evidence
```

Example:

```text
YOUR ANSWER

MISLEADING

✓ CORRECT

+84
```

---

# 65. Score Feedback UX

During case:

```text
+84
```

Then compact detail:

```text
Accuracy          +40
Investigation     +20
Responsibility    +20
Confidence         +4
```

Do not show excessive scoring math during investigation.

---

# 66. Case Transition UX

Example:

```text
CASE 2 COMPLETE

82 / 100

KEY LESSON:
Statistics need context.

[ NEXT CASE ]
```

Give the player a pause.

Do not instantly push into the next case.

---

# 67. Final Result UX

Example:

```text
TRUTH RUSH COMPLETE

342 / 400

Accuracy        88
Investigation   76
Responsibility  92
Confidence      71

You changed your opinion
after stronger evidence:

3 times

🏅 CONTEXT DETECTIVE
```

Actions:

```text
[ REVIEW CASES ]

[ CLASS RESULTS ]

[ PLAY AGAIN ]
```

Hide `CLASS RESULTS` in Solo Mode.

---

# 68. Classroom Results UX

Teacher/projector view:

```text
TRUTH RUSH
PHI101

23 players completed

AVERAGE SCORE
318 / 400
```

Then show:

```text
BEFORE INVESTIGATION

TRUE          61%
FALSE         13%
MISLEADING    17%
UNKNOWN        9%
```

vs:

```text
AFTER INVESTIGATION

TRUE          13%
FALSE         17%
MISLEADING    65%
UNKNOWN        5%
```

This is more important than leaderboard alone.

---

# 69. Leaderboard UX

Keep leaderboard secondary.

Example:

```text
TOP SCORES

1  Quan      352
2  Lan       341
3  Minh      330
```

Optional awards:

```text
BEST SOURCE CHECKER
MOST IMPROVED REASONING
MOST RESPONSIBLE SHARER
```

---

# 70. UX Rules

## Rule 1

One screen should have one main decision.

Avoid showing:

```text
Post + Investigation + Vote + Score
```

all at once.

---

## Rule 2

Always answer these four questions visually:

```text
Where am I?
What can I do?
What does it cost?
What happens next?
```

---

## Rule 3

Evidence should be short.

Target:

```text
2–5 short lines
```

---

## Rule 4

Never reveal the correct answer before Final Verdict.

---

## Rule 5

Feedback should evaluate decisions, not identity.

Never say:

```text
You are gullible.
You are a bad thinker.
```

Say:

```text
This choice relied on weak evidence.
```

---

# 71. Accessibility

Requirements:

- body text around 16px minimum on mobile;
- strong contrast;
- touch targets around 44px minimum;
- do not use color alone;
- verdicts always have text labels;
- important icons have labels;
- keyboard support on desktop;
- animations are optional, not required for understanding;
- no rapid flashing.

---

# 72. Optional Classroom API

Only add after solo gameplay works.

Suggested endpoints:

```text
POST /api/sessions
POST /api/sessions/{code}/join
POST /api/sessions/{code}/results
GET  /api/sessions/{code}/stats
GET  /api/sessions/{code}/leaderboard
```

---

# 73. Example Result Submission

```json
{
  "playerName": "Quan",
  "totalScore": 342,
  "caseResults": [
    {
      "caseId": "case_01",
      "initialVerdict": "TRUE",
      "finalVerdict": "MISLEADING",
      "confidence": 80,
      "responsibleAction": "ADD_CONTEXT",
      "score": 84
    }
  ]
}
```

---

# 74. MVP Development Order

## Phase 1 — React Prototype

Build:

```text
Home
Case 1
Initial Opinion
Investigation
Final Verdict
Reveal
Result
```

Definition of Done:

```text
One player can complete one case.
```

---

## Phase 2 — Four Cases

Add all 4 case types.

Definition of Done:

```text
One player can play for ~12–15 minutes.
```

---

## Phase 3 — Scoring

Implement:

```text
Accuracy
Investigation
Responsibility
Confidence
Adaptability
```

---

## Phase 4 — Save Progress

Implement:

```text
localStorage
```

Definition of Done:

```text
Browser refresh does not destroy current run.
```

---

## Phase 5 — UI Polish

Add:

```text
Responsive mobile UI
Evidence sheets
Timers
Transitions
Score animations
Result screen
```

---

## Phase 6 — Classroom Backend

Only after Solo Mode is stable.

Implement:

```text
Create Session
Class Code
Submit Results
Class Stats
Leaderboard
```

---

# 75. MVP Definition of Done

The game is ready for classroom testing when:

```text
1 player opens the site
        ↓
enters a name
        ↓
starts immediately
        ↓
plays 4 cases
        ↓
makes initial judgments
        ↓
spends limited investigation points
        ↓
reads selected evidence
        ↓
makes final judgments
        ↓
selects confidence
        ↓
chooses responsible actions
        ↓
sees explanations
        ↓
receives final score
```

The game must be fully functional with:

```text
1 player
```

Classroom Mode must only add:

```text
Shared session
Statistics
Leaderboard
```

It must never be required for core gameplay.

---

# 76. Example MVP Case

## Case

```text
AI AND MEMORY
```

## Viral Post

```text
🚨 BREAKING

New research proves students who use
AI tools for studying lose 40% of
their memory ability.

Daily Student News

❤️ 28.3K
💬 4.8K
🔁 14.2K
```

Correct Verdict:

```text
MISLEADING
```

Recommended Action:

```text
ADD_CONTEXT
```

Investigation Points:

```text
3
```

Available:

```text
CHECK SOURCE      1
READ ORIGINAL     2
CHECK COMMENTS    1
CHECK STATISTICS  1
CHECK AUTHOR      1
```

### Check Source

```text
The article does not link
to the original research.
```

### Read Original

```text
The study involved 42 participants.

The reported 40% difference appeared
in one specific recall task.
```

### Check Comments

```text
Popular comments mostly contain
personal opinions rather than evidence.
```

### Check Statistics

```text
The 40% number refers to a specific
test result, not overall memory ability.
```

### Explanation

```text
The viral post takes a limited research result
and generalizes it into a claim about overall
memory ability.

Therefore the post is misleading.
```

---

# 77. Future Features

Only after the core game is stable:

- more cases;
- random case order;
- difficulty levels;
- teacher case selection;
- daily challenge;
- achievements;
- confidence chips;
- advanced streak system;
- image verification;
- deepfake cases;
- AI-generated practice cases;
- analytics dashboard;
- case editor;
- database;
- authentication.

---

# 78. Final Product Principle

TRUTH RUSH should create this experience:

```text
"I saw a viral claim."
        ↓
"I had an immediate reaction."
        ↓
"I could not inspect everything."
        ↓
"I chose what evidence mattered."
        ↓
"I found conflicting information."
        ↓
"I reconsidered."
        ↓
"I made a final judgment."
        ↓
"I decided whether I should share it."
```

The central idea is:

> **Critical thinking is not about always being skeptical.**

It is about:

> **making judgments proportional to the quality of available evidence.**

---

# 79. One-Sentence MVP

If scope becomes too large, keep only this:

> A player sees four viral posts, spends limited Investigation Points to reveal evidence, makes a final verdict with confidence, chooses a responsible action, and receives feedback showing whether their reasoning improved.
