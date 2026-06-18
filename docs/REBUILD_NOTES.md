# Rebuild Notes

## Original issue

The original prototype had a good product idea but relied on a single large backend file, unauthenticated API routes, open CORS and JSON storage without access control.

## Rebuilt architecture

The rebuilt MVP now has:

- Dedicated route modules.
- Authentication middleware.
- Role-based authorization.
- Service layer for AI, auditing and seeding.
- Repository layer over JSON storage.
- Atomic JSON writes.
- Approval-first message workflow.
- Pastoral care access restrictions.

## Security improvements included

- Bearer token authentication using HMAC-signed tokens.
- PBKDF2 password hashing with salt.
- Security headers.
- Origin guard.
- Rate limiting.
- Role permissions.
- Audit logs.

## What is intentionally not included yet

- Full PostgreSQL/Supabase migration.
- Production email/password reset.
- Real WhatsApp Business API sending.
- Payment gateway webhooks.
- Multi-branch SaaS tenancy.
- Row-level security.

These should be Phase 2 / Phase 3 items.
