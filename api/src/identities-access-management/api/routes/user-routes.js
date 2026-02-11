import express from "express";

import { getUserController } from "../controllers/get-user-controller.js";
import { getUserTokenInfoMiddleware } from "../middlewares/get-user-token-info-middleware.js";

const userRoutes = express.Router();

userRoutes.get("/", getUserTokenInfoMiddleware, getUserController);

export default userRoutes;
