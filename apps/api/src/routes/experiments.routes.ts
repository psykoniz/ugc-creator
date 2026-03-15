import { Hono } from "hono";
import {
  handleCreateExperiment,
  handleGetExperiment,
} from "../controllers/experiments.controller.js";

const experimentsRoutes = new Hono();

experimentsRoutes.post("/", handleCreateExperiment);
experimentsRoutes.get("/:id", handleGetExperiment);

export { experimentsRoutes };
