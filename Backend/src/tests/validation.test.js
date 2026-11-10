import {
  form1CustomerDetailsSchema,
  form2TaxAndAddressSchema,
  form3ContactDetailsSchema,
  completeOnboardingSubmissionSchema,
  statusUpdateSchema
} from '../validators/onboardingValidator.js';

let passed = 0;
let failed = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
};

console.log('\n--- 1. Testing Form 1: Customer & Legal Details ---');

// Valid Form 1
const validForm1 = {
  customerType: 'Business',
  businessLegalName: 'Acme Technologies Pvt Ltd',
  pan: 'ABCDE1234F'
};
const res1 = form1CustomerDetailsSchema.safeParse(validForm1);
assert(res1.success, 'Valid Form 1 passes validation');

// Invalid PAN format
const invalidPan = {
  ...validForm1,
  pan: 'INVALIDPAN1'
};
const res1InvalidPan = form1CustomerDetailsSchema.safeParse(invalidPan);
assert(!res1InvalidPan.success, 'Invalid PAN format is rejected');

// Short legal name (< 2 chars)
const shortName = {
  ...validForm1,
  businessLegalName: 'A'
};
const res1ShortName = form1CustomerDetailsSchema.safeParse(shortName);
assert(!res1ShortName.success, 'Business Legal Name < 2 characters is rejected');

// Missing customer type
const missingType = {
  businessLegalName: 'Acme Technologies',
  pan: 'ABCDE1234F'
};
const res1MissingType = form1CustomerDetailsSchema.safeParse(missingType);
assert(!res1MissingType.success, 'Missing customerType is rejected');


console.log('\n--- 2. Testing Form 2: Address & Tax Specifics (Conditional GSTIN) ---');

const baseValidAddress = {
  line1: 'Suite 400, Tech Park',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560100',
  country: 'India'
};

// Registered GST Treatment with valid GSTIN & Place of Supply
const validRegisteredForm2 = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Registered - Regular',
  gstin: '29ABCDE1234F1Z5',
  placeOfSupply: 'Karnataka'
};
const res2Reg = form2TaxAndAddressSchema.safeParse(validRegisteredForm2);
assert(res2Reg.success, 'Registered - Regular with valid GSTIN & Place of Supply passes');

// Registered GST Treatment with missing GSTIN
const missingGstin = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Registered - Regular',
  gstin: '',
  placeOfSupply: 'Karnataka'
};
const res2MissingGstin = form2TaxAndAddressSchema.safeParse(missingGstin);
assert(!res2MissingGstin.success, 'Registered - Regular with missing GSTIN is rejected');

// Registered GST Treatment with invalid GSTIN format
const invalidGstin = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Registered - Composition',
  gstin: 'INVALIDGSTIN123',
  placeOfSupply: 'Karnataka'
};
const res2InvalidGstin = form2TaxAndAddressSchema.safeParse(invalidGstin);
assert(!res2InvalidGstin.success, 'Registered - Composition with invalid GSTIN format is rejected');

// Registered GST Treatment with missing Place of Supply
const missingSupply = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Registered - Regular',
  gstin: '29ABCDE1234F1Z5',
  placeOfSupply: ''
};
const res2MissingSupply = form2TaxAndAddressSchema.safeParse(missingSupply);
assert(!res2MissingSupply.success, 'Registered treatment with missing Place of Supply is rejected');

// Unregistered GST Treatment with empty GSTIN (Expected valid)
const validUnregistered = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Unregistered',
  gstin: '',
  placeOfSupply: ''
};
const res2Unreg = form2TaxAndAddressSchema.safeParse(validUnregistered);
assert(res2Unreg.success, 'Unregistered treatment with empty GSTIN & Place of Supply passes');

// Unregistered GST Treatment with GSTIN provided (Expected rejected)
const invalidUnregisteredWithGstin = {
  address: baseValidAddress,
  currency: 'INR',
  gstTreatment: 'Unregistered',
  gstin: '29ABCDE1234F1Z5',
  placeOfSupply: ''
};
const res2UnregWithGstin = form2TaxAndAddressSchema.safeParse(invalidUnregisteredWithGstin);
assert(!res2UnregWithGstin.success, 'Unregistered treatment containing a GSTIN is rejected');

// Consumer treatment with empty GSTIN
const validConsumer = {
  address: baseValidAddress,
  currency: 'USD',
  gstTreatment: 'Consumer',
  gstin: null,
  placeOfSupply: null
};
const res2Consumer = form2TaxAndAddressSchema.safeParse(validConsumer);
assert(res2Consumer.success, 'Consumer treatment with null GSTIN passes');


console.log('\n--- 3. Testing Form 3: Communication & Contact Details ---');

const validContact = {
  customerLanguage: 'English',
  contactPerson: 'Rahul Sharma',
  email: 'rahul.sharma@acme.com',
  phone: '+919876543210',
  alternatePhone: ''
};
const res3 = form3ContactDetailsSchema.safeParse(validContact);
assert(res3.success, 'Valid contact details pass validation');

// Invalid Email
const invalidEmail = {
  ...validContact,
  email: 'not-an-email'
};
const res3InvalidEmail = form3ContactDetailsSchema.safeParse(invalidEmail);
assert(!res3InvalidEmail.success, 'Malformed email address is rejected');

// Invalid Phone (too short / missing country code)
const invalidPhone = {
  ...validContact,
  phone: '12345'
};
const res3InvalidPhone = form3ContactDetailsSchema.safeParse(invalidPhone);
assert(!res3InvalidPhone.success, 'Invalid phone number format is rejected');

// Valid Alternate Phone with Country Code
const validAltPhone = {
  ...validContact,
  alternatePhone: '+918023456789'
};
const res3AltPhone = form3ContactDetailsSchema.safeParse(validAltPhone);
assert(res3AltPhone.success, 'Valid alternate phone number passes');


console.log('\n--- 4. Testing Complete Onboarding Submission Schema ---');

const completeSubmission = {
  customerDetails: validForm1,
  taxAndAddressDetails: validRegisteredForm2,
  contactDetails: validContact
};
const resComplete = completeOnboardingSubmissionSchema.safeParse(completeSubmission);
assert(resComplete.success, 'Complete multi-step onboarding payload passes schema validation');


console.log('\n--- 5. Testing Status Update Schema ---');

assert(statusUpdateSchema.safeParse({ status: 'under_review' }).success, 'Status "under_review" passes');
assert(statusUpdateSchema.safeParse({ status: 'approved', reviewNotes: 'Verified' }).success, 'Status "approved" with notes passes');
assert(statusUpdateSchema.safeParse({ status: 'rejected', reviewNotes: 'PAN mismatch' }).success, 'Status "rejected" with notes passes');
assert(!statusUpdateSchema.safeParse({ status: 'invalid_status' }).success, 'Invalid status string is rejected');


console.log('\n=============================================');
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log('=============================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

