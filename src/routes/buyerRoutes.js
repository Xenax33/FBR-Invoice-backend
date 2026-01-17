import express from 'express';
import {
  createBuyer,
  getAllBuyers,
  getBuyerById,
  updateBuyer,
  deleteBuyer,
} from '../controllers/buyerController.js';
import {
  createBuyerValidation,
  updateBuyerValidation,
} from '../validators/buyerValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Buyer routes
router.post('/', createBuyerValidation, validate, createBuyer);
router.get('/', getAllBuyers);
router.get('/:id', getBuyerById);
router.patch('/:id', updateBuyerValidation, validate, updateBuyer);
router.delete('/:id', deleteBuyer);

export default router;
