import express from "express";

import { authenticateWithLogin } from "../controllers/authentication-controller.js";
import { authorizeCliLoginController } from "../controllers/cli-authentication-controller.js";
import { getUserTokenInfoMiddleware } from "../middlewares/get-user-token-info-middleware.js";
import { authenticateLoginSchema } from "../validation/authenticate-login-schema.js";

const authenticationRoutes = express.Router();

/**
 * @swagger
 * /api/authentication/authenticate/token:
 *   post:
 *     summary: Authenticate a user with email and password
 *     description: Validates the provided credentials and, on success, returns a signed JWT access token together with the authenticated user's identifier.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address (must be a valid email format).
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's plain-text password.
 *                 example: S3cr3tP@ssword
 *     responses:
 *       200:
 *         description: Authentication successful. Returns a JWT token and the authenticated user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: authentication
 *                     userId:
 *                       type: integer
 *                       description: The authenticated user's identifier.
 *                       example: 42
 *                     attributes:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: Signed JWT access token to be used as a Bearer token in subsequent requests.
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyfQ.signature
 *       400:
 *         description: |
 *           Request body failed validation (missing or malformed fields) **or** the user's
 *           account has no login-based authentication method configured.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - $ref: '#/components/schemas/Error'
 *             examples:
 *               validationFailed:
 *                 summary: Celebrate/Joi validation error
 *                 value:
 *                   error: Validation failed
 *                   details:
 *                     body:
 *                       source: body
 *                       keys: [email]
 *                       message: '"email" must be a valid email'
 *               noLoginMethod:
 *                 summary: No login authentication method found
 *                 value:
 *                   error: No login authentication method found
 *       401:
 *         description: The provided password does not match the stored credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Incorrect password
 *       404:
 *         description: No user exists for the given email address, or the user has no authentication method registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   error: User not found
 *               authMethodNotFound:
 *                 summary: Authentication method not found
 *                 value:
 *                   error: Authentication method not found
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
authenticationRoutes.post("/authenticate/token", authenticateLoginSchema, authenticateWithLogin);

/**
 * @swagger
 * /api/authentication/cli/authorize:
 *   post:
 *     summary: Authorize CLI access for the authenticated user
 *     description: |
 *       Generates a JWT token for CLI use. The request must include a valid JWT Bearer token
 *       obtained from the browser-based login flow. Returns a signed JWT token that the CLI
 *       can store and use for subsequent authenticated requests.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^Bearer .+'
 *         description: JWT Bearer token. Format: `Bearer <token>`
 *     responses:
 *       200:
 *         description: CLI token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: cli-authentication
 *                     attributes:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: Signed JWT access token for CLI use.
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyfQ.signature
 *       401:
 *         description: The Authorization header is missing, expired, or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
authenticationRoutes.post("/cli/authorize", getUserTokenInfoMiddleware, authorizeCliLoginController);

export default authenticationRoutes;

