# Geleza API

Production-ready Express API for **GelezaAI** – serves indexed South African CAPS past exam papers.

Designed with a **repository pattern** so the data source can switch from `papers.json` to Supabase later **without changing routes or controllers**.

## Stack

- Node.js ≥ 18
- Express (ES Modules)
- dotenv, cors, morgan, compression
- No TypeScript, no ORM, no database yet

## Quick start

```bash
# 1. Install
npm install

# 2. Copy your crawler output
cp /path/to/crawler/src/output/papers.json src/data/papers.json

# 3. Configure (optional)
cp .env.example .env

# 4. Run
npm start
# or with auto-reload
npm run dev
```

API base: `http://localhost:3000`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check `{ "status": "ok" }` |
| GET | `/grades` | All grades |
| GET | `/subjects?grade=12` | Subjects (optional grade filter) |
| GET | `/years?grade=12&subject=Mathematics` | Years |
| GET | `/sessions?grade=12&subject=Mathematics&year=2025` | Sessions |
| GET | `/papers` | Filtered, paginated paper list |
| GET | `/papers/:id` | Single paper by UUID |
| GET | `/search?q=mathematics` | Free-text search |
| GET | `/stats` | Aggregate counts |

### `/papers` query parameters

| Param | Example | Notes |
|-------|---------|-------|
| `grade` | `12` | number |
| `subject` | `Mathematics` | case-insensitive |
| `year` | `2025` | number |
| `session` | `November` | case-insensitive |
| `province` | `KwaZulu-Natal` | case-insensitive |
| `assessmentType` | `Exam` | |
| `paper` | `1` | paper number |
| `language` | `English` | |
| `page` | `1` | default 1 |
| `limit` | `20` | default 20, max 100 |
| `sort` | `year` | year, subject, grade, province, session |
| `order` | `desc` | asc or desc |

**Example**

```
GET /papers?grade=12&subject=Mathematics&year=2025&session=November&limit=10
```

**Response shape**

```json
{
  "data": [
    {
      "id": "...",
      "grade": 12,
      "subject": "Mathematics",
      "year": 2025,
      "province": "National",
      "session": "November",
      "assessmentType": "Exam",
      "paper": 1,
      "memo": true,
      "language": "English",
      "source": "Testpapers",
      "pdf": "https://...",
      "memoPdf": "https://..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

## Architecture

```
Controller  →  Service  →  Repository  →  papers.json (memory)
```

- **Controllers** parse HTTP, call services, send responses
- **Services** hold light business rules
- **Repository** is the *only* place that knows about the data source

### Migrating to Supabase later

1. Implement the same method signatures in `paperRepository.js` using the Supabase client.
2. Call `load()` (or a no-op) at startup.
3. **Do not change** routes or controllers.

## Deploy on Railway

1. Push this repo to GitHub (or connect Railway to a local folder).
2. Create a new Railway project → **Deploy from GitHub**.
3. Railway detects Node automatically via `railway.json` / Nixpacks.
4. Set environment variables in the Railway dashboard:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | (Railway sets this automatically) |
   | `CORS_ORIGINS` | your Capacitor / web origins |
   | `PAPERS_PATH` | leave default, or point to a mounted volume |

5. **Important:** include your real `src/data/papers.json` in the deploy (or mount it as a volume / download it in a start script).

6. After deploy, open `https://<your-app>.up.railway.app/health`.

### Optional: start script that pulls latest papers

If you keep papers.json in a private URL or S3, you can replace the start command:

```bash
curl -o src/data/papers.json https://.../papers.json && node src/server.js
```

## Project structure

```
geleza-api/
├── package.json
├── railway.json
├── .env.example
├── README.md
├── src/
│   ├── server.js          # Entry – load data, listen
│   ├── app.js             # Express app + routes
│   ├── config/config.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   │   └── paperRepository.js   # ← swap this for Supabase
│   ├── middleware/
│   ├── utils/
│   └── data/
│       └── papers.json
└── tests/
```

## License

MIT
