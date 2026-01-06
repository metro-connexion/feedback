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

/**
 * Error thrown when user not found
 */
class UserNotFoundError extends DomainError {
  constructor() {
    super("User not found", 404);
  }
}

/**
 * Error thrown when password is incorrect
 */
class IncorrectPasswordError extends DomainError {
  constructor() {
    super("Incorrect password", 401);
  }
}

/**
 * Error thrown when authentication method is not found
 */
class AuthMethodNotFoundError extends DomainError {
  constructor() {
    super("Authentication method not found", 404);
  }
}

/**
 * Error thrown when there is no login authentication method
 */
class NoLoginAuthMethodError extends DomainError {
  constructor() {
    super("No login authentication method found", 400);
  }
}
export { AuthMethodNotFoundError, ExpiredTokenError, IncorrectPasswordError, InvalidTokenError, NoLoginAuthMethodError, RequiredTokenError, UserNotFoundError, VerificationFailedError };
