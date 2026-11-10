import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DetailShimmer } from '../../components/ui/Shimmer';
import { ErrorState } from '../../components/ui/ErrorState';
import './ClientDetailsPage.css';

const DetailField = ({ label, children, wide = false, mono = false }) => (
  <div className={`detail-field ${wide ? 'is-wide' : ''}`}>
    <span className="detail-field-label">{label}</span>
    <div className={`detail-field-value ${mono ? 'is-mono' : ''}`}>{children}</div>
  </div>
);

const formatStatus = (status) => (status || '').replace(/_/g, ' ');

export const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('new');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getClientDetails(id);
        if (res.success && res.data) {
          setClient(res.data);
          setStatus(res.data.status || 'new');
          setReviewNotes(res.data.reviewNotes || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecord();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const res = await apiService.updateClientStatus(id, { status, reviewNotes });
      if (res.success && res.data) {
        setClient(res.data);
        setUpdateSuccess(true);
        window.setTimeout(() => setUpdateSuccess(false), 2800);
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update client status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <DetailShimmer />;

  if (error || !client) {
    return (
      <ErrorState
        title="Client record not found"
        message={error || 'The requested client application could not be retrieved.'}
        onRetry={() => navigate('/admin/clients')}
        retryLabel="Back to clients"
      />
    );
  }

  const customer = client.customerDetails || {};
  const tax = client.taxAndAddressDetails || {};
  const address = tax.address || {};
  const contact = client.contactDetails || {};

  const isGstRegistered =
    tax.gstTreatment === 'Registered - Regular' ||
    tax.gstTreatment === 'Registered - Composition';

  const dateStr = client.submittedAt
    ? new Date(client.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

  const addressLine =
    [address.line1, address.city, address.state, address.postalCode, address.country]
      .filter(Boolean)
      .join(', ') || '—';

  return (
    <div className="client-details-container">
      <header className="details-identity glass-panel">
        <Button
          type="button"
          variant="secondary"
          className="btn-back"
          onClick={() => navigate('/admin/clients')}
        >
          <ArrowLeft size={15} />
          <span>Clients</span>
        </Button>

        <div className="details-identity-body">
          <div className="details-title-row">
            <h1 className="details-company-name display-title">
              {customer.businessLegalName || 'Unnamed client'}
            </h1>
            <span className={`badge badge-${client.status}`}>
              {formatStatus(client.status)}
            </span>
          </div>

          <div className="details-meta-row">
            <span className="ref-chip">{client.referenceId}</span>
            <span className="meta-date">
              <Calendar size={13} />
              <span>{dateStr}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="details-content-grid">
        <div className="details-main-column">
          <section className="details-card glass-panel">
            <div className="details-card-header">
              <span className="card-icon-wrap">
                <Building2 size={16} />
              </span>
              <h2 className="card-section-title">Customer & legal</h2>
            </div>
            <div className="card-fields-grid">
              <DetailField label="Type">{customer.customerType || '—'}</DetailField>
              <DetailField label="Legal name">
                <strong>{customer.businessLegalName || '—'}</strong>
              </DetailField>
              <DetailField label="PAN" mono>
                <span className="id-chip">{customer.pan || '—'}</span>
              </DetailField>
            </div>
          </section>

          <section className="details-card glass-panel">
            <div className="details-card-header">
              <span className="card-icon-wrap">
                <MapPin size={16} />
              </span>
              <h2 className="card-section-title">Address & tax</h2>
            </div>
            <div className="card-fields-grid">
              <DetailField label="Address" wide>
                {addressLine}
              </DetailField>
              <DetailField label="Currency">{tax.currency || '—'}</DetailField>
              <DetailField label="GST treatment">{tax.gstTreatment || '—'}</DetailField>
              {isGstRegistered ? (
                <>
                  <DetailField label="GSTIN" mono>
                    <span className="id-chip">{tax.gstin || '—'}</span>
                  </DetailField>
                  <DetailField label="Place of supply">{tax.placeOfSupply || '—'}</DetailField>
                </>
              ) : (
                <DetailField label="GSTIN" wide>
                  <span className="detail-muted">Not required for this treatment</span>
                </DetailField>
              )}
            </div>
          </section>

          <section className="details-card glass-panel">
            <div className="details-card-header">
              <span className="card-icon-wrap">
                <Mail size={16} />
              </span>
              <h2 className="card-section-title">Contact</h2>
            </div>
            <div className="card-fields-grid">
              <DetailField label="Contact person">
                <strong>{contact.contactPerson || '—'}</strong>
              </DetailField>
              <DetailField label="Language">{contact.customerLanguage || '—'}</DetailField>
              <DetailField label="Email">
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="detail-link">
                    {contact.email}
                  </a>
                ) : (
                  '—'
                )}
              </DetailField>
              <DetailField label="Phone" mono>
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="detail-link is-mono">
                    {contact.phone}
                  </a>
                ) : (
                  '—'
                )}
              </DetailField>
              {contact.alternatePhone ? (
                <DetailField label="Alternate phone" mono>
                  {contact.alternatePhone}
                </DetailField>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="details-sidebar-column">
          <div className="status-action-card glass-panel">
            <div className="action-card-header">
              <h3 className="action-card-title">Manage status</h3>
              <p className="action-card-sub">Update review outcome for this submission.</p>
            </div>

            {updateSuccess && (
              <div className="status-success-banner" role="status">
                <CheckCircle2 size={15} />
                <span>Saved as {formatStatus(status)}</span>
              </div>
            )}

            {updateError && (
              <div className="status-error-banner" role="alert">
                <AlertCircle size={15} />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="status-action-form">
              <div className="form-group">
                <label htmlFor="client-status-select" className="action-field-label">
                  Status
                </label>
                <select
                  id="client-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="action-select-input"
                >
                  <option value="new">New</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="client-review-notes" className="action-field-label">
                  Notes
                </label>
                <textarea
                  id="client-review-notes"
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Approval notes, rejection reason, or docs needed…"
                  className="action-textarea"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="btn-save-status"
                isLoading={isUpdating}
              >
                Update status
              </Button>
            </form>

            <div className="audit-info-box">
              <div className="audit-item">
                <span>Submitted</span>
                <strong>{dateStr}</strong>
              </div>
              {client.reviewedBy ? (
                <div className="audit-item">
                  <span>Reviewed by</span>
                  <strong>{client.reviewedBy.fullName || 'Staff'}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
