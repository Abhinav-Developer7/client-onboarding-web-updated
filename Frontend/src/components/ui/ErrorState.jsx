import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import './ErrorState.css';

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again'
}) => (
  <div className="error-state glass-panel" role="alert">
    <div className="error-state-icon">
      <AlertCircle size={22} />
    </div>
    <h3 className="error-state-title">{title}</h3>
    {message ? <p className="error-state-message">{message}</p> : null}
    {onRetry ? (
      <Button type="button" variant="secondary" className="error-state-retry" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : null}
  </div>
);
