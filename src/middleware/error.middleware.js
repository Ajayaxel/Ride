import { ApiError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for internal tracking
  logger.error(`${req.method} ${req.originalUrl} - Error:`, error);

  // If not already an ApiError, normalize it
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || (error.status ? parseInt(error.status) : 500);
    let message = error.message || 'Internal Server Error';
    let errors = [];

    // Mongoose duplicate key error (MongoDB code 11000)
    if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue)[0];
      message = `A resource with this ${field} already exists.`;
      errors = [ { field, message: `${field} must be unique` } ];
    }
    // Mongoose validation error
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Failed';
      errors = Object.values(error.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
    }
    // Mongoose cast error (invalid MongoDB ID, etc)
    else if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid format for resource ${error.path}: ${error.value}`;
    }
    // JWT Errors
    else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid authentication token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Authentication token expired';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  // Format error response payload
  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

// Middleware to handle 404 Route Not Found
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`);
  next(error);
};
