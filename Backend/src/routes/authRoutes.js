import express from 'express';
import { login, logout, getMe, registerStaff } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerStaffSchema } from '../validators/authValidator.js';
import { protectStaff } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protectStaff, getMe);
router.post('/register-staff', validate(registerStaffSchema), registerStaff);

export default router;

