import express from 'express';
import {
  submitOnboarding,
  getDashboardData,
  listSubmissions,
  getSubmissionById,
  updateSubmissionStatus
} from '../controllers/onboardingController.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  completeOnboardingSubmissionSchema,
  statusUpdateSchema,
  listSubmissionsQuerySchema
} from '../validators/onboardingValidator.js';
import { protectStaff } from '../middleware/auth.js';
import { publicSubmissionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public: Submit complete 3-form onboarding
router.post(
  '/public/onboarding',
  publicSubmissionLimiter,
  validate(completeOnboardingSubmissionSchema),
  submitOnboarding
);

// Protected Staff routes: Dashboard aggregated stats
router.get('/dashboard/stats', protectStaff, getDashboardData);

// Protected Staff routes: Paginated clients listing & search
router.get('/onboarding', protectStaff, validateQuery(listSubmissionsQuerySchema), listSubmissions);
router.get('/clients', protectStaff, validateQuery(listSubmissionsQuerySchema), listSubmissions);

// Protected Staff routes: Individual client details
router.get('/onboarding/:id', protectStaff, getSubmissionById);
router.get('/clients/:id', protectStaff, getSubmissionById);

// Protected Staff routes: Update client status
router.patch('/onboarding/:id/status', protectStaff, validate(statusUpdateSchema), updateSubmissionStatus);
router.patch('/clients/:id/status', protectStaff, validate(statusUpdateSchema), updateSubmissionStatus);

export default router;
