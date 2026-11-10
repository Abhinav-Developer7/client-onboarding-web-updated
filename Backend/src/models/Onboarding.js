import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' }
}, { _id: false });

const customerDetailsSchema = new mongoose.Schema({
  customerType: { 
    type: String, 
    required: true, 
    enum: ['Business', 'Individual'] 
  },
  businessLegalName: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 200 
  },
  pan: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'] 
  }
}, { _id: false });

const taxAndAddressDetailsSchema = new mongoose.Schema({
  address: { type: addressSchema, required: true },
  currency: { 
    type: String, 
    required: true, 
    enum: ['INR', 'USD', 'EUR', 'AED', 'GBP', 'SGD', 'CAD', 'AUD'] 
  },
  gstTreatment: { 
    type: String, 
    required: true, 
    enum: [
      'Registered - Regular', 
      'Registered - Composition', 
      'Unregistered', 
      'Consumer', 
      'Overseas / Export'
    ] 
  },
  gstin: { 
    type: String, 
    trim: true, 
    uppercase: true,
    default: null,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
  },
  placeOfSupply: { 
    type: String, 
    trim: true,
    default: null 
  }
}, { _id: false });

const contactDetailsSchema = new mongoose.Schema({
  customerLanguage: { 
    type: String, 
    required: true, 
    enum: ['English', 'Malayalam', 'Hindi', 'Tamil', 'Kannada', 'Telugu', 'Arabic', 'Spanish', 'French'] 
  },
  contactPerson: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'] 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  alternatePhone: { 
    type: String, 
    trim: true,
    default: null 
  }
}, { _id: false });

const onboardingSchema = new mongoose.Schema({
  referenceId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  customerDetails: { type: customerDetailsSchema, required: true },
  taxAndAddressDetails: { type: taxAndAddressDetailsSchema, required: true },
  contactDetails: { type: contactDetailsSchema, required: true },
  status: { 
    type: String, 
    enum: ['new', 'under_review', 'approved', 'rejected'], 
    default: 'new',
    index: true 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffUser', 
    default: null 
  },
  reviewNotes: { 
    type: String, 
    default: null 
  }
}, { timestamps: true });

// Performance Indexes for high volume filtering, sorting, and search
onboardingSchema.index({ submittedAt: -1 });
onboardingSchema.index({ status: 1, submittedAt: -1 });
onboardingSchema.index({ 'customerDetails.businessLegalName': 'text', 'customerDetails.pan': 'text', 'contactDetails.email': 'text' });
onboardingSchema.index({ 'customerDetails.customerType': 1 });
onboardingSchema.index({ 'taxAndAddressDetails.gstTreatment': 1 });

export const Onboarding = mongoose.model('Onboarding', onboardingSchema);
