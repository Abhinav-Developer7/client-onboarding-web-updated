import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Inbox
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import './ClientsPage.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export const ClientsPage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gstFilter, setGstFilter] = useState('all');
  const abortRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchClients = useCallback(async (pageToFetch = 1) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');

    try {
      const params = {
        page: pageToFetch,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        customerType: typeFilter !== 'all' ? typeFilter : undefined,
        gstTreatment: gstFilter !== 'all' ? gstFilter : undefined
      };

      const res = await apiService.getClients(params, { signal: controller.signal });

      if (res.success) {
        setClients(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      if (err.isCanceled) return;
      setClients([]);
      setError(err.message || 'Failed to load client records');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, statusFilter, typeFilter, gstFilter]);

  useEffect(() => {
    fetchClients(1);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [debouncedSearch, statusFilter, typeFilter, gstFilter, fetchClients]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      fetchClients(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setGstFilter('all');
  };

  const hasActiveFilters =
    debouncedSearch.length > 0 ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    gstFilter !== 'all';

  return (
    <div className="clients-page-container">
      <header className="clients-header-row">
        <div className="clients-header-copy">
          <h1 className="page-title display-title">Clients</h1>
          <p className="page-subtitle">
            {pagination.totalRecords} submission{pagination.totalRecords === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="btn-refresh"
          isLoading={loading}
          onClick={() => fetchClients(pagination.currentPage)}
          title="Refresh current page"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </Button>
      </header>

      <section className="clients-filter-card saas-card" aria-label="Search and filters">
        <div className="search-field-box">
          <Search size={17} className="search-box-icon" />
          <input
            type="search"
            placeholder="Search name, email, phone, or reference ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-text-input"
            aria-label="Search clients"
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="status-chip-row" role="group" aria-label="Filter by status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`status-chip ${statusFilter === option.value ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={statusFilter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="filter-secondary-row">
          <label className="filter-field">
            <span className="filter-label">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All types</option>
              <option value="Business">Business</option>
              <option value="Individual">Individual</option>
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">GST</span>
            <select
              value={gstFilter}
              onChange={(e) => setGstFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All treatments</option>
              <option value="Registered - Regular">Registered — Regular</option>
              <option value="Registered - Composition">Registered — Composition</option>
              <option value="Unregistered">Unregistered</option>
              <option value="Consumer">Consumer</option>
              <option value="Overseas / Export">Overseas / Export</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-subtle btn-reset-filters"
              onClick={handleResetFilters}
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </section>

      {error ? (
        <ErrorState
          title="Couldn’t load clients"
          message={error}
          onRetry={() => fetchClients(pagination.currentPage)}
        />
      ) : (
      <div className="clients-table-card saas-card">
        <div className="table-responsive">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Business</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GST</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9}>
                      <div className="skeleton-box client-row-skeleton" />
                    </td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="clients-empty-cell">
                    <EmptyState
                      icon={Inbox}
                      title="No clients found"
                      description={
                        hasActiveFilters
                          ? 'Try clearing search or filters.'
                          : 'No onboarding submissions yet.'
                      }
                      action={
                        hasActiveFilters ? (
                          <Button type="button" variant="secondary" onClick={handleResetFilters}>
                            Clear filters
                          </Button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const dateStr = client.submittedAt
                    ? new Date(client.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '—';

                  const isGstRegistered =
                    client.taxAndAddressDetails?.gstTreatment === 'Registered - Regular' ||
                    client.taxAndAddressDetails?.gstTreatment === 'Registered - Composition';

                  return (
                    <tr
                      key={client._id}
                      className="client-table-row"
                      onClick={() => navigate(`/admin/clients/${client._id}`)}
                    >
                      <td className="font-mono font-bold text-accent">
                        {client.referenceId}
                      </td>
                      <td>
                        <span className="font-semibold text-primary client-name-cell">
                          {client.customerDetails?.businessLegalName || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="type-badge">
                          {client.customerDetails?.customerType || '—'}
                        </span>
                      </td>
                      <td className="client-email-cell">
                        {client.contactDetails?.email ? (
                          <span className="email-chip" title={client.contactDetails.email}>
                            {client.contactDetails.email}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="font-mono text-secondary text-sm">
                        {client.contactDetails?.phone || '—'}
                      </td>
                      <td>
                        {isGstRegistered ? (
                          <span
                            className="gst-reg-pill"
                            title={`GSTIN: ${client.taxAndAddressDetails?.gstin || ''}`}
                          >
                            {client.taxAndAddressDetails?.gstin ? 'GSTIN' : 'Registered'}
                          </span>
                        ) : (
                          <span className="gst-unreg-pill">
                            {client.taxAndAddressDetails?.gstTreatment || '—'}
                          </span>
                        )}
                      </td>
                      <td className="text-secondary text-sm">{dateStr}</td>
                      <td>
                        <span className={`badge badge-${client.status}`}>
                          {client.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-subtle btn-inspect-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/clients/${client._id}`);
                          }}
                          aria-label={`Open record ${client.referenceId}`}
                        >
                          <Eye size={15} />
                          <span>Open</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info-text">
            Showing{' '}
            <strong>
              {pagination.totalRecords === 0
                ? 0
                : (pagination.currentPage - 1) * pagination.limit + 1}
            </strong>{' '}
           –
            <strong>
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalRecords
              )}
            </strong>{' '}
            of <strong>{pagination.totalRecords}</strong>
          </div>

          <div className="pagination-nav-group">
            <button
              type="button"
              className="btn btn-secondary btn-pagination"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <div className="page-number-list">
              {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.currentPage) <= 1
                  );
                })
                .map((p, index, array) => {
                  const prev = array[index - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="pagination-ellipsis">…</span>}
                      <button
                        type="button"
                        className={`page-num-btn ${pagination.currentPage === p ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                        disabled={loading}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-pagination"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
