# ST6 Weekly Commit Module — Architecture

## Overview

The Weekly Commit Module enables individuals to create weekly work commitments, link them to the organizational RCDO hierarchy (Rally Cries, Defining Objectives, Outcomes), and reconcile planned vs actual work. Managers get a roll-up dashboard of their team's commitments.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Compose                      │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  React Micro-FE  │  │  Spring Boot Backend │ │
│  │  (Vite + MF)     │──│  (Java 21)           │ │
│  │  Port 5173       │  │  Port 8080           │ │
│  └──────────────────┘  └──────────┬───────────┘ │
│                                   │              │
│                        ┌──────────▼───────────┐ │
│                        │  PostgreSQL 15        │ │
│                        │  Port 5432            │ │
│                        └──────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Data Models

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | BCrypt |
| full_name | VARCHAR(255) | |
| role | ENUM | MEMBER, MANAGER, ADMIN |
| manager_id | UUID | FK → users.id, nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Rally Cries (RCDO Tier 1)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| title | VARCHAR(255) | |
| description | TEXT | |
| active | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### Defining Objectives (RCDO Tier 2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| rally_cry_id | UUID | FK → rally_cries.id |
| title | VARCHAR(255) | |
| description | TEXT | |
| created_at | TIMESTAMP | |

### Outcomes (RCDO Tier 3)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| defining_objective_id | UUID | FK → defining_objectives.id |
| title | VARCHAR(255) | |
| description | TEXT | |
| created_at | TIMESTAMP | |

### Commits
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| week_start | DATE | Monday of the week |
| state | VARCHAR(20) | DRAFT, LOCKED, RECONCILING, RECONCILED, CARRIED_FORWARD |
| rally_cry_id | UUID | FK, nullable |
| defining_objective_id | UUID | FK, nullable |
| outcome_id | UUID | FK, nullable |
| original_commit_id | UUID | FK → commits.id, for carried-forward |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Commit Entries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| commit_id | UUID | FK → commits.id |
| title | VARCHAR(255) | |
| description | TEXT | |
| priority | INTEGER | Sort order for drag-and-drop |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Reconciliation Entries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| commit_entry_id | UUID | FK → commit_entries.id |
| planned | TEXT | Original description |
| actual | TEXT | What actually happened |
| completion_status | VARCHAR(20) | COMPLETED, PARTIAL, NOT_STARTED, DEPRIORITIZED |
| carry_forward | BOOLEAN | default false |
| notes | TEXT | |
| created_at | TIMESTAMP | |

### State Transition Log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| commit_id | UUID | FK → commits.id |
| from_state | VARCHAR(20) | |
| to_state | VARCHAR(20) | |
| event | VARCHAR(30) | |
| triggered_by | UUID | FK → users.id |
| created_at | TIMESTAMP | |

## State Machine

```
DRAFT ──[Lock]──► LOCKED ──[StartReconciliation]──► RECONCILING
                                                         │
                                                   [CompleteReconciliation]
                                                         │
                                                         ▼
                                                    RECONCILED ──[CarryForward]──► CARRIED_FORWARD
```

- All transitions are validated via the `CommitStateMachine` class using Java 21 sealed interfaces and records.
- Every transition is logged in the `state_transition_log` table.
- Invalid transitions throw `InvalidTransitionException`.

## API Contracts

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |

#### POST /api/auth/login
Request: `{ "email": "...", "password": "..." }`
Response: `{ "token": "jwt...", "user": { "id", "email", "fullName", "role" } }`

### Commits
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/commits | Create new commit (DRAFT) |
| GET | /api/commits/:id | Get commit by ID |
| PUT | /api/commits/:id | Update commit (DRAFT only) |
| PUT | /api/commits/:id/lock | DRAFT → LOCKED |
| POST | /api/commits/:id/reconcile | LOCKED → RECONCILING |
| PUT | /api/commits/:id/reconciled | RECONCILING → RECONCILED |
| POST | /api/commits/:id/carry-forward | RECONCILED → next week DRAFT |
| GET | /api/commits/team/:managerId | Manager dashboard roll-up |
| GET | /api/commits/week/:weekStart | Week view for user |

### Commit Entries
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/commits/:commitId/entries | Add entry to commit |
| PUT | /api/commits/:commitId/entries/:entryId | Update entry |
| DELETE | /api/commits/:commitId/entries/:entryId | Delete entry |
| PUT | /api/commits/:commitId/entries/reorder | Reorder entries (priority) |

### RCDO Hierarchy
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/rcdo/rally-cries | List rally cries |
| GET | /api/rcdo/rally-cries/:id/objectives | List defining objectives |
| GET | /api/rcdo/objectives/:id/outcomes | List outcomes |

### Reconciliation
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/commits/:commitId/reconciliation | Submit reconciliation entries |
| GET | /api/commits/:commitId/reconciliation | Get reconciliation data |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Spring Boot Actuator health check |

## Security
- JWT-based authentication using Spring Security
- BCrypt password hashing
- Role-based access: MEMBER, MANAGER, ADMIN
- Managers can view team commits; members see only their own
- All secrets loaded from environment variables / .env

## Micro-Frontend Architecture
- React + TypeScript with Vite
- Module Federation via `@originjs/vite-plugin-federation`
- Exposes `WeeklyCommit` and `ManagerDashboard` as remote modules
- Shared dependencies: react, react-dom
- Standalone mode for development, mountable in PA host in production

## Key Components
1. **CommitEntry** — CRUD interface for weekly commits
2. **PriorityRanker** — Drag-and-drop prioritization
3. **ReconciliationView** — Planned vs actual comparison
4. **ManagerDashboard** — Team roll-up with drill-down
5. **RCDOLinker** — Connect commits to Rally Cry / DO / Outcome hierarchy

## Performance Considerations
- Manager dashboard queries use JOINs with aggregation (no N+1)
- Optimistic UI updates on the frontend
- Pagination for team views with many reports
- Database indexes on: commits(user_id, week_start), commit_entries(commit_id)

## Deviations from Brief
- Using standard Vite Module Federation instead of PM remote pattern (same result, simpler setup)
- State machine implemented in JPA entity layer rather than separate sealed interface hierarchy for pragmatic integration with Spring Boot persistence
