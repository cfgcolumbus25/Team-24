#Backend Overview

This README gives you (and future contributors) a clear, high‑level picture of how the Express + Postgres (Supabase) backend works, how the Next.js App Router proxies and guards requests, and how to run + debug locally.

---

## Table of Contents
- [Architecture](#architecture)
- [Data Flow (Auth + Policies)](#data-flow-auth--policies)
- [Database Entities](#database-entities)
- [Backend (Express) API Routes](#backend-express-api-routes)
- [Next.js API Proxy Routes](#nextjs-api-proxy-routes)
- [Admin App Components](#admin-app-components)
- [Security: Email Regex & Password Hashing](#security-email-regex--password-hashing)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Quick Smoke Tests (curl)](#quick-smoke-tests-curl)
- [Troubleshooting](#troubleshooting)
- [Hardening Tips](#hardening-tips)

---

## Architecture

Stack:
- Frontend: Next.js (App Router) with a minimal UI component library.
- Backend: Express server ('server.ts') using 'pg' for Postgres.
- Database: Postgres (usually Supabase in production).
- Auth: Session tokens stored in a 'sessions' table/ frontend stores the token in an HTTP‑only cookie via Next.js API route.

High‑level:
1. A user registers/logs in via Next.js '/api/auth/*' which proxies to the Express backend.
2. The backend issues a random session token and stores it in the DB. the Next API route puts that token into a 'session_token' cookie (HTTP‑only).
3. The Next.js middleware protects '/admin/*' routes by verifying the cookie with the backend '/api/profile'.
4. The Admin Dashboard calls the Next.js proxy routes which talk to the Express backend to read/write policy data for the user’s own school.

---

## Data Flow (Auth + Policies)

Register/Login:
- Client → 'POST /api/auth/register|login' (Next) → proxies to backend 'POST /api/register|login'.
- Backend validates, hashes password (register), verifies hash (login), issues 'sessionToken' → Next stores it in 'session_token' cookie.

Session Check
- Next middleware checks 'session_token' for '/admin/*' by calling backend 'GET /api/profile' with 'Authorization: Bearer <token>'.
- If invalid/expired, middleware redirects to '/admin/login'.

Admin policy CRUD
- Admin Dashboard calls:
    - 'GET /api/admin/policies?universityId=...' → Next proxies to backend 'GET /api/schools/:id' and returns 'policies' only.
    - 'POST /api/admin/policies' → Next forwards 'Authorization' as Bearer to backend 'POST /api/admin/policies'.
    - 'PUT /api/admin/policies/:id' → backend verifies ownership, updates.
    - 'DELETE /api/admin/policies/:id' → backend verifies ownership, deletes.

---

## Database Entities

- users: 'id, username, email, password_hash, school_id, created_at'
- schools: school metadata (name, address, lat/lng, registrar_email, website_url, ...)
- school_policies: CLEP credit mappings ('exam_id, min_score, course_code, course_name, credits, is_general_credit, notes, is_updated, updated_at')
- votes: '(school_id, vote_type, user_ip, ...)' with aggregates returned per school
- sessions: '(user_id, session_token, expires_at)'

---

## Backend (Express) API Routes

Base URL: 'http://localhost:5001' (configurable via 'PORT')

### Auth & Profile
- 'POST /api/register' – validate .edu, 'bcrypt.hash', infer 'school_id', create session token
- 'POST /api/login' – lookup by username/email, 'bcrypt.compare', create session token
- 'POST /api/logout' – invalidate session (delete row)
- 'GET  /api/profile' *(protected)* – returns user with 'schoolId', 'schoolName'
- 'POST /api/cleanup-sessions' – deletes expired sessions

### Schools & Search
- 'GET  /api/schools?state=&city=&examId=' – list schools with 'policies' (aggregated) + 'votes'
- 'GET  /api/schools/search?q=' – search name/city/state
- 'GET  /api/schools/:id' – single school with 'policies' + 'votes'
- 'POST /api/schools/:id/vote' – upvote/downvote; returns updated counts

### Admin Policy CRUD *(protected + ownership enforced)*
- 'POST   /api/admin/policies' – create policy for 'schoolId' that matches the logged‑in user
- 'PUT    /api/admin/policies/:id' – update existing policy (same school ownership check)
- 'DELETE /api/admin/policies/:id' – delete policy (same ownership check)

### Utilities
- 'GET  /api/clep-exams' – list of CLEP exams
- 'POST /api/schools/add-test' – create a test school (dev helper)

Protection
- Protected routes use 'authenticateSession' middleware:
    - Reads 'Authorization: Bearer <sessionToken>'
    - Looks up in 'sessions', checks expiry, attaches 'req.userId'

---

## Next.js API Proxy Routes

Base URL: 'http://localhost:3000'

These live under 'app/api/*' and forward to the Express backend using 'NEXT_PUBLIC_BACKEND_URL'.

### Auth
- 'POST /api/auth/register' → backend '/api/register'; sets 'session_token' cookie
- 'POST /api/auth/login' → backend '/api/login'; sets 'session_token' cookie
- 'POST /api/auth/logout' → backend '/api/logout'; clears cookie
- 'GET  /api/auth/session' → backend '/api/profile'; returns '{ authenticated, user }'
- 'GET  /api/auth/check' → backend '/api/profile'; quick true/false

### Admin Policies
- 'GET  /api/admin/policies?universityId=' → backend '/api/schools/:id' (returns '{ policies }')
- 'POST /api/admin/policies' → backend '/api/admin/policies' (Bearer)
- 'PUT  /api/admin/policies/:id' → backend '/api/admin/policies/:id' (Bearer)
- 'DELETE /api/admin/policies/:id' → backend '/api/admin/policies/:id' (Bearer)

### Schools (public)
- 'GET  /api/schools?state=&city=&examId=' → backend '/api/schools'
- 'POST /api/schools/:id/vote' → backend '/api/schools/:id/vote'

### Middleware Guard
- 'middleware.ts' protects '/admin/*' by verifying 'session_token' with backend '/api/profile'. On fail: clear cookie + redirect to '/admin/login'.

---

## Admin App Components

- 'AdminAuthGuard' – client component that calls 'verifyAuth' (Next API) and redirects to '/admin/login' if unauthenticated
- 'AdminDashboard' – loads 'universityInfo' from session, then 'GET /api/admin/policies?universityId=...'; handles create/edit/delete
- 'PolicyList' & 'PolicyEditor' – UI for viewing and editing policies
- 'AdminHeader' – shows school name and logout button

---

## Security: Email Regex & Password Hashing

### .edu Email Regex
ts
// Basic
const eduEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/;

// Stricter domain labels
const strictEduEmailRegex =
/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+edu$/;


### Password Hashing (bcrypt)
ts
import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;

// Register
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// Login
const ok = await bcrypt.compare(password, user.password_hash);
if (!ok) { /* 401 Invalid credentials */ }

### Session Tokens

import crypto from "crypto";

function generateSessionToken(): string {
return crypto.randomBytes(32).toString("hex"); // 256 bits
}


---

## Environment Variables

Backend ('backend/.env')

PORT=5001
DATABASE_URL=postgres://postgres:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require
# or use the connection pooler if DNS is flaky:
# DATABASE_URL=postgres://postgres.<PROJECT-REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres


Frontend ('.env.local')

NEXT_PUBLIC_BACKEND_URL=http://localhost:5001


> If you change backend port, update 'NEXT_PUBLIC_BACKEND_URL' and restart Next.js.

---

## Local Development

### 1) Install & run backend
bash
cd backend
npm install
npm run dev
# Server running on port 5001


### 2) Install & run Next.js app
bash
cd ../frontend  # or project root if monorepo
npm install
npm run dev
# Next server on http://localhost:3000


### 3) Admin login (demo)
Open 'http://localhost:3000/admin/login'. Use the demo credentials if you seeded them (e.g., 'admin@example.edu / password123').

---

## Quick Smoke Tests (curl)

Schools read
bash
curl "http://localhost:5001/api/schools/2"


Policies via Next proxy
bash
curl "http://localhost:3000/api/admin/policies?universityId=2"


Login via Next
bash
curl -i -X POST "http://localhost:3000/api/auth/login" \
-H "Content-Type: application/json" \
--data '{"email":"admin@example.edu","password":"password123"}'
# Copy Set-Cookie: session_token=... and use it in subsequent requests


Create policy (via Next → backend)
bash
curl -X POST "http://localhost:3000/api/admin/policies" \
-H "Content-Type: application/json" \
-H "Cookie: session_token=<TOKEN_FROM_LOGIN>" \
--data '{"universityId":2,"examId":4,"minScore":60,"courseCode":"MATH 113","courseName":"Calculus I","credits":4,"isGeneralCredit":false,"notes":"Prereqs may apply"}'


---

## Troubleshooting

Port already in use (EADDRINUSE: 5001)  
bash
sudo lsof -nP -iTCP:5001 | grep LISTEN
kill -9 <PID>
# or
npx kill-port 5001


Supabase DNS 'ENOTFOUND db.<ref>.supabase.co'
- Most likely an issue of blocked ip if on Chase corporate network
- Try public DNS temporarily:
  bash
  networksetup -setdnsservers Wi-Fi 1.1.1.1 8.8.8.8
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder

- Or use the pooler hostname from Supabase “Connect” page.
- If your shell mangles passwords with '$', '*', etc., wrap connection strings in single quotes.

Invalid session / unauthorized in admin routes
- Ensure the Next proxy forwards the cookie as Bearer to backend (your current setup does).
- Verify 'session_token' cookie exists and isn’t expired; check backend '/api/profile' manually with the Bearer token.

404 for '/api/policies' vs '/api/admin/policies'
- The Admin Dashboard must call '/api/admin/policies' (or move the route to '/api/policies').

---

## Hardening Tips

- Normalize email: 'email = email.trim().toLowerCase()' (store as CITEXT or 'lower(email)' unique index).
- Rate-limit '/api/login' and '/api/register'.
- Add server-side validators for policy fields ('20 ≤ min_score ≤ 80', 'credits ≥ 0', non-empty course code/name).
- Consider short session TTL with rotation/refresh.
- Keep 'sessions.session_token' indexed; periodically run '/api/cleanup-sessions' or a cron job.
- Prefer the Supabase pooler for serverless environments or when IPv6/DNS is unstable.

---

## Repo Pointers
backend/
server.ts
DataBase/Connection/db.ts
package.json
.env

app/                 # Next.js (App Router)
    api/
        auth/
            login/route.ts
            logout/route.ts
            register/route.ts
            session/route.ts
            check/route.ts
        admin/
            policies/route.ts
            policies/[id]/route.ts
            schools/route.ts
            schools/[id]/vote/route.ts
        admin/
            page.tsx
            login/page.tsx
            register/page.tsx
            layout.tsx
        components/
            admin-dashboard.tsx
            admin-auth-guard.tsx
            policy-list.tsx
            policy-editor.tsx
            admin-header.tsx
            middleware.ts
            .env.local


That’s the whole picture. If you want this turned into a Swagger/OpenAPI doc for the backend endpoints, I can generate one to drop into 'backend/openapi.yaml' and a 'swagger-ui' dev route.
