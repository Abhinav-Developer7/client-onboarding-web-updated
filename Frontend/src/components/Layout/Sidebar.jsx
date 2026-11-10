import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ExternalLink,
  X,
  Copy,
  Check
} from 'lucide-react';
import tortillonLogo from '../../assets/tortillon-logo.png';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  const onboardingUrl = `${window.location.origin}/onboarding`;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AU';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(onboardingUrl);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-container glass-bar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-row">
          <Link to="/admin/dashboard" className="sidebar-brand-link" onClick={onClose}>
            <img
              src={tortillonLogo}
              alt="Tortillon"
              className="brand-wordmark brand-wordmark-sm"
            />
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-profile-card">
          <div className="profile-avatar-circle">
            <span>{getInitials(user?.fullName)}</span>
          </div>
          <div className="profile-info-group">
            <span className="profile-display-name">{user?.fullName || 'Admin User'}</span>
            <span className="profile-handle">@{user?.email?.split('@')[0] || 'admin'}</span>
          </div>
          <span className="profile-role-pill">
            {user?.role === 'admin' ? 'Admin' : 'Staff'}
          </span>
        </div>

        <div className="sidebar-nav-wrapper">
          <div className="sidebar-nav-group">
            <span className="nav-group-heading">Navigate</span>
            <nav className="sidebar-nav-list">
              <NavLink
                to="/admin/dashboard"
                end
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-item-icon-box">
                  <LayoutDashboard size={18} />
                </div>
                <span className="nav-label">Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/clients"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-item-icon-box">
                  <Users size={18} />
                </div>
                <span className="nav-label">Clients</span>
              </NavLink>
            </nav>
          </div>

          <div className="sidebar-link-share">
            <span className="nav-group-heading">Onboarding link</span>
            <div className="link-share-row">
              <span className="link-share-url" title={onboardingUrl}>
                {onboardingUrl.replace(/^https?:\/\//, '')}
              </span>
              <button
                type="button"
                className={`link-share-btn ${copied ? 'is-copied' : ''}`}
                onClick={handleCopyLink}
                aria-label={copied ? 'Link copied' : 'Copy onboarding link'}
                title={copied ? 'Copied' : 'Copy link'}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={onboardingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-share-btn"
                aria-label="Open onboarding form in a new tab"
                title="Open in new tab"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <span className="link-share-hint" aria-live="polite">
              {copied ? 'Copied to clipboard' : 'Share with new clients'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
