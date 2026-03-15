import { Hono } from "hono";
import { ingestRoutes } from "./ingest.routes.js";
import { creativeRoutes } from "./creative.routes.js";
import { experimentsRoutes } from "./experiments.routes.js";
import { jobsRoutes } from "./jobs.routes.js";
import { outputsRoutes } from "./outputs.routes.js";
import { ratingsRoutes } from "./ratings.routes.js";

const apiRoutes = new Hono();

apiRoutes.route("/ingest", ingestRoutes);
apiRoutes.route("/creative", creativeRoutes);
apiRoutes.route("/experiments", experimentsRoutes);
apiRoutes.route("/jobs", jobsRoutes);
apiRoutes.route("/outputs", outputsRoutes);
apiRoutes.route("/ratings", ratingsRoutes);

export { apiRoutes };
