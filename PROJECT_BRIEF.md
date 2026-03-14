# PROJECT BRIEF
# (Extracted from MASTER_PROJECT_PLAYBOOK.md — your section only)

## SENIOR ENGINEER DECISIONS — READ FIRST

Before any code is written, here are the opinionated decisions made across all 9 projects
and why. An agent should never second-guess these unless given new information.

### Stack choices made
| Project | Backend | Frontend | DB | Deploy | Rationale |
|---------|---------|---------|-----|--------|-----------|
| FSP Scheduler | TypeScript + Node.js | React + TypeScript | PostgreSQL (multi-tenant) | Azure Container Apps | TS chosen over C# — same Azure ecosystem, better AI library support, faster iteration |
| Replicated | Python + FastAPI | Next.js 14 | PostgreSQL + S3 | Docker | Python wins for LLM tooling; Next.js for real-time streaming UI |
| ServiceCore | Node.js + Express | Angular (required) | PostgreSQL | Railway | Angular required — clean REST API behind it |
| Zapier | Python + FastAPI | None (API only + optional React dashboard) | PostgreSQL + Redis | Railway | Redis for event queue durability; Python for DX-first API |
| ST6 | Java 21 + Spring Boot | TypeScript micro-frontend (React) | PostgreSQL | Docker | Java required — Spring Boot is the senior choice; React micro-frontend mounts into PA host |
| ZeroPath | Python + FastAPI | React + TypeScript | PostgreSQL | Render | Python for LLM scanning logic; React for triage dashboard |
| Medbridge | Python + FastAPI + LangGraph | None (webhook-driven) | PostgreSQL | Railway | LangGraph is the correct tool for state-machine AI agents |
| CompanyCam | Python + FastAPI | React + TypeScript | PostgreSQL | Render | Python for CV/ML inference; React for annotation UI |
| Upstream | Django + DRF | React + TypeScript | PostgreSQL | Render | Django for rapid e-commerce scaffolding; built-in admin is a bonus |

### The 4 shared modules — build these FIRST
These are the highest ROI pieces of work. Build them once, copy-scaffold into every project.

1. `shared/llm_client.py` — Claude API wrapper with retry, streaming, structured output parsing
2. `shared/auth/` — JWT auth + role-based guards (Python + TypeScript versions)
3. `shared/state_machine.py` — Generic FSM: states, transitions, guards, event log
4. `shared/queue/` — Job queue pattern: enqueue, dequeue, ack, retry (Redis + Postgres fallback)

### Build order (wave system)
**Wave 0 (Day 1):** Build shared modules. All other waves depend on these.
**Wave 1 (Days 2-3):** Zapier + ZeroPath — establish LLM pipeline + REST API patterns
**Wave 2 (Days 4-5):** Medbridge + Replicated — LLM pipeline variants, more complex AI
**Wave 3 (Days 6-8):** FSP + ST6 — complex business logic, approval flows
**Wave 4 (Days 9-11):** ServiceCore + Upstream + CompanyCam — isolated stacks, finish strong

---

## PROJECT 5: ST6 — WEEKLY COMMIT MODULE
**Company:** ST6 | **Stack:** TypeScript (strict) micro-frontend + Java 21 Spring Boot + PostgreSQL

### Company mission to impress
ST6 builds strategic planning software. Their product connects individual weekly work to
organizational goals (Rally Cries, Defining Objectives, Outcomes — RCDO hierarchy).
What will impress them: a rock-solid state machine, micro-frontend that integrates cleanly
into their PA host app using the PM remote pattern, and a UI that makes the RCDO hierarchy
feel natural and obvious. Performance matters — managers with 10+ reports will be watching
this render in real time.

### Architecture
```
Docker
├── backend (Java 21 + Spring Boot 3)
│   ├── POST /api/commits                    — create new commit (DRAFT)
│   ├── PUT  /api/commits/:id/lock           — DRAFT → LOCKED
│   ├── POST /api/commits/:id/reconcile      — LOCKED → RECONCILING
│   ├── PUT  /api/commits/:id/reconciled     — RECONCILING → RECONCILED
│   ├── POST /api/commits/:id/carry-forward  — → next week's DRAFT
│   ├── GET  /api/commits/team/:managerId    — manager dashboard roll-up
│   └── GET  /api/commits/week/:weekStart    — week view for all reports
└── micro-frontend (React + TypeScript strict, Vite + Module Federation)
    ├── CommitEntry          — CRUD interface for weekly commits
    ├── PriorityRanker       — drag-and-drop prioritization chess layer
    ├── ReconciliationView   — planned vs actual comparison
    ├── ManagerDashboard     — team roll-up with drill-down
    └── RCDOLinker           — connect commit to Rally Cry / DO / Outcome
```

### State machine — the technical core of this project
```java
// Java 21 with records and sealed interfaces — modern idiomatic Java
public sealed interface CommitState permits
    CommitState.Draft,
    CommitState.Locked,
    CommitState.Reconciling,
    CommitState.Reconciled,
    CommitState.CarriedForward {

    record Draft() implements CommitState {}
    record Locked() implements CommitState {}
    record Reconciling() implements CommitState {}
    record Reconciled(String actualOutcome, LocalDate reconciledAt) implements CommitState {}
    record CarriedForward(UUID originalCommitId) implements CommitState {}
}

public class CommitStateMachine {
    public CommitState transition(CommitState current, CommitEvent event) {
        return switch (current) {
            case Draft d -> switch (event) {
                case Lock l -> new Locked();
                default -> throw new InvalidTransitionException(current, event);
            };
            case Locked l -> switch (event) {
                case StartReconciliation sr -> new Reconciling();
                default -> throw new InvalidTransitionException(current, event);
            };
            case Reconciling r -> switch (event) {
                case CompleteReconciliation cr -> new Reconciled(cr.actualOutcome(), LocalDate.now());
                default -> throw new InvalidTransitionException(current, event);
            };
            case Reconciled r -> switch (event) {
                case CarryForward cf -> new CarriedForward(cf.originalId());
                default -> throw new InvalidTransitionException(current, event);
            };
            default -> throw new InvalidTransitionException(current, event);
        };
    }
}
```

### RCDO hierarchy linking — what makes this product unique
```typescript
// The whole point of ST6's product is connecting individual work to strategic goals
// This is what managers care about — make it feel effortless

interface Commit {
  id: string;
  weekStart: string;           // ISO date
  userId: string;
  state: CommitState;
  entries: CommitEntry[];
  rallyCryId?: string;         // RCDO tier 1
  definingObjectiveId?: string; // RCDO tier 2
  outcomeId?: string;          // RCDO tier 3
}

// The reconciliation view shows what was planned vs what actually happened
interface ReconciliationEntry {
  commitEntryId: string;
  planned: string;
  actual: string;
  completionStatus: 'completed' | 'partial' | 'not_started' | 'deprioritized';
  carryForward: boolean;  // should this move to next week?
  notes: string;
}
```

### Micro-frontend integration (PM remote pattern)
```typescript
// vite.config.ts — expose as a remote module
import federation from '@originjs/vite-plugin-federation';

export default {
  plugins: [
    federation({
      name: 'weekly-commit-module',
      filename: 'remoteEntry.js',
      exposes: {
        './WeeklyCommit': './src/WeeklyCommit.tsx',
        './ManagerDashboard': './src/ManagerDashboard.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};

// The host app imports like this:
// const WeeklyCommit = React.lazy(() => import('weeklyCommit/WeeklyCommit'));
```

### CLAUDE.md for ST6 agent
```
You are a senior Java 21 + TypeScript engineer building the Weekly Commit Module for ST6.

COMPANY MISSION: Help organizations connect individual weekly work to strategic goals.
The RCDO hierarchy (Rally Cries → Defining Objectives → Outcomes) is their core model.
Every commit should visually connect to this hierarchy — that's the product's entire value.

STATE MACHINE IS THE CORE: DRAFT → LOCKED → RECONCILING → RECONCILED → CarryForward
Use Java sealed interfaces + records for the state machine. This is modern, idiomatic Java 21.
Every state transition must be logged. Invalid transitions must throw, not silently fail.

MICRO-FRONTEND: Use Vite Module Federation. Expose WeeklyCommit and ManagerDashboard
as remote modules that mount into the PA host app. Test in isolation AND mounted.

PERFORMANCE: Manager dashboard shows all reports' commits simultaneously.
Queries must be efficient — no N+1. Use JOIN + aggregation, not lazy loading.

NEVER: Mutable state in the state machine, skip RCDO linking in the data model
ALWAYS: Optimistic UI updates, manager roll-up uses real aggregation queries
```

---


## SHARED MODULES — BUILD THESE IN WAVE 0

### shared/llm_client.py
```python
"""
Shared Claude API client. Used by: Replicated, ZeroPath, Medbridge, CompanyCam, FSP, Upstream.
Copy this file into each Python project that needs it.
"""
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential
import json

client = anthropic.Anthropic()

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def complete(
    prompt: str,
    system: str = "",
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 4096,
    as_json: bool = False,
) -> str | dict:
    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text
    if as_json:
        # Strip markdown fences if present
        clean = text.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(clean)
    return text

async def analyze_image(
    image_b64: str,
    prompt: str,
    system: str = "",
    model: str = "claude-sonnet-4-20250514",
) -> dict:
    message = client.messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64}},
                {"type": "text", "text": prompt},
            ],
        }],
    )
    return json.loads(message.content[0].text)
```

### shared/auth.py (Python version)
```python
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(user_id: str, role: str) -> str:
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
        SECRET_KEY, algorithm=ALGORITHM
    )

def require_role(*roles: str):
    def dependency(token: str = Depends(oauth2_scheme)):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("role") not in roles:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    return dependency

# Usage: @router.get("/admin", dependencies=[Depends(require_role("admin", "manager"))])
```

### shared/state_machine.py
```python
from dataclasses import dataclass
from typing import Generic, TypeVar, Callable
from datetime import datetime

S = TypeVar('S')  # State type
E = TypeVar('E')  # Event type

@dataclass
class Transition(Generic[S, E]):
    from_state: S
    event: E
    to_state: S
    guard: Callable | None = None  # optional condition function

class StateMachine(Generic[S, E]):
    def __init__(self, initial: S, transitions: list[Transition]):
        self.state = initial
        self._transitions = {(t.from_state, t.event): t for t in transitions}
        self._log: list[dict] = []

    def transition(self, event: E, context: dict = None) -> S:
        key = (self.state, event)
        t = self._transitions.get(key)
        if not t:
            raise ValueError(f"Invalid transition: {self.state} + {event}")
        if t.guard and not t.guard(context or {}):
            raise ValueError(f"Guard failed: {self.state} + {event}")
        prev = self.state
        self.state = t.to_state
        self._log.append({"from": prev, "event": event, "to": self.state, "at": datetime.utcnow().isoformat()})
        return self.state

    @property
    def history(self) -> list[dict]:
        return self._log.copy()
```

---
