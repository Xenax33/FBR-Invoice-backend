import express from 'express';
import {
  disableMfa,
  enableMfa,
  enableMfaForEnrollment,
  issueMfaSecret,
  issueMfaSecretForEnrollment,
} from '../controllers/adminMfaController.js';
import {
  disableMfaValidation,
  enableMfaValidation,
  enrollMfaEnableValidation,
  enrollMfaSecretValidation,
} from '../validators/adminMfaValidators.js';
import { validate } from '../middleware/validator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  mfaEnrollmentLimiter,
  mfaSetupLimiter,
  passwordLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public enrollment endpoints (for forced MFA during login)
router.post('/mfa/enroll/secret', mfaEnrollmentLimiter, enrollMfaSecretValidation, validate, issueMfaSecretForEnrollment);
router.post('/mfa/enroll/enable', mfaEnrollmentLimiter, enrollMfaEnableValidation, validate, enableMfaForEnrollment);

// Authenticated MFA management endpoints
router.post('/mfa/secret', authenticate, authorize('ADMIN'), mfaSetupLimiter, issueMfaSecret);
router.post('/mfa/enable', authenticate, authorize('ADMIN'), mfaSetupLimiter, enableMfaValidation, validate, enableMfa);
router.post('/mfa/disable', authenticate, authorize('ADMIN'), passwordLimiter, disableMfaValidation, validate, disableMfa);

export default router;
