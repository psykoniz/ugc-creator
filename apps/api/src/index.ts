/**
 * UGC Creative Ops — API Server
 * Hono backend with 13 routes, BullMQ workers.
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getEnv } from "./config/index.js";
import { apiRoutes } from "./routes/index.js";
import { createBatchWorker } from "./workers/batch.worker.js";
import { createRenderWorker } from "./workers/render.worker.js";

const app = new Hono();

// Middleware
app.use("*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// API routes — all 13 routes under /api
app.route("/api", apiRoutes);

// 404 handler
app.notFound((c) => c.json({ error: "Not found", details: {} }, 404));

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error", details: {} }, 500);
});

// Start server + workers
const env = getEnv();
const port = env.PORT;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`);
});

// Start BullMQ workers
createBatchWorker();
createRenderWorker();
console.log("Workers started: batch, render");

export { app };
