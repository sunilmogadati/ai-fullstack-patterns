# Express Comments API

A small Node + Express + Mongoose backend for the comments app. This is the backend the [`react-redux`](../react-redux/) project talks to once you wire its `createAsyncThunk` calls to a real URL.

The point of this project is not the API itself — it is the *shape* of a production-grade Express service: ordered middleware, layered validation, a centralized error handler, a schema-as-contract model, and a clean separation between transport (HTTP), application (routes), and persistence (Mongoose).

## What's here

```
express-comments-api/
├── package.json
├── .env.example                      # contract for environment variables
├── src/
│   ├── server.js                     # app entry, middleware order, startup
│   ├── db.js                         # mongoose connection + event logging
│   ├── models/
│   │   └── Comment.js                # schema as contract
│   ├── routes/
│   │   └── comments.js               # GET / POST / PATCH /:id/like / DELETE /:id
│   └── middleware/
│       ├── errorHandler.js           # centralized error response
│       └── validate.js               # request shape validation
```

## Prerequisites

- Node.js 22 or later (the repo `.nvmrc` will pick this up if you use nvm).
- MongoDB running somewhere. Options:

| Option | Command | Best for |
|---|---|---|
| **Docker (recommended)** | `docker run -d -p 27017:27017 --name mongo mongo` | Zero-install, throwaway. |
| Homebrew | `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community` | Long-term local dev. |
| MongoDB Atlas | Free tier at [mongodb.com/atlas](https://www.mongodb.com/atlas) | Production / multi-machine. |

The default `MONGODB_URI` in `.env.example` points at the Docker/local install. For Atlas, swap the URI; nothing else changes.

## Run it

```bash
cp .env.example .env       # the API will refuse to start without this
npm install
npm run dev                # node --watch reloads on file change
```

You should see:

```
mongoose connected to mongodb://127.0.0.1:27017/comments
comments-api listening on http://localhost:3001
allowed CORS origins: http://localhost:5173, http://localhost:5174
```

## Quick smoke test

```bash
curl http://localhost:3001/health
# {"status":"ok","time":"..."}

curl -X POST http://localhost:3001/comments \
  -H "content-type: application/json" \
  -d '{"text":"Hello from curl"}'

curl http://localhost:3001/comments
```

## Endpoints

| Method | Path                     | Body              | Response                                 |
|--------|--------------------------|-------------------|------------------------------------------|
| GET    | `/health`                | —                 | `{ status, time }`                       |
| GET    | `/comments`              | —                 | `Comment[]`, newest first                |
| POST   | `/comments`              | `{ text }`        | `201 Comment`                            |
| PATCH  | `/comments/:id/like`     | —                 | `Comment` (likes incremented atomically) |
| DELETE | `/comments/:id`          | —                 | `204 No Content`                         |

The `Comment` shape:

```json
{
  "id": "66f0...",
  "text": "Hello from curl",
  "likes": 0,
  "createdAt": "2026-06-03T17:42:00.000Z",
  "updatedAt": "2026-06-03T17:42:00.000Z"
}
```

Every error response uses the same shape, regardless of where it originated:

```json
{ "error": { "status": 400, "message": "text cannot be empty" } }
```

## Key patterns demonstrated

- **Middleware order matters.** Put it in the wrong order and the bug looks like a feature regression. The diagnostic story is in [`docs/express-backend.md`](../../docs/express-backend.md).
- **Validation is layered, not centralized.** Request middleware catches malformed input fast; Mongoose schema catches it at the database boundary. Both exist deliberately.
- **One error response shape.** Centralized in `middleware/errorHandler.js` so every route stays focused on the happy path.
- **Schema as contract.** The Mongoose schema is the source of truth for what a `Comment` is. The route handler does not need to know.
- **CORS is a security boundary.** Allow-list, not wildcard. Driven by `.env`, never hard-coded.

## How this connects to the React app

The [`react-redux`](../react-redux/) project's `commentsSlice.js` has four async thunks — `fetchComments`, `addComment`, `removeComment`, `likeComment` — each pointed at the matching endpoint above. Open both projects in two terminals, run them, and the comment list in the browser is reading from and writing to this Express service. The full-stack integration story is in [`docs/full-stack-integration.md`](../../docs/full-stack-integration.md).

## What's next

The [`nextjs-app-router`](../nextjs-app-router/) project (planned) will rebuild this same surface using Next.js Route Handlers and Server Actions — and the integration document will discuss when standalone Express still earns its place versus when Next.js absorbs the backend.
