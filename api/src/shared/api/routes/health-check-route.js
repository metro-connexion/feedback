import express from "express";

import { healthCheckController } from "../controllers/health-check-controller.js";

const healthCheckRoute = express.Router();
healthCheckRoute.get("/api/health", healthCheckController);

export default healthCheckRoute;
