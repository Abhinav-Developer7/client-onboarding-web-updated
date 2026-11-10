import React from 'react';
import './Button.css';

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  isLoading = false,
  disabled = false,
  ...rest
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    isLoading ? 'is-loading' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      <span className="btn-label">{children}</span>
      <span className="btn-loader-arc" aria-hidden="true" />
    </button>
  );
};
