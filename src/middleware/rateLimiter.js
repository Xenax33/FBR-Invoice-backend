import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// Helper: in development, disable rate limiting entirely
const disabledLimiter = (req, res, next) => next();

const makeLimiter = (options) => {
  // Only enforce rate limits in production
  if (config.nodeEnv !== 'production') {
    return disabledLimiter;
  }

  // Ensure per-IP limiting (default key is req.ip, but we set explicitly)
  return rateLimit({
    keyGenerator: (req /*, res */) => req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Strict rate limiter for authentication endpoints - 5 requests per 15 minutes per IP
export const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false, // Count successful requests too
});

// Moderate rate limiter for user creation - 10 requests per hour per IP
export const createUserLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 user creation requests per windowMs
  message: {
    status: 'error',
    message: 'Too many user creation attempts, please try again later.',
  },
});

// Very strict rate limiter for password reset/update - 3 requests per hour per IP
export const passwordLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password operations per windowMs
  message: {
    status: 'error',
    message: 'Too many password change attempts, please try again after an hour.',
  },
});

// Lenient rate limiter for MFA enrollment (forced flow, happens once) - 10 requests per 10 minutes per IP
export const mfaEnrollmentLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 enrollment requests per windowMs (more lenient for new admins)
  message: {
    status: 'error',
    message: 'Too many MFA enrollment attempts, please try again later.',
  },
});

// Strict rate limiter for MFA setup actions - 3 requests per 10 minutes per IP
export const mfaSetupLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    status: 'error',
    message: 'Too many MFA setup attempts, please try again later.',
  },
});

// Strict rate limiter for MFA verification attempts - 5 requests per 10 minutes per IP
export const mfaAttemptLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: 'error',
    message: 'Too many MFA verification attempts, please try again later.',
  },
});
