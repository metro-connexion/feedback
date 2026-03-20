import express from "express";

import { healthCheckController } from "../controllers/health-check-controller.js";

const healthCheckRoute = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns a plain-text confirmation that the API process is running and accepting connections. Intended for liveness probes and uptime monitors.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is up and running.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: api is ok!
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
healthCheckRoute.get("/api/health", healthCheckController);

export default healthCheckRoute;
