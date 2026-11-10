import React, { useState } from 'react';
import { Edit2, CheckCircle2, Building, MapPin, Mail, AlertTriangle } from 'lucide-react';

export const Step4Review = ({ formData, onGoToStep, isSubmitting, submitError }) => {
  const [declared, setDeclared] = useState(false);
  const [declareError, setDeclareError] = useState('');

  const customer = formData.customerDetails || {};
  const tax = formData.taxAndAddressDetails || {};
  const address = tax.address || {};
  const contact = formData.contactDetails || {};

  const isGstRegistered =
    tax.gstTreatment === 'Registered - Regular' ||
    tax.gstTreatment === 'Registered - Composition';

  return (
    <div className="form-step-content">
      <div className="step-header">
        <h2 className="step-title">Review & Submit Application</h2>
        <p className="step-description">
          Carefully review all submitted details before final submission. Click "Edit" to modify any section.
        </p>
      </div>

      {submitError && (
        <div className="review-error-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Review Section 1: Customer & Legal Details */}
      <div className="review-card">
        <div className="review-card-header">
          <div className="review-card-title">
            <Building size={18} className="review-icon" />
            <span>Customer & Legal Details</span>
          </div>
          <button
            type="button"
            className="btn-edit-section"
            onClick={() => onGoToStep(1)}
            aria-label="Edit Customer & Legal Details"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="review-details-grid">
          <div className="review-item">
            <span className="review-label">Customer Type</span>
            <span className="review-value">{customer.customerType || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Business Legal Name</span>
            <span className="review-value font-semibold">{customer.businessLegalName || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Permanent Account Number (PAN)</span>
            <span className="review-value font-mono">{customer.pan || '—'}</span>
          </div>
        </div>
      </div>

      {/* Review Section 2: Address & Tax Specifics */}
      <div className="review-card">
        <div className="review-card-header">
          <div className="review-card-title">
            <MapPin size={18} className="review-icon" />
            <span>Address & Tax Specifics</span>
          </div>
          <button
            type="button"
            className="btn-edit-section"
            onClick={() => onGoToStep(2)}
            aria-label="Edit Address & Tax Specifics"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="review-details-grid">
          <div className="review-item full-width">
            <span className="review-label">Address</span>
            <span className="review-value">
              {[address.line1, address.city, address.state, address.postalCode, address.country]
                .filter(Boolean)
                .join(', ') || '—'}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">Billing Currency</span>
            <span className="review-value">{tax.currency || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">GST Treatment</span>
            <span className="review-value">{tax.gstTreatment || '—'}</span>
          </div>
          {isGstRegistered ? (
            <>
              <div className="review-item">
                <span className="review-label">GSTIN</span>
                <span className="review-value font-mono text-primary">{tax.gstin || '—'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Place of Supply</span>
                <span className="review-value">{tax.placeOfSupply || '—'}</span>
              </div>
            </>
          ) : (
            <div className="review-item full-width">
              <span className="review-label">GST Compliance</span>
              <span className="review-value text-muted">GSTIN not applicable for this tax treatment</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Section 3: Communication & Contact Info */}
      <div className="review-card">
        <div className="review-card-header">
          <div className="review-card-title">
            <Mail size={18} className="review-icon" />
            <span>Communication & Contact Details</span>
          </div>
          <button
            type="button"
            className="btn-edit-section"
            onClick={() => onGoToStep(3)}
            aria-label="Edit Communication & Contact Details"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="review-details-grid">
          <div className="review-item">
            <span className="review-label">Preferred Language</span>
            <span className="review-value">{contact.customerLanguage || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Contact Person</span>
            <span className="review-value font-semibold">{contact.contactPerson || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Email Address</span>
            <span className="review-value">{contact.email || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Primary Phone</span>
            <span className="review-value font-mono">{contact.phone || '—'}</span>
          </div>
          {contact.alternatePhone && (
            <div className="review-item">
              <span className="review-label">Alternate Phone</span>
              <span className="review-value font-mono">{contact.alternatePhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Declaration Checkbox */}
      <div className="declaration-box">
        <label className="declaration-label">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => {
              setDeclared(e.target.checked);
              if (e.target.checked) setDeclareError('');
            }}
            className="declaration-checkbox"
          />
          <span>
            I hereby certify that all information submitted in this application is accurate, up-to-date, and compliant with relevant tax and legal regulations.
          </span>
        </label>
        {declareError && <span className="form-error-message">{declareError}</span>}
      </div>
    </div>
  );
};

