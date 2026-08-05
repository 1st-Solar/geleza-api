# Geleza API

Production backend for **GelezaAI** – serves indexed South African CAPS past exam papers.

Independent of the crawler and the Capacitor app.

## Production

```
https://geleza-api-production.up.railway.app/api/v1
```

The source code never hardcodes this domain. The server binds to `process.env.PORT || 3000` and builds absolute links from the incoming request (`req.protocol` + `Host` header), so the same binary works on localhost, Railway, Docker, Render, or any other host.

## Stack

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| helmet | Security headers |
| cors | Cross-origin (`CORS_ORIGINS` env) |
| compression | gzip |
| morgan | Request logging |
| express-rate-limit | Rate limiting |
| dotenv | Config |
| uuid | IDs (future modules) |

Node.js ≥ 18 · ES Modules · No TypeScript · No ORM · No DB (yet)

## Architecture

```
HTTP Request
    ↓
  /api/v1/*  (versioned)
    ↓
  Route → Controller → Service → Repository → papers.json (memory)
```

Only the **repository** knows the data source. Swap `paperRepository.js` for Supabase later; routes, controllers, services, and the mobile app stay unchanged.

## Quick start (local)

```bash
npm install
cp /path/to/crawler/src/output/papers.json src/data/papers.json
cp .env.example .env
npm start
```

Local base: `http://localhost:3000/api/v1`

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Listen port (Railway sets this) |
| `NODE_ENV` | `development` | `production` on Railway |
| `APP_VERSION` | `1.0.0` | Reported in `/health` |
| `PAPERS_PATH` | `./src/data/papers.json` | Path to papers data |
| `DEFAULT_LIMIT` | `20` | Default page size |
| `MAX_LIMIT` | `100` | Max page size |
| `CORS_ORIGINS` | _(empty = allow all)_ | Comma-separated origins |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `RATE_LIMIT_MAX` | `120` | Max requests per window |

Example `CORS_ORIGINS`:

```
capacitor://localhost,http://localhost:8000,http://localhost:5173,https://geleza.ai
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Status, version, paper count, environment, uptime |
| GET | `/api/v1/grades` | Unique grades |
| GET | `/api/v1/subjects?grade=12` | Subjects |
| GET | `/api/v1/years?...` | Years (filterable) |
| GET | `/api/v1/sessions?...` | Sessions |
| GET | `/api/v1/provinces?...` | Provinces that **actually exist** for filters |
| GET | `/api/v1/papers?...` | Filtered, sorted, paginated list |
| GET | `/api/v1/papers/:id` | Single paper (+ dynamic `links`) |
| GET | `/api/v1/search?q=` | Free-text search |
| GET | `/api/v1/stats` | Aggregates |
| GET | `/api/v1/download/:id?type=pdf\|memo` | Download metadata |
| GET | `/api/v1/view/:id` | Redirect to PDF |

### Response format

Success:

```json
{
  "success": true,
  "data": ...,
  "meta": { "page": 1, "limit": 20, "total": 9923, "totalPages": 497 }
}
```

Error:

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Paper not found" }
}
```

## Example requests (production)

```bash
# Health
curl https://geleza-api-production.up.railway.app/api/v1/health

# Grades
curl https://geleza-api-production.up.railway.app/api/v1/grades

# Subjects
curl "https://geleza-api-production.up.railway.app/api/v1/subjects?grade=12"

# Years
curl "https://geleza-api-production.up.railway.app/api/v1/years?grade=12&subject=Mathematics"

# Sessions
curl "https://geleza-api-production.up.railway.app/api/v1/sessions?grade=12&subject=Mathematics&year=2025"

# Provinces
curl "https://geleza-api-production.up.railway.app/api/v1/provinces?grade=11&subject=Mathematics&year=2025&session=November"

# Papers
curl "https://geleza-api-production.up.railway.app/api/v1/papers?grade=12&subject=Mathematics&year=2025&session=November&page=1&limit=5"

# Search
curl "https://geleza-api-production.up.railway.app/api/v1/search?q=mathematics&limit=5"

# Stats
curl https://geleza-api-production.up.railway.app/api/v1/stats

# View / download (replace :id with a real paper UUID)
curl -I "https://geleza-api-production.up.railway.app/api/v1/view/:id"
curl "https://geleza-api-production.up.railway.app/api/v1/download/:id"
curl "https://geleza-api-production.up.railway.app/api/v1/download/:id?type=memo"
```

## Local examples

```bash
curl http://localhost:3000/api/v1/health
curl "http://localhost:3000/api/v1/papers?grade=12&limit=3"
```

## Deploy on Railway

1. Push this repo to GitHub (`1st-Solar/geleza-api`).
2. Railway deploys from `main` with start command `node src/server.js`.
3. Set env vars as needed (`NODE_ENV=production`, `CORS_ORIGINS`, …).
4. Ensure `src/data/papers.json` is included in the deploy.
5. Health check: `https://geleza-api-production.up.railway.app/api/v1/health`

`app.set('trust proxy', 1)` is enabled so protocol/host (and rate-limit IPs) are correct behind Railway’s proxy.

## OpenAPI

See `docs/openapi.yaml` for the full contract.

## Future modules

Placeholder directories:

```
src/ai/{chat,solve,translate,ocr}
src/auth
src/users
src/favorites
src/history
src/analytics
src/downloads
```

## License

MIT
