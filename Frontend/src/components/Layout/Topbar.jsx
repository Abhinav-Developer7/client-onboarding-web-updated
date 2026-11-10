import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  LogOut,
  UserPlus
} from 'lucide-react';
import './Topbar.css';

export const Topbar = ({ onMenuToggle }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/clients/')) return 'Client Details';
    if (location.pathname === '/admin/clients') return 'Clients';
    return 'Dashboard';
  };

  return (
    <header className="topbar-container glass-bar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">Portal</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        <Link
          to="/onboarding"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary topbar-action-btn"
        >
          <UserPlus size={15} />
          <span>New Client</span>
        </Link>

        <button
          type="button"
          className="btn btn-subtle topbar-logout-btn"
          onClick={logout}
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="logout-text">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
