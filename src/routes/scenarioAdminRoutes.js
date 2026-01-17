import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  createGlobalScenario,
  getGlobalScenarios,
  updateGlobalScenario,
  deleteGlobalScenario,
  assignScenarioToUser,
  unassignScenarioFromUser,
  getUserAssignedScenarios,
  bulkAssignScenariosToUser,
} from '../controllers/scenarioAdminController.js';
import { createScenarioValidation, updateScenarioValidation } from '../validators/scenarioValidators.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

// Global scenarios CRUD
router.post('/global', createScenarioValidation, validate, createGlobalScenario);
router.get('/global', getGlobalScenarios);
router.patch('/global/:id', updateScenarioValidation, validate, updateGlobalScenario);
router.delete('/global/:id', deleteGlobalScenario);

// Assign/unassign scenarios to users
router.post(
  '/assign',
  [body('userId').isUUID().withMessage('userId must be a valid UUID'), body('scenarioId').isUUID().withMessage('scenarioId must be a valid UUID')],
  validate,
  assignScenarioToUser
);

router.delete(
  '/assign',
  [body('userId').isUUID().withMessage('userId must be a valid UUID'), body('scenarioId').isUUID().withMessage('scenarioId must be a valid UUID')],
  validate,
  unassignScenarioFromUser
);

router.get('/users/:userId', [param('userId').isUUID().withMessage('userId must be a valid UUID')], validate, getUserAssignedScenarios);

router.post(
  '/assign/bulk',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('scenarioIds').optional().isArray({ min: 1 }).withMessage('scenarioIds must be a non-empty array'),
    body('scenarioCodes').optional().isArray({ min: 1 }).withMessage('scenarioCodes must be a non-empty array'),
  ],
  validate,
  bulkAssignScenariosToUser
);

export default router;
