import express from 'express';
import {
  createGlobalScenario,
  getAllGlobalScenarios,
  getGlobalScenarioById,
  updateGlobalScenario,
  deleteGlobalScenario,
  assignScenarioToUser,
  unassignScenarioFromUser,
  getUserAssignedScenarios,
  getMyScenarios,
} from '../controllers/scenarioController.js';
import {
  createGlobalScenarioValidation,
  updateGlobalScenarioValidation,
  assignScenarioValidation,
  unassignScenarioValidation,
} from '../validators/scenarioValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes - Get my assigned scenarios
router.get('/my-scenarios', authenticate, getMyScenarios);

// Admin routes - Manage global scenarios (CRUD)
router.post(
  '/global',
  authenticate,
  authorize('ADMIN'),
  createGlobalScenarioValidation,
  validate,
  createGlobalScenario
);

router.get('/global', authenticate, authorize('ADMIN'), getAllGlobalScenarios);

router.get('/global/:id', authenticate, authorize('ADMIN'), getGlobalScenarioById);

router.patch(
  '/global/:id',
  authenticate,
  authorize('ADMIN'),
  updateGlobalScenarioValidation,
  validate,
  updateGlobalScenario
);

router.delete('/global/:id', authenticate, authorize('ADMIN'), deleteGlobalScenario);

// Admin routes - Assign/Unassign scenarios to users
router.post(
  '/assign',
  authenticate,
  authorize('ADMIN'),
  assignScenarioValidation,
  validate,
  assignScenarioToUser
);

router.post(
  '/unassign',
  authenticate,
  authorize('ADMIN'),
  unassignScenarioValidation,
  validate,
  unassignScenarioFromUser
);

router.get(
  '/user/:userId',
  authenticate,
  authorize('ADMIN'),
  getUserAssignedScenarios
);

export default router;
