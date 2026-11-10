import React from 'react';
import './EmptyState.css';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state" role="status">
    {Icon ? (
      <div className="empty-state-icon">
        <Icon size={22} strokeWidth={1.75} />
      </div>
    ) : null}
    <h3 className="empty-state-title">{title}</h3>
    {description ? <p className="empty-state-desc">{description}</p> : null}
    {action ? <div className="empty-state-action">{action}</div> : null}
  </div>
);
