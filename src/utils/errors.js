//defines custom error classes for handling different types of errors in the application. The AppError class is a base class that other error classes extend from, allowing for consistent error handling throughout the application.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401)
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400)
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409)
  }
}

module.exports = { AppError, NotFoundError, UnauthorizedError, ValidationError, ConflictError }