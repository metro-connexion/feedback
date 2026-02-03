import cors from "cors";
import express from "express";

import { logger } from "./logger.js";
import authenticationRoutes from "./src/identities-access-management/api/routes/authentication-routes.js";
import { errorHandler } from "./src/shared/api/middlewares/error-handler.js";
import healthCheckRoute from "./src/shared/api/routes/health-check-route.js";

const server = express();
server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  res.on("finish", () => {
    logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  });
  next();
});

// Define routes here
server.use(healthCheckRoute);

// Authentication
server.use("/api/authentication", authenticationRoutes);

// Error handler middleware (must be defined after routes)
server.use(errorHandler);

export default server;
