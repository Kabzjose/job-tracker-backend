const { AppError } = require("../utils/errors")

const errorHandler = (err, req, res, next) => {
  // default to 500 if no status code
  err.statusCode = err.statusCode || 500
  err.message = err.message || "Server error"

  // log error in development
  console.error(`${err.statusCode} - ${err.message}`)

  // known operational error (our custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message
    })
  }

  // database errors
  if (err.code === "23505") { // postgres unique violation
    return res.status(409).json({
      status: "fail",
      statusCode: 409,
      message: "Email already exists"
    })
  }

  if (err.code === "23503") { // postgres foreign key violation
    return res.status(400).json({
      status: "fail",
      statusCode: 400,
      message: "Referenced resource not found"
    })
  }

  // jwt errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      statusCode: 401,
      message: "Invalid token"
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      statusCode: 401,
      message: "Token expired"
    })
  }

  // unknown/unhandled error
  return res.status(500).json({
    status: "error",
    statusCode: 500,
    message: "Something went wrong"
  })
}

module.exports = errorHandler