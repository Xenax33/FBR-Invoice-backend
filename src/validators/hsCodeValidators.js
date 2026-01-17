import { body } from 'express-validator';

export const createHsCodeValidation = [
  body('hsCode')
    .trim()
    .notEmpty()
    .withMessage('HS Code is required')
    .matches(/^\d{4}\.\d{4}$/)
    .withMessage('HS Code must be in format XXXX.XXXX (e.g., 0000.0000)'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

export const updateHsCodeValidation = [
  body('hsCode')
    .optional()
    .trim()
    .matches(/^\d{4}\.\d{4}$/)
    .withMessage('HS Code must be in format XXXX.XXXX (e.g., 0000.0000)'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];
