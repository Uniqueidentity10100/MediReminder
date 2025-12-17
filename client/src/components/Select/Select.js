import React from 'react';
import './Select.css';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  id,
  name,
  placeholder,
  ...props
}) => {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="select-group">
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="required-mark" aria-label="required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={`select ${error ? 'select-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
