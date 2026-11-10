import { z } from 'zod';

export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const phoneRegex = /^\+?[1-9]\d{6,14}$/;

export const form1CustomerDetailsSchema = z.object({
  customerType: z.enum(['Business', 'Individual'], {
    required_error: 'Please select a customer type'
  }),
  businessLegalName: z.string().trim().min(2, 'Legal name must be at least 2 characters').max(200),
  pan: z.string().trim().toUpperCase().regex(panRegex, 'Invalid PAN format. Must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F)')
});

export const form2TaxAndAddressSchema = z.object({
  address: z.object({
    line1: z.string().trim().min(3, 'Address line 1 is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    postalCode: z.string().trim().min(3, 'Postal code is required').max(12),
    country: z.string().trim().min(2, 'Country is required').default('India')
  }),
  currency: z.enum(['INR', 'USD', 'EUR', 'AED', 'GBP', 'SGD', 'CAD', 'AUD'], {
    required_error: 'Please select a currency'
  }),
  gstTreatment: z.enum([
    'Registered - Regular', 
    'Registered - Composition', 
    'Unregistered', 
    'Consumer', 
    'Overseas / Export'
  ], {
    required_error: 'Please select GST treatment'
  }),
  gstin: z.string().trim().toUpperCase().optional().nullable(),
  placeOfSupply: z.string().trim().optional().nullable()
}).superRefine((data, ctx) => {
  const isRegistered = 
    data.gstTreatment === 'Registered - Regular' || 
    data.gstTreatment === 'Registered - Composition';

  if (isRegistered) {
    if (!data.gstin || !gstinRegex.test(data.gstin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gstin'],
        message: 'Valid 15-character GSTIN is required for registered tax treatment'
      });
    }
    if (!data.placeOfSupply || data.placeOfSupply.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['placeOfSupply'],
        message: 'Place of supply is required when GST applies'
      });
    }
  } else {
    // If unregistered or consumer, GSTIN should be cleared / rejected
    if (data.gstin && data.gstin.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gstin'],
        message: 'GSTIN must not be provided for unregistered or consumer tax treatments'
      });
    }
  }
});

export const form3ContactDetailsSchema = z.object({
  customerLanguage: z.enum([
    'English', 'Malayalam', 'Hindi', 'Tamil', 'Kannada', 'Telugu', 'Arabic', 'Spanish', 'French'
  ], {
    required_error: 'Please select preferred communication language'
  }),
  contactPerson: z.string().trim().min(2, 'Contact person name is required').max(100),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().regex(phoneRegex, 'Valid phone number with country code is required (e.g. +919876543210)'),
  alternatePhone: z.string().trim().regex(phoneRegex, 'Invalid alternate phone number format').optional().or(z.literal('')).nullable()
});

export const completeOnboardingSubmissionSchema = z.object({
  customerDetails: form1CustomerDetailsSchema,
  taxAndAddressDetails: form2TaxAndAddressSchema,
  contactDetails: form3ContactDetailsSchema
});

export const statusUpdateSchema = z.object({
  status: z.enum(['new', 'under_review', 'approved', 'rejected'], {
    required_error: 'Status is required'
  }),
  reviewNotes: z.string().trim().max(1000).optional().nullable()
});

export const listSubmissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  status: z
    .enum(['all', 'new', 'under_review', 'approved', 'rejected'])
    .optional(),
  customerType: z.enum(['all', 'Business', 'Individual']).optional(),
  gstTreatment: z
    .enum([
      'all',
      'Registered - Regular',
      'Registered - Composition',
      'Unregistered',
      'Consumer',
      'Overseas / Export'
    ])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['submittedAt', 'status', 'referenceId', 'createdAt']).optional().default('submittedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

