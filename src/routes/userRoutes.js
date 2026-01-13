import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserPassword,
} from '../controllers/userController.js';
import {
  createUserValidation,
  updateUserValidation,
  updatePasswordValidation,
} from '../validators/userValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createUserLimiter, passwordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// User management routes with rate limiting
router.post('/', createUserLimiter, createUserValidation, validate, createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUserValidation, validate, updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/password', passwordLimiter, updatePasswordValidation, validate, updateUserPassword);

export default router;
