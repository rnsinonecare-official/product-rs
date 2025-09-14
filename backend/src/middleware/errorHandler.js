/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = 'ServerError';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'ValidationError';
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    error = 'InvalidId';
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 400;
    error = 'DuplicateError';
    message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = 'InvalidToken';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = 'TokenExpired';
    message = 'Token expired';
  }

  // Firebase specific errors
  if (err.code && err.code.startsWith('auth/')) {
    statusCode = 401;
    error = 'AuthenticationError';
    
    switch (err.code) {
      case 'auth/id-token-expired':
        message = 'Authentication token has expired';
        break;
      case 'auth/id-token-revoked':
        message = 'Authentication token has been revoked';
        break;
      case 'auth/invalid-id-token':
        message = 'Invalid authentication token';
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      default:
        message = 'Authentication failed';
    }
  }

  // Firestore specific errors
  if (err.code && (err.code === 'permission-denied' || err.code === 'unauthenticated')) {
    statusCode = 403;
    error = 'PermissionDenied';
    message = 'You do not have permission to perform this action';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong';
  }

  const errorResponse = {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};