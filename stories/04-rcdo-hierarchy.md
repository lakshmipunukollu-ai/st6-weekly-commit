# Story 4: RCDO Hierarchy

## Summary
Implement Rally Cries, Defining Objectives, and Outcomes hierarchy. Allow linking commits to RCDO items.

## Acceptance Criteria
- CRUD for Rally Cries (RCDO tier 1)
- CRUD for Defining Objectives linked to Rally Cries (tier 2)
- CRUD for Outcomes linked to Defining Objectives (tier 3)
- Commits can be linked to any level of the RCDO hierarchy
- RCDOLinker component in the frontend

## API Endpoints
- GET /api/rcdo/rally-cries
- GET /api/rcdo/rally-cries/:id/objectives
- GET /api/rcdo/objectives/:id/outcomes
