import jwt from "jsonwebtoken";

import { config } from "../../../../config.js";
import { logger } from "../../../../logger.js";
import { ExpiredTokenError, InvalidTokenError, VerificationFailedError } from "../errors.js";

const secret = config.jwt.tokenSecret;
const expirationTime = config.jwt.expirationTime || "1h";

function encodedToken(data) {
  try {
    return jwt.sign(data, secret, {
      expiresIn: expirationTime,
    });
  } catch (error) {
    logger.error(`Token encoding failed ${error}`);
    throw error;
  }
}

function decodedToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error(`Token decoding failed ${error}`);
    if (error.name === "TokenExpiredError") {
      throw new ExpiredTokenError();
    } else if (error.name === "JsonWebTokenError") {
      throw new InvalidTokenError();
    } else {
      throw new VerificationFailedError();
    }
  }
}

export { decodedToken, encodedToken };
