import { config } from '../config/index.js';
import { ValidationError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle validation errors with clean structure
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    });
  }

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error
  console.error('ERROR 💥', err);
  
  // Don't leak error details in production
  if (config.nodeEnv === 'production') {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
  
  // In development, include more details but still clean
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: config.nodeEnv === 'development' ? err.name : undefined,
  });
};
