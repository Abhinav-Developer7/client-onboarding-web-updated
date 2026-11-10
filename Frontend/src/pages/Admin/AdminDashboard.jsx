import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { StatCard } from '../../components/Dashboard/StatCard';
import { MonthlyClientsChart } from '../../components/Dashboard/MonthlyClientsChart';
import { RecentClients } from '../../components/Dashboard/RecentClients';
import { SubmissionDetailModal } from '../../components/Admin/SubmissionDetailModal';
import {
  Users,
  Inbox,
  Clock,
  CheckCircle,
  ArrowRight,
  Building
} from 'lucide-react';
import { ErrorState } from '../../components/ui/ErrorState';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    counts: { total: 0, new: 0, under_review: 0, approved: 0, rejected: 0 },
    recentClients: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handleStatusUpdated = () => {
    fetchDashboardMetrics();
  };

  const latestPending =
    stats.recentClients?.find((c) => c.status === 'new' || c.status === 'under_review') ||
    stats.recentClients?.[0];

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-welcome-row">
        <div className="welcome-copy">
          <h1 className="welcome-heading display-title">Welcome back, {firstName}</h1>
          <p className="welcome-subheading">
            Review queue and onboarding volume at a glance.
          </p>
        </div>
        <Link to="/admin/clients" className="btn btn-primary dashboard-primary-cta">
          <span>Open clients</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {error && (
        <ErrorState
          title="Couldn’t load dashboard"
          message={error}
          onRetry={fetchDashboardMetrics}
        />
      )}

      <section className="dashboard-stats-grid" aria-label="Submission counts">
        <StatCard
          title="Total"
          value={stats.counts.total}
          icon={Users}
          colorClass="total"
          loading={loading}
          onClick={() => navigate('/admin/clients')}
        />
        <StatCard
          title="New"
          value={stats.counts.new}
          icon={Inbox}
          colorClass="new"
          loading={loading}
          onClick={() => navigate('/admin/clients')}
        />
        <StatCard
          title="Under review"
          value={stats.counts.under_review}
          icon={Clock}
          colorClass="review"
          loading={loading}
          onClick={() => navigate('/admin/clients')}
        />
        <StatCard
          title="Approved"
          value={stats.counts.approved}
          icon={CheckCircle}
          colorClass="approved"
          loading={loading}
          onClick={() => navigate('/admin/clients')}
        />
      </section>

      <section className="dashboard-chart-section" aria-label="Monthly onboarding chart">
        <MonthlyClientsChart data={stats.monthlyData} loading={loading} />
      </section>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-table-area">
          <RecentClients
            clients={stats.recentClients}
            loading={loading}
            onSelectClient={(client) => setSelectedClient(client)}
          />
        </div>

        {latestPending && (
          <aside className="spotlight-card saas-card">
            <div className="spotlight-header">
              <div className="spotlight-icon-circle">
                <Building size={18} className="text-accent" />
              </div>
              <span className="spotlight-tag">Needs attention</span>
            </div>

            <div className="spotlight-body">
              <h3 className="spotlight-company-name">
                {latestPending.customerDetails?.businessLegalName || 'Recent applicant'}
              </h3>
              <span className="spotlight-ref-id font-mono">
                {latestPending.referenceId}
              </span>
              <p className="spotlight-contact-text">
                {latestPending.contactDetails?.email || '—'}
              </p>
            </div>

            <div className="spotlight-footer">
              <span className={`badge badge-${latestPending.status}`}>
                {latestPending.status?.replace('_', ' ')}
              </span>
              <button
                type="button"
                className="btn btn-primary btn-spotlight-action"
                onClick={() => setSelectedClient(latestPending)}
              >
                <span>Inspect</span>
              </button>
            </div>
          </aside>
        )}
      </section>

      {selectedClient && (
        <SubmissionDetailModal
          submission={selectedClient}
          onClose={() => setSelectedClient(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};
