import express from "express";

import { authenticateWithLogin } from "../controllers/authentication-controller.js";
import { authenticateLoginSchema } from "../validation/authenticate-login-schema.js";

const authenticationRoutes = express.Router();

authenticationRoutes.post("/authenticate/token", authenticateLoginSchema, authenticateWithLogin);

export default authenticationRoutes;
