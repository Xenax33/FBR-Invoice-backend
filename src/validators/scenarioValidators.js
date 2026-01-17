import { body } from 'express-validator';

export const createScenarioValidation = [
  body('scenarioCode')
    .trim()
    .notEmpty()
    .withMessage('Scenario code is required')
    .isIn(['SN001','SN002','SN003','SN004','SN005','SN006','SN007','SN008','SN009','SN010','SN011','SN012','SN013','SN014','SN015','SN016','SN017','SN018','SN019','SN020','SN021','SN022','SN023','SN024','SN025','SN026','SN027','SN028'])
    .withMessage('Scenario code must be one of SN001–SN028'),
  body('scenarioDescription')
    .trim()
    .notEmpty()
    .withMessage('Scenario description is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Scenario description must be between 5 and 255 characters'),
];

export const updateScenarioValidation = [
  body('scenarioCode')
    .optional()
    .trim()
    .isIn(['SN001','SN002','SN003','SN004','SN005','SN006','SN007','SN008','SN009','SN010','SN011','SN012','SN013','SN014','SN015','SN016','SN017','SN018','SN019','SN020','SN021','SN022','SN023','SN024','SN025','SN026','SN027','SN028'])
    .withMessage('Scenario code must be one of SN001–SN028'),
  body('scenarioDescription')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Scenario description must be between 5 and 255 characters'),
];
