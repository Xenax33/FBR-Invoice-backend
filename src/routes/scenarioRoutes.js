import express from 'express';
import {
  createScenario,
  getAllScenarios,
  getScenarioById,
  updateScenario,
  deleteScenario,
  getScenarioOptions,
} from '../controllers/scenarioController.js';
import {
  createScenarioValidation,
  updateScenarioValidation,
} from '../validators/scenarioValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Scenario routes
router.post('/', authorize('ADMIN'), createScenarioValidation, validate, createScenario);
router.get('/', getAllScenarios);
router.get('/list', getScenarioOptions);
router.get('/:id', getScenarioById);
router.patch('/:id', authorize('ADMIN'), updateScenarioValidation, validate, updateScenario);
router.delete('/:id', authorize('ADMIN'), deleteScenario);

export default router;
