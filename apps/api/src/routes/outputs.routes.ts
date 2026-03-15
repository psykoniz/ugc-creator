import { Hono } from "hono";
import {
  handleGetOutputs,
  handleMarkWinner,
} from "../controllers/outputs.controller.js";

const outputsRoutes = new Hono();

outputsRoutes.get("/", handleGetOutputs);
outputsRoutes.post("/:id/mark-winner", handleMarkWinner);

export { outputsRoutes };
