# DevRank - Visual Architecture & Explanations

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (User Facing)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Developer   │  │  Recruiter   │  │    Admin     │          │
│  │   Portal     │  │  Dashboard   │  │    Panel     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────┬────────────────────┬────────────────────────┬──────────┘
         │                    │                        │
         └────────────────────┼────────────────────────┘
                              │ HTTP/REST
┌──────────────────────────────▼──────────────────────────────────┐
│                      BACKEND API (Node.js/Express)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Authentication (JWT)  │  Auth Controller               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⭐ Profile Verification Service                        │   │
│  │  - GitHub Verifier (REST API)                           │   │
│  │  - LeetCode Verifier (GraphQL)                          │   │
│  │  - HackerRank/CodeChef Verifier (Scraping)              │   │
│  │  - Code generation & validation logic                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Profile Data Service                                   │   │
│  │  - Fetch data from 10+ platforms                        │   │
│  │  - Normalize data formats                               │   │
│  │  - Rate limit handling & retries                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Talent Score Engine                                    │   │
│  │  - Weighted calculation across platforms                │   │
│  │  - Percentile-based ranking                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Controllers                                             │   │
│  │  - externalProfileController                            │   │
│  │  - userController, dashboardController, etc.            │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────┬──────────────────────┬───────────┘
           │                  │                      │
           │ External API     │ Database             │ Cache
           │ Calls            │ Queries              │ Queries
           │                  │                      │
    ┌──────▼───────┐  ┌───────▼─────────┐   ┌──────▼──────┐
    │  EXTERNAL    │  │   MongoDB       │   │    Redis    │
    │  PLATFORMS   │  │   Atlas         │   │   (Cache)   │
    │              │  │                 │   │             │
    │ • GitHub     │  │ • Users         │   │ • Rankings  │
    │ • LeetCode   │  │ • Profiles      │   │ • Profile   │
    │ • CodeChef   │  │ • Rankings      │   │   Data      │
    │ • Codeforces │  │ • Verified      │   │             │
    │ • HackerRank │  │   Status        │   │ TTL: 1hr    │
    │ • LinkedIn   │  │ • Audit Trail   │   │             │
    │ • 4+ more    │  │                 │   │             │
    └──────────────┘  └─────────────────┘   └─────────────┘

    ┌─────────────────────────────────────────────────────┐
    │  Background Jobs / Scheduled Tasks (Cron)           │
    │  - Daily data refresh for all platforms             │
    │  - Talent score recalculation (hourly)              │
    │  - Profile re-verification checks (weekly)          │
    │  - Cleanup expired verification codes               │
    └─────────────────────────────────────────────────────┘
```

---

## Profile Verification Flow (Whiteboard Drawing)

```
Developer's Perspective:
────────────────────────

    START
      │
      ▼
┌─────────────────────┐
│ Click "Add GitHub"  │
│ Enter username      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ System generates code       │
│ Example: 583492             │
│ ⏰ Expires in 5 minutes    │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────┐
│ User adds to GitHub bio: │
│ "John - DevRank:583492"  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Click "Verify Profile"   │
└──────────┬───────────────┘
           │
           ▼
BACKEND ─────────────────────────────────────── GITHUB
         GET /api/users/john
         ↓
         Fetches GitHub profile
         ↓
     Checks if "583492" in bio
         ↓
         ✅ Found!
         ↓
         Marks as verified
         ↓
         Stores verifiedAt = timestamp
           │
           ▼
┌──────────────────────────┐
│ ✅ Profile Verified!     │
│ Show to recruiters       │
└──────────────────────────┘
```

---

## Recruiter Dashboard Flow

```
RECRUITER LOGIN
      │
      ▼
┌─────────────────────────────┐
│ Dashboard                   │
│ • Total Developers: 5,234   │
│ • New Today: 43             │
│ • Verified: 4,892 (93%)     │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Search & Filter                  │
│ • Skills: Java, Python, Go       │
│ • Talent Score: 800-1000         │
│ • Platforms: GitHub + LeetCode   │
│ • Recent Activity: Last 7 days   │
└──────────┬─────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Results (Sorted by Score)        │
│                                  │
│ 1. John Doe - Score: 945 ⭐⭐⭐  │
│    GitHub: 500 commits           │
│    LeetCode: 427 problems        │
│    Verified: ✅                  │
│    Recent: Fixed React bug (2d)  │
│    ┌──────────────────────────┐  │
│    │  👍 Shortlist            │  │
│    │  📊 View Details         │  │
│    │  💬 Send Message         │  │
│    └──────────────────────────┘  │
│                                  │
│ 2. Jane Smith - Score: 912       │
│    [Similar format]              │
│                                  │
│ 3. Mike Chen - Score: 891        │
│    [Similar format]              │
└──────────────────────────────────┘
```

---

## Data Flow Diagram

```
DEVELOPER ADDS PROFILE
        │
        ▼
[ExternalProfileController.addExternalProfile]
        │
        ├─→ Validate platform & username
        │
        ├─→ Generate 6-digit code
        │   Code stored in DB with 5min TTL
        │
        ├─→ Create ExternalProfile document
        │   {
        │     userId: "user123",
        │     platform: "github",
        │     username: "johndoe",
        │     verificationCode: "583492",
        │     isVerified: false,
        │     status: "pending_verification"
        │   }
        │
        └─→ Return code to user


DEVELOPER VERIFIES PROFILE
        │
        ▼
[ExternalProfileController.verifyExternalProfile]
        │
        ├─→ Retrieve stored code from DB
        │
        ├─→ Call ProfileVerificationService.verifyProfile(profile)
        │   │
        │   ├─→ If GitHub: Call RestAPI
        │   │       GET https://api.github.com/users/johndoe
        │   │       Check if code in bio
        │   │
        │   ├─→ If LeetCode: Call GraphQL API
        │   │       Query: {matchedUser(username) {profile {bio}}}
        │   │       Check if code in bio
        │   │
        │   └─→ If HackerRank: Manual verification
        │           (Return instruction to user)
        │
        ├─→ If verified: Update ExternalProfile
        │   {
        │     isVerified: true,
        │     verifiedAt: "2024-01-15T10:30:00Z",
        │     status: "verified"
        │   }
        │
        └─→ Return success


RECRUITER VIEWS PROFILE
        │
        ▼
[DashboardController.getDeveloperProfiles]
        │
        ├─→ Fetch Users with talentScore calculation
        │
        ├─→ Join with ExternalProfile collection
        │
        ├─→ Filter by isVerified=true (only show verified devs)
        │
        ├─→ Sort by talentScore DESC
        │
        └─→ Return rich developer profile with:
            • Name, bio, avatar
            • All verified profiles
            • Talent score breakdown
            • Recent activity
            • Shortlist button
```

---

## Talent Score Calculation

```
FORMULA:
────────
TalentScore = (GitHubCommits × 0.30)
            + (GitHubStars × 0.20)  
            + (LeetCodeSolved × 0.50)

EXAMPLE:
────────
Developer: John Doe

GitHub Commits: 1200  × 0.30 = 360 points
GitHub Stars:   450   × 0.20 = 90 points
LeetCode Solved: 250  × 0.50 = 125 points
                                ──────────
                        Total = 575 points (Percentile: 78%)


DYNAMIC UPDATES:
───────────────
When user refreshes profile:
  1. Fetch new stats from GitHub API
  2. Fetch new stats from LeetCode GraphQL
  3. Recalculate score instantly
  4. Compare with previous score
  5. Show improvement/decline to recruiter
  6. Update lastUpdated timestamp
```

---

## Error Handling & Fault Tolerance

```
RECOVERY STRATEGY
─────────────────

API Call Fails?
    │
    ├─→ GitHub returns 404 (user not found)
    │   └─→ Return error, user can re-enter username
    │
    ├─→ GitHub returns 429 (rate limited)
    │   ├─→ Wait 2^retry_count seconds (2s, 4s, 8s...)
    │   └─→ Retry up to 3 times
    │
    ├─→ GitHub times out (>10 seconds)
    │   ├─→ Cancel request
    │   ├─→ Show cached data if available
    │   └─→ Queue for background retry
    │
    └─→ Network error
        ├─→ Return last known good data
        ├─→ Tell user "Using cached data from 2 hours ago"
        └─→ Queue for background refresh

DATABASE Fails?
    │
    ├─→ MongoDB connection lost
    │   ├─→ Mongoose auto-reconnects (exponential backoff)
    │   ├─→ Queue operations in memory (up to limit)
    │   └─→ Wait for reconnection
    │
    └─→ MongoDB overloaded
        ├─→ Read replicas handle queries
        ├─→ Write cache buffers updates temporarily
        └─→ Auto-scale replica set

EXTERNAL API RATE LIMIT?
    │
    ├─→ GitHub: Use auth token (5000/hr vs 60/hr)
    ├─→ LeetCode: Throttle to 1 req/2 sec per user
    ├─→ CodeChef: Queue-based (1 user/10 sec)
    └─→ Cache aggressively (1 hour TTL)
```

---

## Technology Choice Justification (Visual)

```
WHY NODE.JS + EXPRESS?
──────────────────────
        
Project Needs:             What We Chose:
├─ Multiple APIs           ├─ Node.js (async/await)
├─ Stateless Auth          ├─ JWT (no server session)
├─ Serverless Deploy       ├─ Vercel (perfect fit)
├─ Real-time Updates       ├─ Event-driven design
└─ Fast Development        └─ 1 language full-stack

Alternative Analysis:
┌──────────────┬──────────────┬──────────────┐
│   Python     │   Java       │   Node.js    │
│   (Django)   │ (Spring Boot)│  (Express)   │
├──────────────┼──────────────┼──────────────┤
│ ✅ Great ML  │ ✅ Robust    │ ✅ Perfect   │
│ ❌ Slow      │ ❌ Overkill  │ ✅ Fast      │
│ ❌ Not       │ ❌ Memory    │ ✅ Native    │
│    serverless│    intensive │    async     │
└──────────────┴──────────────┴──────────────┘

CHOSEN: Node.js ✓


WHY MONGODB?
────────────

Schema Requirements:
├─ GitHub data format
│  └─ {commits: 500, languages: ['JS', 'Go']}
│
├─ LeetCode data format
│  └─ {solved: 250, submissions: 800, tags: ['DP', 'Tree']}
│
├─ HackerRank data format
│  └─ {challenges: 45, score: 3500}
│
└─ All different! Need flexible schema


Alternative Analysis:
┌──────────────┬──────────────┬──────────────┐
│ PostgreSQL   │   Firebase   │   MongoDB    │
├──────────────┼──────────────┼──────────────┤
│ ❌ Rigid     │ ✅ Easy      │ ✅ Flexible  │
│    schema    │ ❌ Vendor    │ ✅ Scaling   │
│ ❌ Poor      │    lock-in   │ ✅ Atlas     │
│    JSON      │ ❌ Limited   │    cloud     │
│ ✅ SQL       │    queries   │ ✅ GraphQL   │
│ ✅ ACID      │              │    support   │
└──────────────┴──────────────┴──────────────┘

CHOSEN: MongoDB ✓


WHY JWT?
────────

Authentication Flow:
     
Traditional (Session):         JWT (Stateless):
User Login                      User Login
    ↓                               ↓
Create Session                  Create JWT
    ↓                               ↓
Store in memory/DB              Send to client
    ↓                               ↓
Each request: check DB          Each request: verify signature
    ↓                               ↓
Issue: Sticky sessions          Advantage: Scales horizontally
Issue: Hard to scale            Works on Vercel serverless!
Issue: Session affinity         Can spread across servers
Issue: Cross-origin issues      Simple mobile support

CHOSEN: JWT ✓
```

---

## One-Page Technical Summary

| Component | Technology | Why | Alternative |
|-----------|-----------|-----|------------|
| **Language** | JavaScript (Node.js) | Async/await for APIs, single language, serverless-ready | Python, Java |
| **Framework** | Express.js | Lightweight, unopinionated, perfect for APIs | Fastify, Hapi |
| **Database** | MongoDB | Flexible schema for varied platform data | PostgreSQL |
| **Auth** | JWT | Stateless, serverless-friendly, scalable | OAuth, Sessions |
| **HTTP Client** | Axios | Better error handling than Fetch API | Node-fetch |
| **Hashing** | bcryptjs | Adaptive security, salted | SHA256 |
| **Security Headers** | Helmet.js | One-line defense against OWASP top 10 | Manual headers |
| **Rate Limiting** | express-rate-limit | Prevent brute force & API abuse | Manual middleware |
| **Deployment** | Vercel | Serverless, auto-scale, free tier | Heroku, AWS Lambda |

