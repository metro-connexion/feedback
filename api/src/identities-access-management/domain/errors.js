import DomainError from "../../shared/domain/models/domain-error.js";

/**
 * Error thrown when token is required but not provided
 */
class RequiredTokenError extends DomainError {
  constructor() {
    super("Token is required", 401);
  }
}

/**
 * Error thrown when token has expired
 */
class ExpiredTokenError extends DomainError {
  constructor() {
    super("Token has expired", 401);
  }
}

/**
 * Error thrown when token is invalid
 */
class InvalidTokenError extends DomainError {
  constructor() {
    super("Invalid token", 401);
  }
}

/**
 * Error thrown when token verification fails
 */
class VerificationFailedError extends DomainError {
  constructor() {
    super("Token verification failed", 401);
  }
}

// Backward compatibility: keep the ERRORS object for existing code
const ERRORS = {
  TOKEN: {
    REQUIRED: "Token is required",
    EXPIRED_TOKEN: "Token has expired",
    INVALID_TOKEN: "Invalid token",
    VERIFICATION_FAILED: "Token verification failed",
  },
};

export default ERRORS;
export { ExpiredTokenError, InvalidTokenError, RequiredTokenError, VerificationFailedError };
