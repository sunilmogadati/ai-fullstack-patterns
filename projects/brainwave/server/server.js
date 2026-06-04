// Brainwave API entry.
//
// Middleware order — CORS, body parser, routes, error handler — same
// discipline as express-comments-api. The AI routes will mount in
// Evening 2 alongside the sessions router.

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectToDatabase } from "./db.js";
import sessionsRouter from "./routes/sessions.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// ---- Middleware ----------------------------------------------------------

const allowList = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowList.includes("*") ? true : allowList,
  })
);

app.use(express.json());

// ---- Routes --------------------------------------------------------------

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/sessions", sessionsRouter);

// 404 fallthrough.
app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.method} ${req.path}`);
  err.status = 404;
  next(err);
});

// Error handler — last.
app.use(errorHandler);

// ---- Startup -------------------------------------------------------------

async function start() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`brainwave-api listening on http://localhost:${PORT}`);
    console.log(`allowed CORS origins: ${allowList.join(", ") || "(none)"}`);
  });
}

start().catch((err) => {
  console.error("startup failed:", err);
  process.exit(1);
});
