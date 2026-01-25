import { body } from 'express-validator';

export const adminLoginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const adminLoginMfaValidation = [
  body('challengeToken').notEmpty().withMessage('challengeToken is required'),
  body('token')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('token must be 6 digits')
    .isNumeric()
    .withMessage('token must be numeric'),
  body('backupCode')
    .optional()
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage('backupCode must be provided when token is not present'),
  body().custom((value) => {
    if (!value.token && !value.backupCode) {
      throw new Error('Either token or backupCode is required');
    }
    return true;
  }),
];

export const enableMfaValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification token must be 6 digits')
    .isNumeric()
    .withMessage('Verification token must be numeric'),
];

export const disableMfaValidation = [
  body('password').notEmpty().withMessage('Password is required'),
];

export const enrollMfaSecretValidation = [
  body('userId').isUUID().withMessage('Valid userId is required'),
];

export const enrollMfaEnableValidation = [
  body('userId').isUUID().withMessage('Valid userId is required'),
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification token must be 6 digits')
    .isNumeric()
    .withMessage('Verification token must be numeric'),
];
