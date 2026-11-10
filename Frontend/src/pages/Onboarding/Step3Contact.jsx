import React from 'react';
import { InputField } from '../../components/FormFields/InputField';
import { SelectField } from '../../components/FormFields/SelectField';

export const Step3Contact = ({ register, errors }) => {
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
    { value: 'Arabic', label: 'Arabic (العربية)' },
    { value: 'Spanish', label: 'Spanish (Español)' },
    { value: 'French', label: 'French (Français)' }
  ];

  return (
    <div className="form-step-content">
      <div className="step-header">
        <h2 className="step-title">Communication & Contact Info</h2>
        <p className="step-description">
          Provide contact details for official communication, invoicing, and updates regarding this application.
        </p>
      </div>

      <div className="form-section">
        <SelectField
          label="Preferred Communication Language"
          name="contactDetails.customerLanguage"
          options={languageOptions}
          placeholder="Select Language"
          required
          register={register}
          error={errors.contactDetails?.customerLanguage?.message}
          helperText="We will tailor critical account communications in this language."
        />

        <InputField
          label="Primary Contact Person Full Name"
          name="contactDetails.contactPerson"
          placeholder="e.g. Rahul Sharma / Sarah Jenkins"
          required
          register={register}
          error={errors.contactDetails?.contactPerson?.message}
          helperText="Authorized representative or account administrator."
        />

        <div className="form-grid-2">
          <InputField
            label="Official Email Address"
            name="contactDetails.email"
            type="email"
            placeholder="e.g. accounts@acme.com"
            required
            register={register}
            error={errors.contactDetails?.email?.message}
            helperText="Where all onboarding confirmations and credentials will be sent."
          />

          <InputField
            label="Primary Telephone / Mobile Number"
            name="contactDetails.phone"
            type="tel"
            placeholder="e.g. +919876543210"
            required
            register={register}
            error={errors.contactDetails?.phone?.message}
            helperText="Include international country code prefix (e.g. +91, +1)."
          />
        </div>

        <InputField
          label="Alternate Phone Number (Optional)"
          name="contactDetails.alternatePhone"
          type="tel"
          placeholder="e.g. +918023456789"
          register={register}
          error={errors.contactDetails?.alternatePhone?.message}
          helperText="Secondary contact number in case primary is unreachable."
        />
      </div>
    </div>
  );
};

