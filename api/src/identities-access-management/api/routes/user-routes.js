import express from "express";

import { getUserController } from "../controllers/get-user-controller.js";
import { getUserTokenInfoMiddleware } from "../middlewares/get-user-token-info-middleware.js";

const userRoutes = express.Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get the authenticated user's information
 *     description: |
 *       Returns the first name and last name of the currently authenticated user.
 *       The request must include a valid JWT Bearer token in the `Authorization` header,
 *       which is obtained from `POST /api/authentication/authenticate/token`.
 *     tags:
 *       - User
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
 *         example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyfQ.signature
 *     responses:
 *       200:
 *         description: User information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                       description: The user's first name.
 *                       example: John
 *                     lastname:
 *                       type: string
 *                       description: The user's last name.
 *                       example: Doe
 *       401:
 *         description: |
 *           The `Authorization` header is missing, the token has expired, or the token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenRequired:
 *                 summary: No token provided
 *                 value:
 *                   error: Token is required
 *               tokenExpired:
 *                 summary: Token has expired
 *                 value:
 *                   error: Token has expired
 *               tokenInvalid:
 *                 summary: Token is invalid
 *                 value:
 *                   error: Invalid token
 *       404:
 *         description: The user referenced by the token's `userId` claim no longer exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
userRoutes.get("/", getUserTokenInfoMiddleware, getUserController);

export default userRoutes;
