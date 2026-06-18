# MyPastorAdmin — Secure Church Administration MVP

MyPastorAdmin is a rebuilt, safer ministry operations MVP for pastors, church administrators, fellowships, and prayer groups.

## What changed in this rebuild

This version applies the recommendations from the review:

- Added authentication with signed bearer tokens.
- Added role-based access control for pastor, admin, care, finance, media and department roles.
- Split the large server file into modular routes, middleware, services and repositories.
- Added security headers, origin guard and simple rate limiting.
- Added audit logging for sensitive actions.
- Kept JSON storage for demo portability, but upgraded writes to atomic file replacement.
- Added approval-first AI drafts instead of direct WhatsApp sending.
- Added restricted pastoral care records with urgency tagging.
- Added finance and evangelism modules.
- Updated versioning consistently to `3.0.0`.
- Added a clean responsive dashboard frontend with login.

## Default demo login

```text
Email: pastor@example.com
Password: ChangeMe123!
```

Change the default password and `JWT_SECRET` before using real data.

## Quick start

```bash
npm install
cp .env.example .env
npm start
```

Open:

```text
http://localhost:3000
```

## Environment variables

See `.env.example`.

Important production values:

```text
NODE_ENV=production
APP_ORIGIN=https://your-domain.com
JWT_SECRET=use-a-long-random-secret
SEED_DEMO=false
ANTHROPIC_API_KEY=optional-live-ai-key
```

## Recommended roles

| Role | Access |
|---|---|
| `pastor` | Full access |
| `super_admin` | Full operational access |
| `admin` | Members, events, prayer, messages and care creation |
| `care` | Pastoral care queue |
| `finance` | Finance records only |
| `media` | AI and message draft workflows |
| `department_lead` | Prayer/events/evangelism operational support |
| `viewer` | Read-only dashboard access where implemented |

## API summary

| Area | Endpoint |
|---|---|
| Auth | `/api/auth/login`, `/api/auth/me`, `/api/auth/users` |
| Dashboard | `/api/analytics` |
| Members | `/api/members` |
| Events | `/api/events` |
| Prayer rota | `/api/prayer`, `/api/prayer/generate` |
| Messages | `/api/messages`, `/api/messages/:id/approve` |
| AI drafts | `/api/ai/draft` |
| Pastoral care | `/api/care` |
| Finance | `/api/finance` |
| Evangelism | `/api/evangelism` |
| Settings | `/api/settings` |
| Health | `/api/health` |

## Data storage

This rebuild still uses JSON files so the project can run immediately without a database server. For real church/fellowship deployment, migrate to PostgreSQL/Supabase with row-level security.

Suggested production tables:

- users
- members
- departments
- events
- prayer_sessions
- messages
- counselling_requests
- transactions
- evangelism_contacts
- audit_logs

## Important safety note for pastoral care

The care module is for pastoral follow-up tracking only. It is not a professional counselling, therapy, medical or emergency response system. AI-generated care messages should be reviewed by a trained leader before being shared.

## Production hardening checklist

Before deployment with real people’s data:

1. Replace the default password.
2. Set a strong `JWT_SECRET`.
3. Use HTTPS only.
4. Set `NODE_ENV=production`.
5. Set `APP_ORIGIN` to the exact live frontend domain.
6. Move from JSON files to PostgreSQL/Supabase.
7. Add password reset and email verification.
8. Add backups and retention policy.
9. Add consent wording for member records and pastoral care data.
10. Add safeguarding escalation contacts and local emergency guidance.

## Folder structure

```text
src/
  config.js
  server.js
  db/
    jsonStore.js
    repositories.js
  middleware/
    auth.js
    errorHandler.js
    security.js
  routes/
    ai.routes.js
    analytics.routes.js
    auth.routes.js
    care.routes.js
    evangelism.routes.js
    events.routes.js
    finance.routes.js
    members.routes.js
    messages.routes.js
    prayer.routes.js
    settings.routes.js
  services/
    aiService.js
    auditService.js
    seedService.js
  utils/
    id.js
    password.js
    sanitize.js
    token.js
public/
  index.html
scripts/
  seed.js
  smoke-check.js
```
