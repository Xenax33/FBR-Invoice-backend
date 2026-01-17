import express from 'express';
import { login, refreshAccessToken, logout, getProfile } from '../controllers/authController.js';
import { loginValidation, refreshTokenValidation } from '../validators/authValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with strict rate limiting
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', authLimiter, refreshTokenValidation, validate, refreshAccessToken);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
