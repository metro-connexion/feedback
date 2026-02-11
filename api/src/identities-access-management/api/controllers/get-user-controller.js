import { getUserInfoUsecase } from "../../usecases/get-user-info-usecase.js";

/**
 * Controller to get user information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} usecase - Use case function to get user information (default: getUserInfoUsecase)
 * @returns {Promise<*>} Returns a JSON response with user information or passes an error to the next middleware
 */
async function getUserController(req, res, next, usecase = getUserInfoUsecase) {
  try {
    const { userId } = req.auth;
    const result = await usecase(userId);
    return res.status(200).json({
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export { getUserController };
