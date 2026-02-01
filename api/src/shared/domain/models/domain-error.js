/**
 * Base class for domain errors with HTTP status code support
 */
class DomainError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default DomainError;
