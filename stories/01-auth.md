# Story 1: Authentication & User Management

## Summary
Implement JWT-based authentication with user registration, login, and role-based access control.

## Acceptance Criteria
- Users can register with email, password, full name
- Users can login and receive a JWT token
- Three roles: MEMBER, MANAGER, ADMIN
- Manager-member relationship tracked via manager_id
- BCrypt password hashing
- JWT tokens expire after 24 hours
- Protected endpoints require valid JWT

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login

## Data Model
- Users table with id, email, password_hash, full_name, role, manager_id
