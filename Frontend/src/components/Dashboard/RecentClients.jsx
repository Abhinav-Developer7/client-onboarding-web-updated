import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Inbox, Eye } from 'lucide-react';
import './RecentClients.css';

export const RecentClients = ({ clients = [], loading = false, onSelectClient }) => {
  return (
    <div className="recent-card saas-card">
      <div className="recent-card-header">
        <div className="recent-header-text">
          <h2 className="recent-title">Recent Submissions</h2>
          <span className="recent-subtitle">Latest 5 client onboarding applications</span>
        </div>
        <Link to="/admin/clients" className="btn btn-secondary btn-view-all">
          <span>View All Clients</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="recent-table-wrapper">
        <table className="recent-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Business Legal Name</th>
              <th>Customer Type</th>
              <th>Primary Contact</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={7}>
                    <div className="skeleton-box recent-row-skeleton" />
                  </td>
                </tr>
              ))
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="recent-empty-cell">
                  <Inbox size={32} className="text-muted" />
                  <p>No recent submissions logged.</p>
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

                return (
                  <tr
                    key={client._id}
                    className="recent-table-row"
                    onClick={() => onSelectClient && onSelectClient(client)}
                  >
                    <td className="font-mono font-bold text-accent">
                      {client.referenceId}
                    </td>
                    <td className="font-semibold text-primary">
                      {client.customerDetails?.businessLegalName || '—'}
                    </td>
                    <td>
                      <span className="type-badge">
                        {client.customerDetails?.customerType || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-secondary text-sm">
                        {client.contactDetails?.email || client.contactDetails?.contactPerson || '—'}
                      </span>
                    </td>
                    <td className="text-secondary text-sm">
                      {dateStr}
                    </td>
                    <td>
                      <span className={`badge badge-${client.status}`}>
                        {client.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-subtle btn-row-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectClient) onSelectClient(client);
                        }}
                        aria-label={`View details for ${client.referenceId}`}
                      >
                        <Eye size={15} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

