import React from 'react';
import { InputField } from '../../components/FormFields/InputField';
import { SelectField } from '../../components/FormFields/SelectField';

export const Step1Customer = ({ register, errors, setValue }) => {
  const customerTypeOptions = [
    { value: 'Business', label: 'Business / Corporate Entity' },
    { value: 'Individual', label: 'Individual / Proprietorship' }
  ];

  return (
    <div className="form-step-content">
      <div className="step-header">
        <h2 className="step-title">Customer & Legal Details</h2>
        <p className="step-description">
          Please provide the legal classification and tax identification details of your organization.
        </p>
      </div>

      <div className="form-grid">
        <SelectField
          label="Customer Classification"
          name="customerDetails.customerType"
          options={customerTypeOptions}
          placeholder="Select Classification"
          required
          register={register}
          error={errors.customerDetails?.customerType?.message}
          helperText="Select whether registering as a company entity or individual."
        />

        <InputField
          label="Business Legal Name"
          name="customerDetails.businessLegalName"
          placeholder="e.g. Acme Technologies Private Limited"
          required
          register={register}
          error={errors.customerDetails?.businessLegalName?.message}
          helperText="Official registered legal entity name as recognized by authorities."
        />

        <InputField
          label="Permanent Account Number (PAN)"
          name="customerDetails.pan"
          placeholder="e.g. ABCDE1234F"
          required
          register={register}
          error={errors.customerDetails?.pan?.message}
          helperText="Standard 10-character PAN (5 uppercase letters, 4 numbers, 1 letter)."
          onChange={(e) => {
            // Automatically uppercase PAN input
            setValue('customerDetails.pan', e.target.value.toUpperCase(), { shouldValidate: true });
          }}
          maxLength={10}
        />
      </div>
    </div>
  );
};

