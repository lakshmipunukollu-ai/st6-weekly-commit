# Story 6: Manager Dashboard

## Summary
Team roll-up view for managers to see all direct reports' weekly commits.

## Acceptance Criteria
- Manager sees all direct reports' commits for a given week
- Drill-down into individual commits
- Aggregated stats: completion rates, carry-forward counts
- Efficient queries using JOINs (no N+1)
- Supports managers with 10+ reports

## API Endpoints
- GET /api/commits/team/:managerId
