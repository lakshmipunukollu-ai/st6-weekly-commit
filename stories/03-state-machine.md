# Story 3: Commit State Machine

## Summary
Implement the core state machine: DRAFT → LOCKED → RECONCILING → RECONCILED → CARRIED_FORWARD.

## Acceptance Criteria
- State transitions validated: only valid transitions allowed
- Invalid transitions throw InvalidTransitionException
- Every transition logged in state_transition_log table
- Lock: DRAFT → LOCKED (no more edits)
- Start Reconciliation: LOCKED → RECONCILING
- Complete Reconciliation: RECONCILING → RECONCILED
- Carry Forward: RECONCILED → creates new DRAFT commit for next week

## API Endpoints
- PUT /api/commits/:id/lock
- POST /api/commits/:id/reconcile
- PUT /api/commits/:id/reconciled
- POST /api/commits/:id/carry-forward
