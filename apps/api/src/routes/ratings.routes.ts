import { Hono } from "hono";
import { handleBatchRating } from "../controllers/ratings.controller.js";

const ratingsRoutes = new Hono();

ratingsRoutes.post("/batch", handleBatchRating);

export { ratingsRoutes };
