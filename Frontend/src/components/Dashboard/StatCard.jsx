import React from 'react';
import './StatCard.css';

export const StatCard = ({ title, value, icon: Icon, colorClass = 'accent', onClick, isActive = false, loading = false }) => {
  return (
    <div
      className={`stat-card saas-card ${isActive ? 'active-stat' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon-wrapper ${colorClass}`}>
          {Icon && <Icon size={18} strokeWidth={2.2} />}
        </div>
      </div>

      <div className="stat-card-body">
        {loading ? (
          <div className="skeleton-box stat-skeleton" />
        ) : (
          <span className="stat-value">{value}</span>
        )}
      </div>
    </div>
  );
};

