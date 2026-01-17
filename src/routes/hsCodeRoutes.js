import express from 'express';
import {
  createHsCode,
  getAllHsCodes,
  getHsCodeById,
  updateHsCode,
  deleteHsCode,
} from '../controllers/hsCodeController.js';
import {
  createHsCodeValidation,
  updateHsCodeValidation,
} from '../validators/hsCodeValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// HS Code routes
router.post('/', createHsCodeValidation, validate, createHsCode);
router.get('/', getAllHsCodes);
router.get('/:id', getHsCodeById);
router.patch('/:id', updateHsCodeValidation, validate, updateHsCode);
router.delete('/:id', deleteHsCode);

export default router;
