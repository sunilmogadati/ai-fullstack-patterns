// Entry point for the comments API.
//
// The single most important thing in this file is the ORDER of the middleware.
// Express runs middleware top-to-bottom on every request; if you put the error
// handler before the routes, the routes never see the error. If you put CORS
// after the routes, the browser blocks the response before your route ever
// runs. The order below is deliberate.

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectToDatabase } from "./db.js";
import commentsRouter from "./routes/comments.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ---- Middleware ----------------------------------------------------------

// CORS first. The browser sends OPTIONS preflight requests for non-trivial
// fetches; CORS must answer those BEFORE the request gets to a route handler.
//
// The allow-list comes from CORS_ORIGINS in .env so prod/dev/test can each
// have their own list. We never default to "*" in code; if someone wants
// to allow everything they can set CORS_ORIGINS=* explicitly.
const allowList = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowList.includes("*") ? true : allowList,
  })
);

// JSON body parser. Has to come BEFORE the routes so req.body is populated
// by the time a POST/PATCH handler runs.
app.use(express.json());

// ---- Routes --------------------------------------------------------------

// A trivial health endpoint. Useful in two ways:
//   1. Smoke test from curl during development.
//   2. The kind of thing a load balancer or container orchestrator pings.
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// All comments live under /comments.
app.use("/comments", commentsRouter);

// 404 for anything we did not match. This is a route, not an error.
// We pass through to the error handler with a custom-shaped error so the
// response shape stays consistent with every other error.
app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.method} ${req.path}`);
  err.status = 404;
  next(err);
});

// ---- Error handler -------------------------------------------------------
//
// MUST be the last middleware. Express identifies error-handling middleware
// by its four-argument signature (err, req, res, next). Putting it last
// means any error from any earlier middleware or route lands here.
app.use(errorHandler);

// ---- Startup -------------------------------------------------------------
//
// Connect to Mongo first, then bind the HTTP port. If Mongo cannot connect
// we want to fail fast and loud — a server that runs without its database
// is worse than a server that does not run at all.
async function start() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`comments-api listening on http://localhost:${PORT}`);
    console.log(`allowed CORS origins: ${allowList.join(", ") || "(none)"}`);
  });
}

start().catch((err) => {
  console.error("startup failed:", err);
  process.exit(1);
});
