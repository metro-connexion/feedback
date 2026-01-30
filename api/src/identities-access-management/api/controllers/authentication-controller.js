import { authenticateLoginUsecase } from "../../usecases/authenticate-login-usecase.js";

/**
 * Controller to authenticate a user via login
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} loginUseCase - Use case function for login authentication
 * @returns {Promise<*>} - Express response
 */
async function authenticateWithLogin(req, res, next, loginUseCase = authenticateLoginUsecase) {
  try {
    const { email, password } = req.body;
    const authResult = await loginUseCase({ email, password });
    if (authResult.success) {
      const response = {
        data: {
          type: "authentication",
          userId: authResult.userId,
          attributes: {
            token: authResult.token,
          },
        },
      };
      return res.status(200).json(response);
    }
  } catch (error) {
    return next(error);
  }
}

export { authenticateWithLogin };
