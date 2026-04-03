import { generateCliTokenUsecase } from "../../usecases/generate-cli-token-usecase.js";

/**
 * Controller to authorize CLI login for the currently authenticated user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} usecase - Use case function to generate CLI token (optional)
 * @returns {Promise<*>} - Express response
 */
async function authorizeCliLoginController(req, res, next, usecase = generateCliTokenUsecase) {
  try {
    const { userId, identityProvider } = req.auth;
    const { token } = await usecase({ userId, identityProvider });
    return res.status(200).json({
      data: {
        type: "cli-authentication",
        attributes: {
          token,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export { authorizeCliLoginController };
