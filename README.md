# ST6 Weekly Commit Module

A weekly work commitment tracking system where team members create, prioritize, and reconcile weekly commitments linked to the organizational RCDO hierarchy (Rally Cries, Defining Objectives, Outcomes). Managers get a roll-up dashboard of their team's progress.

## Architecture

- **Backend**: Spring Boot 3.2 (Java 21) with JWT authentication, PostgreSQL
- **Frontend**: React 19 + TypeScript with Vite, micro-frontend ready
- **Database**: PostgreSQL 15

## Ports

| Service  | Port |
|----------|------|
| Backend  | 8081 |
| Frontend | 5005 |
| Database | 5432 |

## Quick Start

### Prerequisites

- Java 21
- Node.js 20+
- PostgreSQL 15 with database `st6_weekly_commit`

### Setup

```bash
# Copy environment variables
cp .env.example .env

# Install frontend dependencies
cd frontend && npm install && cd ..

# Seed the database (creates sample users and RCDO data)
make seed

# Run in development mode
make dev
```

### Default Seed Users

| Email             | Password    | Role    |
|-------------------|-------------|---------|
| admin@st6.com     | admin123    | ADMIN   |
| manager@st6.com   | manager123  | MANAGER |
| alice@st6.com     | member123   | MEMBER  |
| bob@st6.com       | member123   | MEMBER  |

## Commands

| Command      | Description                              |
|--------------|------------------------------------------|
| `make dev`   | Start backend and frontend               |
| `make test`  | Run all tests (backend + frontend)       |
| `make seed`  | Seed database with sample data           |
| `make build` | Build backend JAR and frontend dist      |
| `make clean` | Clean build artifacts                    |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, returns JWT

### Commits
- `POST /api/commits` - Create new commit (DRAFT)
- `GET /api/commits/:id` - Get commit by ID
- `PUT /api/commits/:id` - Update commit (DRAFT only)
- `PUT /api/commits/:id/lock` - Lock commit
- `POST /api/commits/:id/reconcile` - Start reconciliation
- `PUT /api/commits/:id/reconciled` - Complete reconciliation
- `POST /api/commits/:id/carry-forward` - Carry forward to next week
- `GET /api/commits/week/:weekStart` - Get commits for a week
- `GET /api/commits/team/:managerId` - Manager team roll-up

### Commit Entries
- `POST /api/commits/:commitId/entries` - Add entry
- `PUT /api/commits/:commitId/entries/:entryId` - Update entry
- `DELETE /api/commits/:commitId/entries/:entryId` - Delete entry
- `PUT /api/commits/:commitId/entries/reorder` - Reorder entries

### RCDO Hierarchy
- `GET /api/rcdo/rally-cries` - List rally cries
- `GET /api/rcdo/rally-cries/:id/objectives` - List objectives
- `GET /api/rcdo/objectives/:id/outcomes` - List outcomes

### Reconciliation
- `POST /api/commits/:commitId/reconciliation` - Submit reconciliation
- `GET /api/commits/:commitId/reconciliation` - Get reconciliation data

### Health
- `GET /health` - Health check

## State Machine

```
DRAFT --> LOCKED --> RECONCILING --> RECONCILED --> CARRIED_FORWARD
```

All transitions are validated and logged in the state_transition_log table.

## Tests

32 total tests (19 backend + 13 frontend):
- State machine transition validation
- Health endpoint
- Authentication flows
- Commit CRUD and lifecycle
- Component rendering
- Auth context management

Run with: `make test`
