# Agni Recon Dashboard

A full-stack web dashboard for viewing, searching, and exporting results from subdomain reconnaissance. It includes:

- A Node.js/Express API with JWT-based authentication and MongoDB persistence
- A React (Vite) single-page app (SPA)
- Swagger/OpenAPI docs for the backend
- Docker-based production build
- Convenience scripts for database indexes and user bootstrapping

---

## Features

- Authentication
  - JWT-based login via /auth/login
  - Token auto-attach and 12h expiry
- Dashboard
  - Global counts for domains, subdomains, live subdomains, and takeovers
  - Recent subdomains list
- Domains
  - Paginated list of domains
  - Navigate to a domain’s subdomains
- Subdomains
  - Rich filters: domain, subdomain contains, status code, free-text, alive-only, takeover-only
  - Pagination
  - Export filtered results to TXT
- Domain details
  - Per-domain subdomains view with pagination, alive and takeover filters
  - Export to TXT
- Takeovers
  - Paginated list of takeover findings
  - Export to TXT
- API Docs
  - Interactive Swagger UI at /docs
- Health/Debug
  - Health check at /api/health (alias /health)
  - Optional DB debug at /api/_debug/db

---

## Project structure

```
.
├─ app.js                     # Express app entry
├─ routes/                    # API route handlers (/api, /auth)
├─ models/                    # MongoDB data access
├─ middleware/                # Auth middleware (JWT)
├─ scripts/
│  └─ create-indexes.js       # Index bootstrap for MongoDB
├─ create_user.js             # CLI to create a user (username/password)
├─ docs/openapi.json          # Swagger spec served at /docs
├─ client/                    # React app (Vite)
│  ├─ src/                    # React source code
│  ├─ dist/                   # Vite build output (production)
│  └─ vite.config.js          # Vite dev server and proxy config
└─ Dockerfile                 # Multi-stage Docker build (frontend + backend)
```

---

## Requirements

- Node.js 18+ and npm (for local dev), or Docker 20+ (for containerized run)
- MongoDB 5+ (local or remote; container recommended for production or testing)

---

## Environment variables

Backend (.env in project root)

- MONGODB_URI (required) MongoDB connection string
  - Example: mongodb://mongo:27017/recon_tool
- MONGODB_DB (optional) Override the database name parsed from MONGODB_URI
  - Example: recon_tool
- JWT_SECRET (required) Secret used to sign JWT tokens
  - Example: change_me_to_a_long_random_string
- PORT (optional) Port for Express server (default: 4000)
  - Example: 3000
- CORS_ORIGIN (optional) Comma-separated list of allowed origins or “*” (dev-friendly default will reflect request origin)
  - Example: http://localhost:5173,https://your.domain

Frontend (.env in client/)

- VITE_API_BASE_URL (optional)
  - Default during dev: /api (proxied to backend defined in client/vite.config.js)
  - For production (served by the backend), leave unset or set to /api
  - If you want to bypass the proxy and hit a remote backend directly in dev:
    - VITE_API_BASE_URL=http://localhost:3000/api

Example backend .env:

```
MONGODB_URI=mongodb://mongo:27017/recon_tool
MONGODB_DB=recon_tool
JWT_SECRET=please_change_me_to_a_long_random_value
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Example frontend .env (client/.env, optional):

```
# Default is /api; only set this if you want to target a full URL directly
# VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Running with Docker (recommended)

This repository includes a multi-stage Dockerfile that builds the React app and serves it from the Express backend.

Important: Ensure the backend serves the built SPA from client/dist. If your Dockerfile copies to a different path (e.g., client-dist), update it to client/dist. The final app.js expects client/dist.

Build and start:

```
docker build -t agni-dashboard .
docker run -itd --name agni-web -p 3000:3000 --env-file .env agni-dashboard
```

Create the first user (inside the running container):

```
docker compose exec web node create_user.js admin StrongPassword123
```

(Optional) Create MongoDB indexes:

```
docker compose exec web node scripts/create-indexes.js
```

Open the app:

- Web UI: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/api/health

Login with the user you created in the previous step.

Notes on the Dockerfile



## Local development (without Docker)

1) Start MongoDB

- Use a local MongoDB or run a container:
  ```
  docker run --name agni-mongo -p 27017:27017 -d mongo:6
  ```

2) Backend

- Create a .env in the project root:
  ```
  MONGODB_URI=mongodb://localhost:27017/recon_tool
  JWT_SECRET=please_change_me
  PORT=3000
  CORS_ORIGIN=http://localhost:5173
  ```
- Install and run:
  ```
  npm install
  node scripts/create-indexes.js
  node create_user.js admin StrongPassword123
  node app.js
  ```
- API available at http://localhost:3000, Swagger at /docs

3) Frontend

- In another terminal:
  ```
  cd client
  npm install
  npm run dev
  ```
- Vite serves the app at http://localhost:5173
- Vite proxies /api to http://localhost:3000

4) Login and use

- Visit http://localhost:5173/login
- Sign in with the user created earlier.

---

## API overview

Base URL

- In production (same-origin): /
- In development with Vite proxy: Frontend uses baseURL /api which proxies to http://localhost:3000

Auth

- POST /auth/login or /api/auth/login
  - Body: { "username": "...", "password": "..." }
  - Response: { "token": "..." }

Health

- GET /api/health (alias /health)

Stats and recent

- GET /api/stats
- GET /api/recent?limit=10

Domains

- GET /api/domains?page=1&limit=20

Domain subdomains

- GET /api/domains/:domain/subdomains?page=1&limit=20&is_alive=true&has_takeover=true

Subdomains search

- GET /api/subdomains?page=1&limit=20&domain=...&subdomain=...&q=...&status_code=200&is_alive=true&has_takeover=true

Exports

- GET /api/export/subdomains?domain=...&is_alive=true&has_takeover=true (text/plain)
- GET /api/export/takeovers (text/plain)

All /api/* routes require Authorization: Bearer <token>.

---

## Creating users

Use the CLI script against the environment you’re running:

- Locally:
  ```
  node create_user.js <username> <password>
  ```
- In Docker:
  ```
  docker compose exec web node create_user.js <username> <password>
  ```

---

## Scripts

- Create MongoDB indexes:
  ```
  node scripts/create-indexes.js
  ```
- Create a user:
  ```
  node create_user.js <username> <password>
  ```

---