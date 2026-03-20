import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { config } from "./config.js";

let swaggerSpec;

const swaggerRoute = express.Router();
swaggerRoute.use("/api/docs", swaggerUI.serve, (req, res, next) => {
  // Lazily generate the swagger spec on the first docs request
  if (!swaggerSpec) {
    try {
      swaggerSpec = swaggerJsDoc(config.swagger);
    } catch (error) {
      // Do not crash the API if docs generation fails
      // eslint-disable-next-line no-console
      console.error("Failed to generate Swagger spec:", error);
      return res.status(500).json({ error: "Failed to generate API documentation" });
    }
  }

  return swaggerUI.setup(swaggerSpec)(req, res, next);
});
export default swaggerRoute;
