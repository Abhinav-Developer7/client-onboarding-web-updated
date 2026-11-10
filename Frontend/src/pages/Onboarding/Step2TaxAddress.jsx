import React, { useEffect } from 'react';
import { InputField } from '../../components/FormFields/InputField';
import { SelectField } from '../../components/FormFields/SelectField';

export const Step2TaxAddress = ({ register, errors, watch, setValue }) => {
  const currentGstTreatment = watch('taxAndAddressDetails.gstTreatment');

  const isGstRegistered =
    currentGstTreatment === 'Registered - Regular' ||
    currentGstTreatment === 'Registered - Composition';

  // Clear GSTIN / Place of Supply when treatment does not require them
  useEffect(() => {
    if (!isGstRegistered && currentGstTreatment) {
      setValue('taxAndAddressDetails.gstin', '', { shouldValidate: false });
      setValue('taxAndAddressDetails.placeOfSupply', '', { shouldValidate: false });
    }
  }, [currentGstTreatment, isGstRegistered, setValue]);

  const currencyOptions = [
    { value: 'INR', label: 'INR - Indian Rupee (₹)' },
    { value: 'USD', label: 'USD - United States Dollar ($)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'AED', label: 'AED - UAE Dirham (د.إ)' },
    { value: 'GBP', label: 'GBP - British Pound (£)' },
    { value: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
    { value: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
    { value: 'AUD', label: 'AUD - Australian Dollar (A$)' }
  ];

  const gstTreatmentOptions = [
    { value: 'Registered - Regular', label: 'Registered - Regular' },
    { value: 'Registered - Composition', label: 'Registered - Composition Scheme' },
    { value: 'Unregistered', label: 'Unregistered Business' },
    { value: 'Consumer', label: 'Consumer / End User' },
    { value: 'Overseas / Export', label: 'Overseas / SEZ / Export' }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
  ].map((s) => ({ value: s, label: s }));

  return (
    <div className="form-step-content">
      <div className="step-header">
        <h2 className="step-title">Address & Tax Specifics</h2>
        <p className="step-description">
          Enter operational address and taxation details.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-subheading">Operational Address</h3>
        <InputField
          label="Street Address / Building / Unit"
          name="taxAndAddressDetails.address.line1"
          placeholder="e.g. Suite 400, Tech Park, Main Expressway"
          required
          register={register}
          error={errors.taxAndAddressDetails?.address?.line1?.message}
        />

        <div className="form-grid-2">
          <InputField
            label="City / District"
            name="taxAndAddressDetails.address.city"
            placeholder="e.g. Bengaluru"
            required
            register={register}
            error={errors.taxAndAddressDetails?.address?.city?.message}
          />

          <InputField
            label="State / Province"
            name="taxAndAddressDetails.address.state"
            placeholder="e.g. Karnataka"
            required
            register={register}
            error={errors.taxAndAddressDetails?.address?.state?.message}
          />
        </div>

        <div className="form-grid-2">
          <InputField
            label="Postal / PIN / ZIP Code"
            name="taxAndAddressDetails.address.postalCode"
            placeholder="e.g. 560100"
            required
            register={register}
            error={errors.taxAndAddressDetails?.address?.postalCode?.message}
          />

          <InputField
            label="Country"
            name="taxAndAddressDetails.address.country"
            placeholder="e.g. India"
            required
            register={register}
            error={errors.taxAndAddressDetails?.address?.country?.message}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-subheading">Taxation & Currency Compliance</h3>
        <div className="form-grid-2">
          <SelectField
            label="Billing Currency"
            name="taxAndAddressDetails.currency"
            options={currencyOptions}
            placeholder="Select Currency"
            required
            register={register}
            error={errors.taxAndAddressDetails?.currency?.message}
          />

          <SelectField
            label="GST Treatment"
            name="taxAndAddressDetails.gstTreatment"
            options={gstTreatmentOptions}
            placeholder="Select GST Category"
            required
            register={register}
            error={errors.taxAndAddressDetails?.gstTreatment?.message}
          />
        </div>

        {isGstRegistered && (
          <div className="form-grid-2">
            <InputField
              label="GSTIN"
              name="taxAndAddressDetails.gstin"
              placeholder="e.g. 29ABCDE1234F1Z5"
              required
              register={register}
              error={errors.taxAndAddressDetails?.gstin?.message}
              helperText="15-character alphanumeric GSTIN."
              maxLength={15}
              onChange={(e) => {
                setValue('taxAndAddressDetails.gstin', e.target.value.toUpperCase(), {
                  shouldValidate: true
                });
              }}
            />

            <SelectField
              label="Place of Supply"
              name="taxAndAddressDetails.placeOfSupply"
              options={indianStates}
              placeholder="Select state"
              required
              register={register}
              error={errors.taxAndAddressDetails?.placeOfSupply?.message}
            />
          </div>
        )}
      </div>
    </div>
  );
};

