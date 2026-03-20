import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { config } from "./config.js";

const swaggerSpec = swaggerJsDoc(config.swagger);

const swaggerRoute = express.Router();
swaggerRoute.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default swaggerRoute;
