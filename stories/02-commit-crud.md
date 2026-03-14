# Story 2: Commit CRUD Operations

## Summary
Create, read, update weekly commits with entries and priority ordering.

## Acceptance Criteria
- Create a new commit for a given week (always starts as DRAFT)
- Add/update/delete commit entries
- Reorder entries via priority field (drag-and-drop support)
- Only DRAFT commits can be edited
- View commits by week

## API Endpoints
- POST /api/commits
- GET /api/commits/:id
- PUT /api/commits/:id
- POST /api/commits/:commitId/entries
- PUT /api/commits/:commitId/entries/:entryId
- DELETE /api/commits/:commitId/entries/:entryId
- PUT /api/commits/:commitId/entries/reorder
- GET /api/commits/week/:weekStart
