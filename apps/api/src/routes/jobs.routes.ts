import { Hono } from "hono";
import {
  handleCreateBatch,
  handleGetJobs,
  handleRetryJob,
} from "../controllers/jobs.controller.js";

const jobsRoutes = new Hono();

jobsRoutes.post("/batch", handleCreateBatch);
jobsRoutes.get("/", handleGetJobs);
jobsRoutes.post("/:id/retry", handleRetryJob);

export { jobsRoutes };
