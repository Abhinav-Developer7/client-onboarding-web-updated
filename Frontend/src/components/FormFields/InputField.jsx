import React from 'react';
import './InputField.css';

export const InputField = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  error = null,
  helperText = '',
  register,
  value,
  onChange,
  className = '',
  disabled = false,
  autoComplete = 'off',
  ...rest
}) => {
  const registerProps = register ? register(name) : { value, onChange };

  return (
    <div className={`form-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="form-input"
        {...registerProps}
        {...rest}
      />
      {helperText && !error && <span className="form-helper-text">{helperText}</span>}
      {error && <span className="form-error-message">{error}</span>}
    </div>
  );
};

