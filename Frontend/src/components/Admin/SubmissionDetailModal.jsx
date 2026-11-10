import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Save,
  Loader2
} from 'lucide-react';
import { apiService } from '../../services/api';
import './SubmissionDetailModal.css';

export const SubmissionDetailModal = ({ submission, onClose, onStatusUpdated }) => {
  if (!submission) return null;

  const [status, setStatus] = useState(submission.status || 'new');
  const [reviewNotes, setReviewNotes] = useState(submission.reviewNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const customer = submission.customerDetails || {};
  const tax = submission.taxAndAddressDetails || {};
  const address = tax.address || {};
  const contact = submission.contactDetails || {};

  const isGstRegistered =
    tax.gstTreatment === 'Registered - Regular' ||
    tax.gstTreatment === 'Registered - Composition';

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const response = await apiService.updateSubmissionStatus(submission._id, {
        status,
        reviewNotes
      });

      if (response.success && response.data) {
        setUpdateSuccess(true);
        if (onStatusUpdated) {
          onStatusUpdated(response.data);
        }
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update submission status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-reference-id">{submission.referenceId}</span>
            <span className={`badge badge-${submission.status}`}>
              {submission.status?.replace('_', ' ')}
            </span>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Submission Meta Banner */}
          <div className="submission-meta-banner">
            <div className="meta-item">
              <Calendar size={14} />
              <span>Submitted on: <strong>{formattedDate}</strong></span>
            </div>
            {submission.reviewedBy && (
              <div className="meta-item">
                <span>Last reviewed by: <strong>{submission.reviewedBy.fullName || 'Staff'}</strong></span>
              </div>
            )}
          </div>

          {/* Section 1: Customer & Legal Details */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <Building size={16} />
              <span>Customer & Legal Details</span>
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Business Legal Name</span>
                <span className="detail-value font-bold">{customer.businessLegalName || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer Classification</span>
                <span className="detail-value">{customer.customerType || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">PAN Number</span>
                <span className="detail-value font-mono highlight-pan">{customer.pan || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Tax Specifics */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <MapPin size={16} />
              <span>Address & Taxation Details</span>
            </h3>
            <div className="detail-grid">
              <div className="detail-item full-span">
                <span className="detail-label">Operational Address</span>
                <span className="detail-value">
                  {[address.line1, address.city, address.state, address.postalCode, address.country]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Billing Currency</span>
                <span className="detail-value">{tax.currency || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">GST Treatment Category</span>
                <span className="detail-value">{tax.gstTreatment || '—'}</span>
              </div>
              {isGstRegistered ? (
                <>
                  <div className="detail-item">
                    <span className="detail-label">GSTIN</span>
                    <span className="detail-value font-mono highlight-gstin">{tax.gstin || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Place of Supply</span>
                    <span className="detail-value">{tax.placeOfSupply || '—'}</span>
                  </div>
                </>
              ) : (
                <div className="detail-item full-span">
                  <span className="detail-label">GST Registration</span>
                  <span className="detail-value text-muted">Unregistered / Not applicable for this entity</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Contact & Communication */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <Mail size={16} />
              <span>Communication & Point of Contact</span>
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Primary Contact Person</span>
                <span className="detail-value font-bold">{contact.contactPerson || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preferred Language</span>
                <span className="detail-value">{contact.customerLanguage || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <a href={`mailto:${contact.email}`} className="detail-value text-primary">
                  {contact.email || '—'}
                </a>
              </div>
              <div className="detail-item">
                <span className="detail-label">Primary Telephone</span>
                <a href={`tel:${contact.phone}`} className="detail-value font-mono">
                  {contact.phone || '—'}
                </a>
              </div>
              {contact.alternatePhone && (
                <div className="detail-item">
                  <span className="detail-label">Alternate Telephone</span>
                  <span className="detail-value font-mono">{contact.alternatePhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Staff Review & Status Action */}
          <div className="detail-section status-mutation-box">
            <h3 className="detail-section-title">
              <Clock size={16} />
              <span>Review Action & Status Transition</span>
            </h3>

            {updateSuccess && (
              <div className="mutation-success-alert">
                <CheckCircle2 size={16} />
                <span>Status successfully updated to <strong>{status}</strong>.</span>
              </div>
            )}

            {updateError && (
              <div className="mutation-error-alert">
                <AlertTriangle size={16} />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="status-mutation-form">
              <div className="status-selection-group">
                <label htmlFor="modal-status-select" className="form-label">
                  Application Status
                </label>
                <select
                  id="modal-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select status-select"
                >
                  <option value="new">New (Submitted)</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="status-notes-group">
                <label htmlFor="modal-review-notes" className="form-label">
                  Internal Review Notes (Optional)
                </label>
                <textarea
                  id="modal-review-notes"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter audit notes, verification findings, or reasons for rejection..."
                  className="form-input form-textarea"
                />
              </div>

              <div className="status-action-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Status Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

