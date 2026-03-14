# Story 5: Reconciliation

## Summary
Compare planned vs actual work at week's end. Support carry-forward of incomplete items.

## Acceptance Criteria
- When commit is in RECONCILING state, user fills in actual outcomes
- Each entry gets a completion status: completed, partial, not_started, deprioritized
- Entries can be marked for carry-forward to next week
- Completing reconciliation transitions to RECONCILED state
- ReconciliationView component shows side-by-side planned vs actual

## API Endpoints
- POST /api/commits/:commitId/reconciliation
- GET /api/commits/:commitId/reconciliation
