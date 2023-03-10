class BaseError extends Error {
  constructor(message, errorCode) {
    super(message); // Adds a message property
    this.code = errorCode; // Adds a code property
    Error.captureStackTrace(this);
  }
}

module.exports = BaseError;
