import { Hono } from "hono";
import {
  handleCreatePack,
  handleMutateScript,
} from "../controllers/creative.controller.js";

const creativeRoutes = new Hono();

creativeRoutes.post("/pack", handleCreatePack);
creativeRoutes.post("/mutate/:scriptId", handleMutateScript);

export { creativeRoutes };
