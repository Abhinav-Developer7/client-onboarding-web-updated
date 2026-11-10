import React from 'react';
import './SelectField.css';

export const SelectField = ({
  label,
  name,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error = null,
  helperText = '',
  register,
  value,
  onChange,
  className = '',
  disabled = false,
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
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          disabled={disabled}
          className="form-select"
          {...registerProps}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      </div>
      {helperText && !error && <span className="form-helper-text">{helperText}</span>}
      {error && <span className="form-error-message">{error}</span>}
    </div>
  );
};

