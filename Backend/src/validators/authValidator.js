import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerStaffSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(2, 'Full name is required'),
  role: z.enum(['admin', 'staff']).default('staff')
});

