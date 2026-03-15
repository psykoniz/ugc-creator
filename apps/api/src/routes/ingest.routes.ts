import { Hono } from "hono";
import {
  handleIngestUrl,
  handleIngestImages,
  handleIngestPrompt,
} from "../controllers/ingest.controller.js";

const ingestRoutes = new Hono();

ingestRoutes.post("/url", handleIngestUrl);
ingestRoutes.post("/images", handleIngestImages);
ingestRoutes.post("/prompt", handleIngestPrompt);

export { ingestRoutes };
